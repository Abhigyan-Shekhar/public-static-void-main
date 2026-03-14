# backend/app/schemas/audit_log.py
from pydantic import BaseModel, ConfigDict
from typing import Any, Optional

class AuditLogBase(BaseModel):
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    detail: dict[str, Any] = {}

class AuditLogCreate(AuditLogBase):
    actor_id: Optional[str] = None
    role: Optional[str] = None

class AuditLog(AuditLogBase):
    id: str
    actor_id: Optional[str] = None
    role: Optional[str] = None
    timestamp: str

    model_config = ConfigDict(from_attributes=True)
