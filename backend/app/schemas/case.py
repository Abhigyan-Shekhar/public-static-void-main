from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, model_validator

from app.schemas.person import PersonCreate

class CaseStatus(str, Enum):
    INTAKE_CREATED = "intake_created"
    EVIDENCE_PENDING = "evidence_pending"
    PROVISIONAL_IDENTITY = "provisional_identity"
    REVIEW_REQUIRED = "review_required"
    VERIFIED_FOR_HANDOFF = "verified_for_handoff"
    REFERRED = "referred"
    SERVICE_IN_PROGRESS = "service_in_progress"

class CaseBase(BaseModel):
    intake_location: Optional[str] = None
    owner_agency: Optional[str] = None

class CaseCreate(CaseBase):
    person: Optional[PersonCreate] = None
    person_id: Optional[str] = None
    status: CaseStatus = CaseStatus.INTAKE_CREATED

    @model_validator(mode="after")
    def validate_person_source(self) -> "CaseCreate":
        if self.person is None and self.person_id is None:
            raise ValueError("Provide one of person or person_id")
        return self

class Case(CaseBase):
    id: str
    person_id: str
    case_code: str
    current_status: CaseStatus = CaseStatus.INTAKE_CREATED
    opened_at: str
    closed_at: Optional[str] = None
    created_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
