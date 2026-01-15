from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import settings
from app.core.jwt_utils import decode_access_token
from app.core.db import get_db
from app.models.project import Project


dashboard_security = HTTPBearer(auto_error=False)


def get_current_project_from_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(dashboard_security),
    db: Session = Depends(get_db),
) -> Project:
    """
    Dependency that authenticates a project using a JWT access token.

    Used for dashboard-style APIs where the caller logs in with
    project name + password and receives a JWT.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
        )

    token = credentials.credentials
    payload = decode_access_token(
        token,
        secret_key=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

    if not payload or "project_id" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    project_id = payload["project_id"]
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Project not found for token",
        )

    return project


