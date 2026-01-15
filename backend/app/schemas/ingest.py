from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.log import LogItem

class LogIngestRequest(BaseModel):
    service: Optional[str] = Field(None, examples=["auth-service"])
    environment: Optional[str] = Field(None, examples=["production"])
    logs: List[LogItem] = Field(..., min_items=1)
