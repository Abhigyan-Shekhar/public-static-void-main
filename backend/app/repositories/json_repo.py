"""JSON repository bundle for the demo-first data layer."""

from __future__ import annotations

from app.repositories.announcement_repo import AnnouncementRepo
from app.repositories.audit_repo import AuditRepo
from app.repositories.base import RepositoryBundle
from app.repositories.case_repo import CaseRepo
from app.repositories.document_repo import DocumentRepo
from app.repositories.evidence_repo import EvidenceRepo
from app.repositories.family_link_repo import FamilyLinkRepo
from app.repositories.json_store import JsonStore
from app.repositories.referral_repo import ReferralRepo
from app.repositories.score_repo import ScoreRepo


def get_json_repository_bundle(store: JsonStore | None = None) -> RepositoryBundle:
    shared_store = store or JsonStore()
    return RepositoryBundle(
        cases=CaseRepo(store=shared_store),
        evidence=EvidenceRepo(store=shared_store),
        family_links=FamilyLinkRepo(store=shared_store),
        documents=DocumentRepo(store=shared_store),
        announcements=AnnouncementRepo(store=shared_store),
        referrals=ReferralRepo(store=shared_store),
        scores=ScoreRepo(store=shared_store),
        audit=AuditRepo(store=shared_store),
    )
