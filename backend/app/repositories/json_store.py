"""Shared JSON-backed persistence for local development and demo data."""

from __future__ import annotations

import json
from json import JSONDecodeError
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4


REPO_ROOT = Path(__file__).resolve().parents[3]
SEED_DIR = REPO_ROOT / "data" / "seed"

FILE_MAP = {
    "profiles": "profiles.json",
    "persons": "persons.json",
    "cases": "cases.json",
    "evidence": "evidence_items.json",
    "family_links": "family_links.json",
    "documents": "documents.json",
    "announcements": "announcements.json",
    "referrals": "referrals.json",
    "scores": "score_snapshots.json",
    "audit_log": "audit_logs.json",
    "external_record_links": "external_record_links.json",
}


class JsonStore:
    """Tiny file-backed store used by the repo layer for demo persistence."""

    def __init__(self, seed_dir: Path | None = None) -> None:
        self.seed_dir = seed_dir or SEED_DIR

    def load(self, collection: str) -> list[dict[str, Any]]:
        path = self._path_for(collection)
        if not path.exists():
            return []

        try:
            with path.open("r", encoding="utf-8") as handle:
                data = json.load(handle)
        except JSONDecodeError:
            return []

        return data if isinstance(data, list) else []

    def save(self, collection: str, items: list[dict[str, Any]]) -> None:
        path = self._path_for(collection)
        path.parent.mkdir(parents=True, exist_ok=True)

        with path.open("w", encoding="utf-8") as handle:
            json.dump(items, handle, indent=2)

    def insert(self, collection: str, item: dict[str, Any]) -> dict[str, Any]:
        items = self.load(collection)
        payload = deepcopy(item)
        items.append(payload)
        self.save(collection, items)
        return payload

    def update(
        self,
        collection: str,
        item_id: str,
        updates: dict[str, Any],
        id_field: str = "id",
    ) -> dict[str, Any] | None:
        items = self.load(collection)
        for index, item in enumerate(items):
            if item.get(id_field) == item_id:
                updated = {**item, **deepcopy(updates)}
                items[index] = updated
                self.save(collection, items)
                return updated
        return None

    def next_uuid(self) -> str:
        return str(uuid4())

    def utcnow(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _path_for(self, collection: str) -> Path:
        filename = FILE_MAP.get(collection, f"{collection}.json")
        return self.seed_dir / filename
