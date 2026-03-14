"""Repository exports and backend-selection helpers."""

from __future__ import annotations

import os

from app.repositories.announcement_repo import AnnouncementRepo
from app.repositories.audit_repo import AuditRepo
from app.repositories.base import RepositoryBundle
from app.repositories.case_repo import CaseRepo
from app.repositories.document_repo import DocumentRepo
from app.repositories.evidence_repo import EvidenceRepo
from app.repositories.factory import get_repository_bundle
from app.repositories.family_link_repo import FamilyLinkRepo
from app.repositories.json_repo import get_json_repository_bundle
from app.repositories.referral_repo import ReferralRepo
from app.repositories.score_repo import ScoreRepo
from app.repositories.supabase_repo import get_supabase_repository_bundle


DEFAULT_REPOSITORY_BACKEND = os.getenv("REPOSITORY_BACKEND", "json").lower()


def get_repository_backend() -> str:
    return DEFAULT_REPOSITORY_BACKEND


__all__ = [
    "AnnouncementRepo",
    "AuditRepo",
    "CaseRepo",
    "DocumentRepo",
    "EvidenceRepo",
    "FamilyLinkRepo",
    "ReferralRepo",
    "RepositoryBundle",
    "ScoreRepo",
    "get_json_repository_bundle",
    "get_repository_backend",
    "get_repository_bundle",
    "get_supabase_repository_bundle",
]
