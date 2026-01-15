from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


class ProjectCreateRequest(BaseModel):
    name: str = Field(..., examples=["my-service"])
    username: str = Field(..., examples=["TestUser"])
    email: EmailStr = Field(..., examples=["user@myservice.com"])
    phone: str | None = Field(None, examples=["+91-9876543210"])
    password: str = Field(..., min_length=6, examples=["strong-password"])


class ProjectUpdateRequest(BaseModel):
    name: str | None = None
    username: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    isAllowed: bool


class ProjectResponse(BaseModel):
    id: int
    name: str
    username : str
    email: str
    phone: str | None
    api_key: str
    created_at: datetime
    isAllowed: bool


class ProjectLoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    project: ProjectResponse
