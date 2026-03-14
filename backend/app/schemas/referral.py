# backend/app/schemas/referral.py
from pydantic import BaseModel, ConfigDict
from enum import Enum
from typing import Optional

class ReferralType(str, Enum):
    REFERRAL = "referral"
    CONSULTATION = "consultation"
    TRANSFER = "transfer"
    NOTIFICATION = "notification"
    EMPLOYMENT = "employment"
    HOUSING = "housing"
    EDUCATION = "education"
    LEGAL_AID = "legal_aid"
    HEALTHCARE = "healthcare"
    LANGUAGE = "language"

class ReferralStatus(str, Enum):
    OPEN = "open"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    COMPLETED = "completed"

class ReferralBase(BaseModel):
    case_id: str
    referral_type: ReferralType
    from_agency: Optional[str] = None
    to_agency: Optional[str] = None
    reason: Optional[str] = None

class ReferralCreate(ReferralBase):
    pass

class ReferralUpdate(BaseModel):
    status: ReferralStatus

class Referral(ReferralBase):
    id: str
    status: ReferralStatus = ReferralStatus.OPEN
    created_by: Optional[str] = None
    created_at: str

    model_config = ConfigDict(from_attributes=True)
