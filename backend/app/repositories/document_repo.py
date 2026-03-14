"""Document repository."""

from __future__ import annotations

from pathlib import Path

from app.repositories.json_store import JsonStore


class DocumentRepo:
    TABLE = "documents"

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
            "document_type": data["document_type"],
            "filename": data.get("filename") or Path(data["storage_path"]).name,
            "storage_path": data["storage_path"],
            "state": data.get("state", "pending"),
            "uploaded_by": data.get("uploaded_by"),
            "uploaded_at": data.get("uploaded_at", self.store.utcnow()),
            "verified_by": data.get("verified_by"),
            "verified_at": data.get("verified_at"),
        }
        return self.store.insert(self.TABLE, payload)

    async def find_by_id(self, document_id: str) -> dict | None:
        return next(
            (item for item in self.store.load(self.TABLE) if item.get("id") == document_id),
            None,
        )

    async def update(self, document_id: str, updates: dict) -> dict | None:
        return self.store.update(self.TABLE, document_id, updates, id_field="id")
