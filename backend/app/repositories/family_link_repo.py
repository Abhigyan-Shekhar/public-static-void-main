"""Family link repository."""

from __future__ import annotations

from app.repositories.json_store import JsonStore


class FamilyLinkRepo:
    TABLE = "family_links"

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
            "person_id": data["person_id"],
            "related_person_id": data.get("related_person_id"),
            "relation_type": data["relation_type"],
            "link_status": data.get("link_status", "declared"),
            "source_evidence_id": data.get("source_evidence_id"),
            "created_at": data.get("created_at", self.store.utcnow()),
        }
        return self.store.insert(self.TABLE, payload)

    async def find_by_id(self, link_id: str) -> dict | None:
        return next(
            (item for item in self.store.load(self.TABLE) if item.get("id") == link_id),
            None,
        )

    async def update(self, link_id: str, updates: dict) -> dict | None:
        return self.store.update(self.TABLE, link_id, updates, id_field="id")
