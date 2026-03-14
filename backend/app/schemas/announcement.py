from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TargetType(str, Enum):
    CASE = "case"
    FAMILY = "family"
    LOCATION = "location"
    STATUS_GROUP = "status_group"
    SEGMENT = "segment"

class AnnouncementBase(BaseModel):
    title: str
    body: str
    announcement_type: str
    target_type: Optional[TargetType] = None
    target_ref: Optional[str] = None
    target_case_id: Optional[str] = None
    target_location: Optional[str] = None
    target_status: Optional[str] = None

class AnnouncementCreate(AnnouncementBase):
    pass

class Announcement(AnnouncementBase):
    id: str
    posted_by: Optional[str] = None
    created_at: str
    valid_until: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
