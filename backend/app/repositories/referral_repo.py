"""Referral repository."""

from __future__ import annotations

from app.repositories.json_store import JsonStore


class ReferralRepo:
    TABLE = "referrals"

    def __init__(self, store: JsonStore | None = None) -> None:
        self.store = store or JsonStore()

    async def find_by_case(self, case_id: str) -> list[dict]:
        return [
            item for item in self.store.load(self.TABLE)
            if item.get("case_id") == case_id
        ]

    async def insert(self, data: dict) -> dict:
        payload = {
            "id": self.store.next_uuid(),
            "case_id": data["case_id"],
            "referral_type": data["referral_type"],
            "from_agency": data.get("from_agency"),
            "to_agency": data.get("to_agency"),
            "reason": data.get("reason"),
            "description": data.get("description") or data.get("reason"),
            "partner_id": data.get("partner_id") or data.get("to_agency"),
            "status": data.get("status", "open"),
            "created_by": data.get("created_by"),
            "created_at": self.store.utcnow(),
        }
        return self.store.insert(self.TABLE, payload)

    async def find_by_id(self, referral_id: str) -> dict | None:
        return next(
            (item for item in self.store.load(self.TABLE) if item.get("id") == referral_id),
            None,
        )

    async def update(self, referral_id: str, updates: dict) -> dict | None:
        return self.store.update(self.TABLE, referral_id, updates, id_field="id")
