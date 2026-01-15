"""
Simple Python client utility for sending logs to the Bcube Logger backend.

You can copy this file into another project or install your backend package
and import ``send_log`` / ``send_logs`` from here.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, Iterable, List, Optional

import requests


@dataclass
class LogRecord:
    level: str
    message: str
    timestamp: Optional[datetime] = None
    meta: Optional[Dict[str, Any]] = None


@dataclass
class LogClient:
    """
    High-level client to send logs to the backend.

    Example:
        client = LogClient(
            base_url="http://localhost:8000",
            api_key="bcube_live_...",
            service="auth-service",
            environment="development",
        )
        client.send_log("ERROR", "Something went wrong", {"user_id": 123})
    """

    base_url: str
    api_key: str
    service: Optional[str] = None
    environment: Optional[str] = None
    timeout: int = 5
    _session: requests.Session = field(default_factory=requests.Session, init=False, repr=False)

    @property
    def _logs_endpoint(self) -> str:
        return self.base_url.rstrip("/") + "/api/v1/logs"

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def send_log(
        self,
        level: str,
        message: str,
        meta: Optional[Dict[str, Any]] = None,
        timestamp: Optional[datetime] = None,
        service: Optional[str] = None,
        environment: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Send a single log entry.
        """
        record = LogRecord(
            level=level,
            message=message,
            meta=meta,
            timestamp=timestamp,
        )
        return self.send_logs([record], service=service, environment=environment)

    def send_logs(
        self,
        logs: Iterable[LogRecord],
        service: Optional[str] = None,
        environment: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Send multiple log entries in a single request.
        """
        payload = {
            "service": service or self.service,
            "environment": environment or self.environment,
            "logs": [
                {
                    "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                    "level": log.level,
                    "message": log.message,
                    "meta": log.meta,
                }
                for log in logs
            ],
        }

        response = self._session.post(
            self._logs_endpoint,
            json=payload,
            headers=self._headers(),
            timeout=self.timeout,
        )
        response.raise_for_status()
        return response.json()


def send_log(
    base_url: str,
    api_key: str,
    level: str,
    message: str,
    meta: Optional[Dict[str, Any]] = None,
    timestamp: Optional[datetime] = None,
    service: Optional[str] = None,
    environment: Optional[str] = None,
    timeout: int = 5,
) -> Dict[str, Any]:
    """
    Convenience function to send a single log without instantiating ``LogClient``.
    """
    client = LogClient(
        base_url=base_url,
        api_key=api_key,
        service=service,
        environment=environment,
        timeout=timeout,
    )
    return client.send_log(
        level=level,
        message=message,
        meta=meta,
        timestamp=timestamp,
    )


def send_logs(
    base_url: str,
    api_key: str,
    logs: Iterable[LogRecord],
    service: Optional[str] = None,
    environment: Optional[str] = None,
    timeout: int = 5,
) -> Dict[str, Any]:
    """
    Convenience function to send multiple logs without instantiating ``LogClient``.
    """
    client = LogClient(
        base_url=base_url,
        api_key=api_key,
        service=service,
        environment=environment,
        timeout=timeout,
    )
    return client.send_logs(logs)


