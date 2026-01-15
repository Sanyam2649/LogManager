from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.jwt_utils import decode_access_token
from app.models.admin import Admin
from app.config import settings, oauth2_scheme

def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Admin:
    payload = decode_access_token(token, settings.jwt_secret_key)

    if payload.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    admin = db.query(Admin).filter(Admin.id == payload["admin_id"]).first()
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid token")

    return admin
