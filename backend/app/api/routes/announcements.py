from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.core.security import User
from app.schemas.announcement import Announcement, AnnouncementCreate
from app.services.announcement_service import AnnouncementService

router = APIRouter(tags=["announcements"])
announcement_service = AnnouncementService()

@router.post("/announcements", response_model=Announcement)
async def create_announcement(
    ann_in: AnnouncementCreate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await announcement_service.create_announcement(
        ann_in.model_dump(exclude_none=True),
        posted_by=current_user.id,
    )

@router.get("/cases/{case_id}/announcements", response_model=list[dict])
async def get_case_announcements(
    case_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await announcement_service.list_announcements(case_id)
