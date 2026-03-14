"""Audit log repository."""

from __future__ import annotations

from app.repositories.json_store import JsonStore


class AuditRepo:
    TABLE = "audit_log"

    def __init__(self, store: JsonStore | None = None) -> None:
        self.store = store or JsonStore()

    async def log_action(
        self,
        action: str,
        user: str | None,
        case_id: str,
        details: dict | None = None,
    ) -> dict:
        payload = {
            "id": self.store.next_uuid(),
            "action": action,
            "user_id": user,
            "case_id": case_id,
            "details": details or {},
            "created_at": self.store.utcnow(),
        }
        return self.store.insert(self.TABLE, payload)

    async def get_log(self, case_id: str) -> list[dict]:
        entries = [
            item for item in self.store.load(self.TABLE)
            if item.get("case_id") == case_id
        ]
        return sorted(entries, key=lambda item: item.get("created_at", ""))
