"""Scoring service — integrates repositories with feature building/inference."""

from __future__ import annotations

from fastapi import HTTPException

from app.ml.feature_builder import build_case_features
from app.ml.infer import predict_score
from app.repositories.case_repo import CaseRepo
from app.repositories.evidence_repo import EvidenceRepo
from app.repositories.family_link_repo import FamilyLinkRepo
from app.repositories.score_repo import ScoreRepo


class ScoringService:
    def __init__(self) -> None:
        self.case_repo = CaseRepo()
        self.evidence_repo = EvidenceRepo()
        self.family_link_repo = FamilyLinkRepo()
        self.score_repo = ScoreRepo()

    async def get_latest_score(self, case_id: str) -> dict | None:
        case = await self.case_repo.find_by_id(case_id)
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")

        return await self.score_repo.find_latest(case_id)  # None if no snapshot yet

    async def recompute_score(self, case_id: str) -> dict:
        case = await self.case_repo.find_by_id(case_id)
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")

        evidence = await self.evidence_repo.find_by_case(case_id)
        family_links = await self.family_link_repo.find_by_case(case_id)
        features = build_case_features(case=case, evidence_list=evidence, family_links=family_links)
        prediction = predict_score(features)

        snapshot = await self.score_repo.insert(
            {
                "case_id": case_id,
                **prediction,
                "model_version": prediction.get("model_version", "rule-based-v1"),
            }
        )
        return snapshot

    def _placeholder_score(self, case_id: str) -> dict:
        return {
            "case_id": case_id,
            "predicted_score": 42.0,
            "confidence_band": "provisional",
            "top_factors": [{"name": "Awaiting reviewed evidence", "impact": 8.0}],
            "blocking_constraints": ["No reviewed official evidence prevents verified status"],
            "computed_at": self.score_repo.store.utcnow(),
            "model_version": "placeholder-v1",
        }
