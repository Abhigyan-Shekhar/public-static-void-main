# backend/app/schemas/scoring.py
from pydantic import BaseModel, ConfigDict
from typing import Any, Optional

class FeatureSnapshot(BaseModel):
    total_evidence_count: int = 0
    official_evidence_count: int
    corroborated_evidence_count: int
    self_declared_count: int
    accepted_official_count: int
    accepted_corroborated_count: int
    disputed_count: int
    rejected_count: int
    biometric_match_present: int
    government_record_present: int
    verified_ngo_record_present: int
    family_confirmation_present: int
    verified_family_links_count: int
    documents_verified_count: int
    documents_rejected_count: int
    external_confirmed_matches: int
    weighted_evidence_sum: float = 0.0
    days_in_system: int = 0

class ScoreSnapshot(BaseModel):
    id: str
    case_id: str
    model_name: str
    model_version: str
    predicted_score: float
    confidence_band: str
    feature_snapshot: FeatureSnapshot | dict[str, Any] = {}
    top_factors: list[dict[str, Any]] = []
    blocking_constraints: list[str] = []
    explanation: dict[str, Any] = {}
    computed_at: str | None = None
    created_at: str

    model_config = ConfigDict(from_attributes=True)
