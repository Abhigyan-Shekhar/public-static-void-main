"""Score repository."""

from __future__ import annotations

from datetime import datetime

from app.repositories.json_store import JsonStore


class ScoreRepo:
    TABLE = "scores"

    def __init__(self, store: JsonStore | None = None) -> None:
        self.store = store or JsonStore()

    async def find_by_case(self, case_id: str) -> list[dict]:
        scores = [
            item for item in self.store.load(self.TABLE)
            if item.get("case_id") == case_id
        ]
        return sorted(
            scores,
            key=lambda item: item.get("computed_at") or item.get("created_at") or datetime.min.isoformat(),
        )

    async def find_latest(self, case_id: str) -> dict | None:
        scores = [
            item for item in self.store.load(self.TABLE)
            if item.get("case_id") == case_id
        ]
        if not scores:
            return None

        return max(
            scores,
            key=lambda item: item.get("computed_at") or datetime.min.isoformat(),
        )

    async def insert(self, data: dict) -> dict:
        payload = {
            "id": self.store.next_uuid(),
            "case_id": data["case_id"],
            "predicted_score": float(data["predicted_score"]),
            "confidence_band": data["confidence_band"],
            "top_factors": data.get("top_factors", []),
            "blocking_constraints": data.get("blocking_constraints", []),
            "model_version": data.get("model_version", "rule-based-v1"),
            "model_name": data.get("model_name", data.get("model_version", "rule-based-v1")),
            "feature_snapshot": data.get("feature_snapshot", {}),
            "computed_at": data.get("computed_at", self.store.utcnow()),
            "created_at": data.get("created_at", self.store.utcnow()),
        }
        return self.store.insert(self.TABLE, payload)
