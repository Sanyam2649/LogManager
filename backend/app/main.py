import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.logs import router as logs_router
from app.api.projects import router as projects_router
from app.api.admin_auth import router as admin_router
from app.api.admin_project import router as admin_project_router
from app.models import Base
from app.database import engine
from app.config import settings

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bcube Logger API",
    description="API for managing BCube Logger projects, logs, and admin operations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
frontend_url = settings.frontend_url


app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=False,  # JWT in headers
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(projects_router)
app.include_router(logs_router)
app.include_router(admin_router)
app.include_router(admin_project_router)

@app.get("/health")
def health():
    return {"status": "ok"}
