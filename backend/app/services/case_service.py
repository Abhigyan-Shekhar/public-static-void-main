"""Case service — business logic for cases."""

from __future__ import annotations

from fastapi import HTTPException

from app.repositories.case_repo import CaseRepo
from app.repositories.score_repo import ScoreRepo


class CaseService:
    def __init__(self) -> None:
        self.case_repo = CaseRepo()
        self.score_repo = ScoreRepo()

    async def list_cases(self, status: str | None = None, search: str | None = None) -> list:
        cases = await self.case_repo.find_all(status=status, search=search)
        enriched = []
        for item in cases:
            latest = await self.score_repo.find_latest(item["case_id"])
            enriched.append(self._attach_latest_score(item, latest))
        return enriched

    async def get_case(self, case_id: str) -> dict:
        case = await self.case_repo.find_by_id(case_id)
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        latest = await self.score_repo.find_latest(case_id)
        return self._attach_latest_score(case, latest)

    async def create_case(self, data, created_by: str | None = None, role: str | None = None) -> dict:
        # Support both payload styles:
        # new-style: person is a nested dict with name, nationality, etc.
        # old-style / test-style: person_id is a flat string, no nested person dict
        person = {}
        if data.person is not None:
            person = {
                "name": data.person.primary_name,
                "nationality": data.person.nationality,
                "language": data.person.primary_language,
                "date_of_birth": data.person.dob.isoformat() if data.person.dob else None,
            }
        elif data.person_id:
            person = {"person_id": data.person_id}

        payload = await self.case_repo.insert(
            {
                "person": person,
                "status": data.status.value,
                "created_by": created_by,
            }
        )
        return self._attach_latest_score(payload, None)

    def _attach_latest_score(self, case: dict, latest: dict | None) -> dict:
        response = {**case}
        if latest:
            response["latest_score"] = {
                "predicted_score": latest["predicted_score"],
                "confidence_band": latest["confidence_band"],
            }
        else:
            response["latest_score"] = None
        return response
