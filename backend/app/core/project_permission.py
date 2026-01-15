from fastapi import Depends, HTTPException, status
from app.models.project import Project
from app.core.dashboard_auth import get_current_project_from_jwt

def require_project_allowed(project: Project = Depends(get_current_project_from_jwt)) -> Project:
    """
    Dependency that ensures the project is allowed.
    """
    if not project.isAllowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Project is not allowed",
        )
    return project
