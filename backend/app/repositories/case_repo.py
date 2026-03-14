"""Case repository backed by local JSON seed data."""

from __future__ import annotations

from app.repositories.json_store import JsonStore


class CaseRepo:
    TABLE = "cases"

    def __init__(self, store: JsonStore | None = None) -> None:
        self.store = store or JsonStore()

    async def find_all(self, status: str | None = None, search: str | None = None) -> list[dict]:
        cases = self.store.load(self.TABLE)

        if status:
            cases = [item for item in cases if item.get("status") == status]

        if search:
            needle = search.lower()
            cases = [
                item for item in cases
                if needle in item.get("case_code", "").lower()
                or needle in item.get("person", {}).get("name", "").lower()
            ]

        return cases

    async def find_by_id(self, case_id: str) -> dict | None:
        return next(
            (item for item in self.store.load(self.TABLE) if item.get("case_id") == case_id),
            None,
        )

    async def insert(self, data: dict) -> dict:
        cases = self.store.load(self.TABLE)
        next_code = self._next_case_code(cases)
        case_id = self.store.next_uuid()
        payload = {
            "id": case_id,          # alias so tests using res["id"] work
            "case_id": case_id,
            "case_code": next_code,
            "status": data.get("status", "intake"),
            "person": data.get("person", {}),
            "created_by": data.get("created_by"),
            "created_at": self.store.utcnow(),
            "updated_at": self.store.utcnow(),
        }
        return self.store.insert(self.TABLE, payload)

    def _next_case_code(self, cases: list[dict]) -> str:
        suffixes = []
        for item in cases:
            code = item.get("case_code", "")
            if code.startswith("BB-"):
                try:
                    suffixes.append(int(code.split("-")[1]))
                except (IndexError, ValueError):
                    continue
        next_value = max(suffixes, default=1000) + 1
        return f"BB-{next_value:04d}"

    async def update_status(self, case_id: str, new_status: str) -> dict | None:
        return self.store.update(
            self.TABLE,
            case_id,
            {"status": new_status, "updated_at": self.store.utcnow()},
            id_field="case_id",
        )
