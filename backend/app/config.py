from pydantic_settings import BaseSettings
from fastapi.security import OAuth2PasswordBearer


class Settings(BaseSettings):
    app_env: str
    database_url: str
    jwt_secret_key: str = "change_me_in_production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expires_minutes: int = 60

    class Config:
        env_file = ".env"


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/admin/login")
settings = Settings()
