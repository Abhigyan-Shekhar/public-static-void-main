# backend/app/schemas/family_link.py
from pydantic import BaseModel, ConfigDict
from enum import Enum
from typing import Optional

class LinkStatus(str, Enum):
    DECLARED = "declared"
    CANDIDATE_MATCH = "candidate_match"
    VERIFIED = "verified"
    DISPUTED = "disputed"

class FamilyLinkBase(BaseModel):
    case_id: str
    person_id: str
    related_person_id: Optional[str] = None
    relation_type: str

class FamilyLinkCreate(FamilyLinkBase):
    pass

class FamilyLinkReview(BaseModel):
    link_status: LinkStatus

class FamilyLink(FamilyLinkBase):
    id: str
    link_status: LinkStatus = LinkStatus.DECLARED
    source_evidence_id: Optional[str] = None
    created_at: str

    model_config = ConfigDict(from_attributes=True)
