from pydantic import BaseModel, EmailStr


class AdminCreateRequest(BaseModel):
    email: EmailStr
    password: str

class AdminResponse(BaseModel):
    id: int
    email: str

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
