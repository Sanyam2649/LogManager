from hashlib import sha256
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.jwt_utils import create_access_token
from app.models.admin import Admin
from app.schemas.admin import AdminLoginRequest, AdminTokenResponse, AdminCreateRequest, AdminResponse
from app.config import settings
from app.core.db import get_db
router = APIRouter(prefix="/api/v1/admin", tags=["Admin Auth"])

def _hash(password: str) -> str:
    return sha256(password.encode()).hexdigest()


@router.post("/create", response_model=AdminResponse)
def create_admin(payload: AdminCreateRequest, db: Session = Depends(get_db)):
    # ensure email is unique
    if db.query(Admin).filter(Admin.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    admin = Admin(
        email=payload.email,
        password_hash=_hash(payload.password),
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

@router.post("/login", response_model=AdminTokenResponse)
def admin_login(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == payload.email).first()

    if not admin or admin.password_hash != _hash(payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        data={
            "admin_id": admin.id,
            "role": "admin",
        },
        secret_key=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
        expires_minutes=settings.jwt_access_token_expires_minutes,
    )

    return AdminTokenResponse(access_token=token)
