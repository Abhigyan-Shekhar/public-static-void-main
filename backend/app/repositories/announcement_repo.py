"""Announcement repository."""

from __future__ import annotations

from app.repositories.json_store import JsonStore


class AnnouncementRepo:
    TABLE = "announcements"

    def __init__(self, store: JsonStore | None = None) -> None:
        self.store = store or JsonStore()

    async def find_by_case(self, case_id: str) -> list[dict]:
        announcements = self.store.load(self.TABLE)
        return [
            item for item in announcements
            if item.get("target_case_id") in (None, case_id)
        ]

    async def insert(self, data: dict) -> dict:
        payload = {
            "id": self.store.next_uuid(),
            "announcement_type": data.get("announcement_type", "screening_update"),
            "title": data["title"],
            "body": data["body"],
            "target_case_id": data.get("target_case_id"),
            "target_location": data.get("target_location"),
            "target_status": data.get("target_status"),
            "posted_by": data.get("posted_by"),
            "created_at": self.store.utcnow(),
        }
        return self.store.insert(self.TABLE, payload)
