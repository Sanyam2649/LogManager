from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from sqlalchemy import or_, cast, String

from app.core.auth import get_current_project
from app.core.db import get_db
from app.core.dashboard_auth import get_current_project_from_jwt
from app.schemas.ingest import LogIngestRequest
from app.models.log_entry import LogEntry
from app.models.project import Project
from app.models.log_category import LogCategory
from app.services.log_processor import process_logs
from app.services.log_writer import resolve_category_ids, bulk_insert_logs
from app.services.category_seeder import seed_system_categories


router = APIRouter(prefix="/api/v1/logs", tags=["Logs"])

@router.post("", status_code=status.HTTP_202_ACCEPTED)
def ingest_logs(
    payload: LogIngestRequest,
    project: Project = Depends(get_current_project),
    db: Session = Depends(get_db),
):
    seed_system_categories(db, project.id)

    categories = (
        db.query(LogCategory)
        .filter(LogCategory.project_id == project.id)
        .all()
    )

    processed_logs = process_logs(
        payload=payload,
        project=project,
        user_categories=categories,
    )

    if not processed_logs:
        return {"message": "No logs to insert", "count": 0}

    project_id = processed_logs[0]["project_id"]

    resolve_category_ids(db, project.id, processed_logs)

    inserted_count = bulk_insert_logs(db, project_id, processed_logs)

    return {
        "message": f"Successfully ingested {inserted_count} logs",
        "count": inserted_count,
    }

@router.get("/dashboard")
def get_logs_dashboard(
    project: Project = Depends(get_current_project_from_jwt),
    db: Session = Depends(get_db),

    level: Optional[str] = None,
    category: Optional[str] = None,
    service: Optional[str] = None,

    from_ts: Optional[datetime] = Query(None, alias="from"),
    to_ts: Optional[datetime] = Query(None, alias="to"),

    search: Optional[str] = None,

    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    query = (
        db.query(LogEntry)
        .filter(LogEntry.project_id == project.id)
    )

    if level:
        query = query.filter(LogEntry.level == level.upper())

    if service:
        query = query.filter(LogEntry.service == service)

    if from_ts:
        query = query.filter(LogEntry.timestamp >= from_ts)

    if to_ts:
        query = query.filter(LogEntry.timestamp <= to_ts)

    if category:
        query = (
            query.join(LogCategory)
            .filter(LogCategory.name == category)
        )

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                LogEntry.message.ilike(term),
                cast(LogEntry.meta, String).ilike(term),
            )
        )

    total = query.count()

    logs = (
        query
        .order_by(LogEntry.timestamp.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": [
            {
                "id": log.id,
                "timestamp": log.timestamp,
                "level": log.level,
                "service": log.service,
                "environment": log.environment,
                "message": log.message,
                "category_id": log.category_id,
                "meta": log.meta,
            }
            for log in logs
        ],
    }

@router.get("/categories")
def get_log_categories(
    project: Project = Depends(get_current_project_from_jwt),
    db: Session = Depends(get_db),
):
    categories = (
        db.query(LogCategory)
        .filter(LogCategory.project_id == project.id)
        .all()
    )

    return {
        "items": [
            {
                "id": cat.id,
                "name": cat.name,
                "is_system": cat.is_system,
            }
            for cat in categories
        ]
    }

@router.get("/search")
def search_logs(
    q: str = Query(..., min_length=1),
    project: Project = Depends(get_current_project_from_jwt),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    term = f"%{q}%"

    query = (
        db.query(LogEntry)
        .filter(LogEntry.project_id == project.id)
        .filter(
            or_(
                cast(LogEntry.id, String).ilike(term),
                LogEntry.message.ilike(term),
                LogEntry.service.ilike(term),
                LogEntry.environment.ilike(term),
                LogEntry.level.ilike(term),
                cast(LogEntry.meta, String).ilike(term),
            )
        )
    )

    total = query.count()

    logs = (
        query
        .order_by(LogEntry.timestamp.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    return {
        "total": total,
        "items": [
            {
                "id": log.id,
                "timestamp": log.timestamp,
                "level": log.level,
                "service": log.service,
                "environment": log.environment,
                "message": log.message,
                "category_id": log.category_id,
                "meta": log.meta,
            }
            for log in logs
        ],
    }


@router.delete("/bulk/by-timezone", status_code=status.HTTP_204_NO_CONTENT)
def delete_logs_by_timezone(
    timezone_offset: str = Query(..., examples=["+05:30"]),
    project: Project = Depends(get_current_project_from_jwt),
    db: Session = Depends(get_db),
):
    (
        db.query(LogEntry)
        .filter(
            LogEntry.project_id == project.id,
            cast(LogEntry.timestamp, String).like(f"%{timezone_offset}")
        )
        .delete(synchronize_session=False)
    )

    db.commit()
    return

@router.get("/{log_id}")
def get_log(
    log_id: int,
    project: Project = Depends(get_current_project_from_jwt),
    db: Session = Depends(get_db),
):
    log = (
        db.query(LogEntry)
        .filter(
            LogEntry.id == log_id,
            LogEntry.project_id == project.id,
        )
        .first()
    )

    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    return {
        "id": log.id,
        "timestamp": log.timestamp,
        "level": log.level,
        "service": log.service,
        "environment": log.environment,
        "message": log.message,
        "category_id": log.category_id,
        "meta": log.meta,
    }

@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_log(
    log_id: int,
    project: Project = Depends(get_current_project_from_jwt),
    db: Session = Depends(get_db),
):
    log = (
        db.query(LogEntry)
        .filter(
            LogEntry.id == log_id,
            LogEntry.project_id == project.id,
        )
        .first()
    )

    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    db.delete(log)
    db.commit()
    return
