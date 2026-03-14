"""Feature builder for the identity confidence engine."""

from __future__ import annotations

from datetime import date, datetime

import pandas as pd


EVIDENCE_WEIGHTS = {
    "biometric_match": 0.95,
    "government_record": 0.90,
    "verified_ngo_record": 0.85,
    "family_confirmation": 0.70,
    "employer_confirmation": 0.65,
    "school_confirmation": 0.60,
    "profile_details": 0.30,
    "reported_family_members": 0.25,
    "education_claims": 0.20,
    "skill_declarations": 0.15,
}

FEATURE_COLUMNS = [
    "total_evidence_count",
    "official_evidence_count",
    "corroborated_evidence_count",
    "self_declared_count",
    "accepted_official_count",
    "accepted_corroborated_count",
    "disputed_count",
    "rejected_count",
    "biometric_match_present",
    "government_record_present",
    "verified_ngo_record_present",
    "family_confirmation_present",
    "verified_family_links_count",
    "documents_verified_count",
    "documents_rejected_count",
    "external_confirmed_matches",
    "weighted_evidence_sum",
    "days_in_system",
]


def build_features(
    evidence_list: list,
    family_links: list | None = None,
    documents: list | None = None,
    external_links: list | None = None,
    days_in_system: int = 0,
) -> dict:
    """Build the structured feature vector described in Context.md."""
    features = {column: 0 for column in FEATURE_COLUMNS}

    for item in evidence_list:
        evidence_type = item.get("evidence_type", "")
        trust_class = item.get("trust_class", "self_declared")
        review_status = item.get("review_status", "pending")

        features["total_evidence_count"] += 1

        if trust_class == "official":
            features["official_evidence_count"] += 1
        elif trust_class == "corroborated":
            features["corroborated_evidence_count"] += 1
        else:
            features["self_declared_count"] += 1

        if review_status == "accepted":
            if trust_class == "official":
                features["accepted_official_count"] += 1
            elif trust_class == "corroborated":
                features["accepted_corroborated_count"] += 1
        elif review_status == "rejected":
            features["rejected_count"] += 1
        elif review_status == "disputed":
            features["disputed_count"] += 1

        if evidence_type == "biometric_match":
            features["biometric_match_present"] = 1
        elif evidence_type == "government_record":
            features["government_record_present"] = 1
        elif evidence_type == "verified_ngo_record":
            features["verified_ngo_record_present"] = 1
        elif evidence_type == "family_confirmation":
            features["family_confirmation_present"] = 1

        features["weighted_evidence_sum"] += EVIDENCE_WEIGHTS.get(evidence_type, 0.1)

    if family_links:
        features["verified_family_links_count"] = sum(
            1
            for link in family_links
            if (link.get("link_status") or link.get("trust_state")) == "verified"
        )

    if documents:
        features["documents_verified_count"] = sum(
            1 for document in documents if document.get("state") in {"verified", "accepted"}
        )
        features["documents_rejected_count"] = sum(
            1 for document in documents if document.get("state") in {"rejected", "expired"}
        )

    if external_links:
        features["external_confirmed_matches"] = sum(
            1 for link in external_links if link.get("match_status") in {"confirmed", "matched"}
        )

    features["days_in_system"] = days_in_system
    return features


def build_case_features(
    case: dict,
    evidence_list: list,
    family_links: list | None = None,
    documents: list | None = None,
    external_links: list | None = None,
) -> dict:
    """Build a case feature vector from the raw domain objects."""
    created_at = case.get("created_at")
    return build_features(
        evidence_list=evidence_list,
        family_links=family_links or [],
        documents=documents or [],
        external_links=external_links or [],
        days_in_system=_days_since(created_at),
    )


def _days_since(value: str | None) -> int:
    if not value:
        return 0

    try:
        created_at = datetime.fromisoformat(value.replace("Z", "+00:00")).date()
    except ValueError:
        return 0

    return max((date.today() - created_at).days, 0)


def features_to_dataframe(features: dict) -> pd.DataFrame:
    """Convert feature dict to a single-row DataFrame in stable column order."""
    return pd.DataFrame([features], columns=FEATURE_COLUMNS)
