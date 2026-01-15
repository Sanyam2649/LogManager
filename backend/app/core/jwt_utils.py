from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt


def create_access_token(
    data: Dict[str, Any],
    secret_key: str,
    algorithm: str = "HS256",
    expires_minutes: int = 1440,
) -> str:
    """
    Create a signed JWT access token.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt


def decode_access_token(
    token: str,
    secret_key: str,
    algorithm: str = "HS256",
) -> Optional[Dict[str, Any]]:
    """
    Decode and validate a JWT access token.
    Returns the decoded payload if valid, otherwise ``None``.
    """
    try:
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        return payload
    except jwt.PyJWTError:
        return None


