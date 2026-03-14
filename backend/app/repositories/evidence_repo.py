"""Evidence repository."""

from __future__ import annotations

from app.repositories.json_store import JsonStore


class EvidenceRepo:
    TABLE = "evidence"

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
            "evidence_type": data["evidence_type"],
            "trust_class": data.get("trust_class", "self_declared"),
            "source": data.get("source"),
            "details": data.get("details", {}),
            "review_status": data.get("review_status", "pending"),
            "created_at": self.store.utcnow(),
        }
        return self.store.insert(self.TABLE, payload)

    async def find_by_id(self, evidence_id: str) -> dict | None:
        return next(
            (item for item in self.store.load(self.TABLE) if item.get("id") == evidence_id),
            None,
        )

    async def update(self, evidence_id: str, updates: dict) -> dict | None:
        return self.store.update(self.TABLE, evidence_id, updates, id_field="id")
