from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class LogItem(BaseModel):
    timestamp: Optional[datetime] = None
    level: str = Field(..., examples=["ERROR"])
    message: str = Field(..., examples=["Invalid token"])
    meta: Optional[Dict[str, Any]] = None
