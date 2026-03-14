"""Announcement service."""

from __future__ import annotations

from app.repositories.announcement_repo import AnnouncementRepo


class AnnouncementService:
    def __init__(self) -> None:
        self.repo = AnnouncementRepo()

    async def list_announcements(self, case_id: str) -> list:
        return await self.repo.find_by_case(case_id)

    async def create_announcement(self, data, posted_by: str | None = None) -> dict:
        payload = data.model_dump(exclude_none=True) if hasattr(data, "model_dump") else dict(data)
        user_id = posted_by.id if hasattr(posted_by, "id") else posted_by
        return await self.repo.insert({**payload, "posted_by": user_id})
