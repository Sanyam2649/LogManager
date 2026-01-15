from datetime import datetime, timezone
from typing import List, Optional
import re

from app.schemas.ingest import LogIngestRequest
from app.models.project import Project
from app.models.log_category import LogCategory


# ---- Normalization helpers ----

LEVEL_MAP = {
    "info": "INFO",
    "warn": "WARN",
    "warning": "WARN",
    "error": "ERROR",
}


def normalize_level(level: str) -> str:
    return LEVEL_MAP.get(level.lower(), "INFO")


def normalize_timestamp(ts: Optional[datetime]) -> datetime:
    if ts:
        return ts.astimezone(timezone.utc)
    return datetime.now(timezone.utc)


# ---- Categorization helpers ----

AUTH_KEYWORDS = ("auth", "token", "login", "signup")
DB_KEYWORDS = ("db", "sql", "database", "query")


def system_categorize(level: str, message: str) -> str:
    msg = message.lower()

    if level == "ERROR":
        return "ERROR"

    if any(k in msg for k in AUTH_KEYWORDS):
        return "AUTH"

    if any(k in msg for k in DB_KEYWORDS):
        return "DB"

    return "GENERAL"


def apply_user_rules(
    message: str,
    level: str,
    user_categories: List[LogCategory],
) -> Optional[int]:
    """
    MVP behavior:
    - If category name appears in message → match
    """
    msg = message.lower()

    for category in user_categories:
        if category.name.lower() in msg:
            return category.id

    return None


# ---- Main processor ----

def process_logs(
    payload: LogIngestRequest,
    project: Project,
    user_categories: List[LogCategory],
) -> List[dict]:
    """
    Returns normalized + categorized log dicts.
    No DB writes.
    """

    processed_logs = []

    for log in payload.logs:
        level = normalize_level(log.level)
        timestamp = normalize_timestamp(log.timestamp)

        category_id = apply_user_rules(
            message=log.message,
            level=level,
            user_categories=user_categories,
        )

        if category_id is None:
            system_category_name = system_categorize(level, log.message)
            # category_id resolution happens later (DB lookup)
            category_id = system_category_name

        processed_logs.append({
            "project_id": project.id,
            "timestamp": timestamp,
            "level": level,
            "service": payload.service,
            "environment": payload.environment,
            "message": log.message,
            "meta": log.meta,
            "category": category_id,  # name for now
        })

    return processed_logs
