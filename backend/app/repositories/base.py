"""Repository contracts for JSON and Supabase backends."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


class CaseRepositoryProtocol(Protocol):
    async def find_all(self, status: str | None = None, search: str | None = None) -> list[dict]: ...
    async def find_by_id(self, case_id: str) -> dict | None: ...
    async def insert(self, data: dict) -> dict: ...
    async def update_status(self, case_id: str, new_status: str) -> dict | None: ...


class EvidenceRepositoryProtocol(Protocol):
    async def find_by_case(self, case_id: str) -> list[dict]: ...
    async def insert(self, data: dict) -> dict: ...


class FamilyLinkRepositoryProtocol(Protocol):
    async def find_by_case(self, case_id: str) -> list[dict]: ...
    async def insert(self, data: dict) -> dict: ...


class DocumentRepositoryProtocol(Protocol):
    async def find_by_case(self, case_id: str) -> list[dict]: ...
    async def insert(self, data: dict) -> dict: ...


class AnnouncementRepositoryProtocol(Protocol):
    async def find_by_case(self, case_id: str) -> list[dict]: ...
    async def insert(self, data: dict) -> dict: ...


class ReferralRepositoryProtocol(Protocol):
    async def find_by_case(self, case_id: str) -> list[dict]: ...
    async def insert(self, data: dict) -> dict: ...


class ScoreRepositoryProtocol(Protocol):
    async def find_latest(self, case_id: str) -> dict | None: ...
    async def insert(self, data: dict) -> dict: ...


class AuditRepositoryProtocol(Protocol):
    async def log_action(self, action: str, user: str | None, case_id: str, details: dict | None = None) -> dict: ...
    async def get_log(self, case_id: str) -> list[dict]: ...


@dataclass(frozen=True)
class RepositoryBundle:
    cases: CaseRepositoryProtocol
    evidence: EvidenceRepositoryProtocol
    family_links: FamilyLinkRepositoryProtocol
    documents: DocumentRepositoryProtocol
    announcements: AnnouncementRepositoryProtocol
    referrals: ReferralRepositoryProtocol
    scores: ScoreRepositoryProtocol
    audit: AuditRepositoryProtocol
