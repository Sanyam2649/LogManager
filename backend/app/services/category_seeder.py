from sqlalchemy.orm import Session

from app.models.log_category import LogCategory

SYSTEM_CATEGORIES = [
    "GENERAL",
    "ERROR",
    "AUTH",
    "DB",
    "API",
]


def seed_system_categories(
    db: Session,
    project_id: int,
) -> None:
    """
    Ensures system categories exist for a project.
    Safe to call multiple times.
    """

    existing = (
        db.query(LogCategory.name)
        .filter(
            LogCategory.project_id == project_id,
            LogCategory.is_system.is_(True),
        )
        .all()
    )

    existing_names = {row[0] for row in existing}

    missing = [
        LogCategory(
            project_id=project_id,
            name=name,
            is_system=True,
        )
        for name in SYSTEM_CATEGORIES
        if name not in existing_names
    ]

    if missing:
        db.bulk_save_objects(missing)
        db.commit()
