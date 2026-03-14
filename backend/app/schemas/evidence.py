# backend/app/schemas/evidence.py
from pydantic import BaseModel, ConfigDict
from enum import Enum
from typing import Any, Optional

class EvidenceClass(str, Enum):
    OFFICIAL = "official"
    CORROBORATED = "corroborated"
    SELF_DECLARED = "self_declared"

class EvidenceState(str, Enum):
    PENDING = "pending" # pending_review in db schema context
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    DISPUTED = "disputed"

class EvidenceBase(BaseModel):
    case_id: str
    person_id: str
    evidence_class: EvidenceClass
    evidence_type: str
    payload: dict[str, Any] = {}

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceReview(BaseModel):
    state: EvidenceState

class Evidence(EvidenceBase):
    id: str
    state: EvidenceState = EvidenceState.PENDING
    source_actor_type: str
    source_user_id: Optional[str] = None
    submitted_at: str
    reviewed_at: Optional[str] = None
    reviewed_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
