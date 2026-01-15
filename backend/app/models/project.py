from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func

from app.models.base import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False, unique=True)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    api_key = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    isAllowed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
