# app/services/log_writer.py
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models.log_entry import LogEntry
from app.models.log_category import LogCategory


def resolve_category_ids(
    db: Session,
    project_id: int,
    logs: List[Dict[str, Any]],
) -> None:
    """
    Mutates logs in-place.
    Replaces category name with category_id.
    If category is missing or invalid, assigns DEFAULT_CATEGORY_ID.
    """

    # Collect all category names from logs that are strings
    category_names = {
        log["category"]
        for log in logs
        if isinstance(log.get("category"), str)
    }

    categories = []
    if category_names:
        categories = (
            db.query(LogCategory)
            .filter(
                LogCategory.project_id == project_id,
                LogCategory.name.in_(category_names),
            )
            .all()
        )

    # Map category names to IDs
    category_map = {c.name: c.id for c in categories}

    # Fallback category ID if none provided or not found
    DEFAULT_CATEGORY_ID = 1

    for log in logs:
        cat_value = log.get("category")

        if isinstance(cat_value, str):
            # Lookup category ID from map
            category_id = category_map.get(cat_value)
            if not category_id:
                raise RuntimeError(
                    f"Category '{cat_value}' not found for project {project_id}"
                )
            log["category_id"] = category_id

        elif isinstance(cat_value, int):
            # Already an ID, just use it
            log["category_id"] = cat_value

        else:
            # Missing or invalid category, use default
            log["category_id"] = DEFAULT_CATEGORY_ID

        # Remove original category key
        if "category" in log:
            del log["category"]


def bulk_insert_logs(
    db: Session,
    project_id: int,
    logs: List[Dict[str, Any]],
) -> int:
    """
    Inserts logs in bulk.
    Returns number of rows inserted.
    """

    if not logs:
        return 0

    # 🔑 REQUIRED: resolve category_id before insert
    resolve_category_ids(db, project_id, logs)

    db.bulk_insert_mappings(LogEntry, logs)
    db.commit()

    return len(logs)
