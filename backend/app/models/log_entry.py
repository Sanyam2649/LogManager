from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    JSON
)
from sqlalchemy.sql import func
from app.models.base import Base

class LogEntry(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("log_categories.id", ondelete="CASCADE"), nullable=False)

    timestamp = Column(DateTime(timezone=True), nullable=False)
    level = Column(String(10), nullable=False)

    service = Column(String(100), nullable=True)
    environment = Column(String(50), nullable=True)

    message = Column(String, nullable=False)
    meta = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
