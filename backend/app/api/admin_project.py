from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.admin_auth import get_current_admin
from app.models.project import Project
from app.schemas.project import ProjectResponse, ProjectUpdateRequest
from app.models.log_category import LogCategory

router = APIRouter(prefix="/api/v1/admin/projects", tags=["Admin Projects"])


# List all projects/users
@router.get("", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(Project).all()


# Get single project
@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# Update project details & permissions (isAllowed)
@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    payload: ProjectUpdateRequest,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Prevent duplicate emails/usernames
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


# Toggle project permission
@router.post("/{project_id}/allow")
def allow_project(project_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.isAllowed = True
    db.commit()
    return {"status": "allowed", "project_id": project_id}


@router.post("/{project_id}/disallow")
def disallow_project(project_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.isAllowed = False
    db.commit()
    return {"status": "disallowed", "project_id": project_id}

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # delete categories
    db.query(LogCategory).filter(
        LogCategory.project_id == project_id
    ).delete(synchronize_session=False)

    # delete project
    db.delete(project)
    db.commit()
