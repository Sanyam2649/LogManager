from hashlib import sha256

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.core.api_key import generate_api_key
from app.core.db import get_db
from app.core.jwt_utils import create_access_token
from app.models.project import Project
from app.schemas.project import (
    ProjectCreateRequest,
    ProjectUpdateRequest,
    ProjectLoginRequest,
    ProjectResponse,
    LoginResponse   
)

router = APIRouter(prefix="/api/v1/projects", tags=["Projects"])


def _hash_password(raw_password: str) -> str:
    return sha256(raw_password.encode("utf-8")).hexdigest()

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreateRequest,
    db: Session = Depends(get_db),
):
    # name must be unique
    if db.query(Project).filter(Project.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Project name already exists")

    # email must be unique
    if db.query(Project).filter(Project.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    # username must be unique
    if db.query(Project).filter(Project.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    project = Project(
        name=payload.name,
        username=payload.username,
        email=payload.email,
        phone=payload.phone,
        api_key=generate_api_key(),
        password_hash=_hash_password(payload.password),
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


# --------------------------------------------------
# LOGIN (name + email + password)
# --------------------------------------------------

@router.post("/login", response_model=LoginResponse)
def login_project(
    payload: ProjectLoginRequest,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.email == payload.email)
        .first()
    )

    if not project or project.password_hash != _hash_password(payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    access_token = create_access_token(
        data={"project_id": project.id},
        secret_key=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
        expires_minutes=settings.jwt_access_token_expires_minutes,
    )

    return {
        "access_token": access_token,
        "project": project,
    }


@router.get("", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    payload: ProjectUpdateRequest,
    db: Session = Depends(get_db),):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.email and payload.email != project.email:
        if db.query(Project).filter(Project.email == payload.email).first():
            raise HTTPException(status_code=400, detail="Email already exists")

    if payload.username and payload.username != project.username:
        if db.query(Project).filter(Project.username == payload.username).first():
            raise HTTPException(status_code=400, detail="Username already exists")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return
