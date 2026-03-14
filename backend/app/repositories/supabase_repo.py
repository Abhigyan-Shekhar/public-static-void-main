"""Supabase repository bundle using the same contract as the JSON bundle."""

from __future__ import annotations

from app.repositories.base import RepositoryBundle
from app.repositories.supabase_client import get_client


class SupabaseCaseRepo:
    async def find_all(self, status: str | None = None, search: str | None = None) -> list[dict]:
        query = get_client().table("cases").select("*")
        if status:
            query = query.eq("status", status)
        if search:
            query = query.ilike("person_name", f"%{search}%")
        return query.execute().data

    async def find_by_id(self, case_id: str) -> dict | None:
        data = get_client().table("cases").select("*").eq("id", case_id).limit(1).execute().data
        if not data:
            return None
        row = data[0]
        return {
            "case_id": row["id"],
            "case_code": row["case_code"],
            "status": row["status"],
            "person": {
                "name": row.get("person_name"),
                "nationality": row.get("person_nationality"),
                "language": row.get("person_language"),
                "date_of_birth": row.get("person_dob"),
            },
            "created_by": row.get("created_by"),
            "created_at": row.get("created_at"),
            "updated_at": row.get("updated_at"),
        }

    async def insert(self, data: dict) -> dict:
        payload = {
            "case_code": data["case_code"],
            "status": data.get("status", "intake"),
            "person_name": data.get("person", {}).get("name"),
            "person_nationality": data.get("person", {}).get("nationality"),
            "person_language": data.get("person", {}).get("language"),
            "person_dob": data.get("person", {}).get("date_of_birth"),
            "created_by": data.get("created_by"),
        }
        result = get_client().table("cases").insert(payload).execute()
        if not result.data:
            raise RuntimeError("Insert returned no data")
        return await self.find_by_id(result.data[0]["id"])


class SupabaseEvidenceRepo:
    async def find_by_case(self, case_id: str) -> list[dict]:
        return get_client().table("evidence").select("*").eq("case_id", case_id).execute().data

    async def insert(self, data: dict) -> dict:
        return get_client().table("evidence").insert(data).execute().data[0]


class SupabaseFamilyLinkRepo:
    async def find_by_case(self, case_id: str) -> list[dict]:
        return get_client().table("family_links").select("*").eq("case_id", case_id).execute().data

    async def insert(self, data: dict) -> dict:
        return get_client().table("family_links").insert(data).execute().data[0]


class SupabaseDocumentRepo:
    async def find_by_case(self, case_id: str) -> list[dict]:
        return get_client().table("documents").select("*").eq("case_id", case_id).execute().data

    async def insert(self, data: dict) -> dict:
        return get_client().table("documents").insert(data).execute().data[0]


class SupabaseAnnouncementRepo:
    async def find_by_case(self, case_id: str) -> list[dict]:
        return get_client().table("announcements").select("*").or_(
            f"target_case_id.eq.{case_id},target_case_id.is.null"
        ).execute().data

    async def insert(self, data: dict) -> dict:
        return get_client().table("announcements").insert(data).execute().data[0]


class SupabaseReferralRepo:
    async def find_by_case(self, case_id: str) -> list[dict]:
        return get_client().table("referrals").select("*").eq("case_id", case_id).execute().data

    async def insert(self, data: dict) -> dict:
        return get_client().table("referrals").insert(data).execute().data[0]


class SupabaseScoreRepo:
    async def find_latest(self, case_id: str) -> dict | None:
        data = get_client().table("scores").select("*").eq("case_id", case_id).order(
            "computed_at", desc=True
        ).limit(1).execute().data
        return data[0] if data else None

    async def insert(self, data: dict) -> dict:
        return get_client().table("scores").insert(data).execute().data[0]


class SupabaseAuditRepo:
    async def log_action(self, action: str, user: str | None, case_id: str, details: dict | None = None) -> dict:
        payload = {
            "action": action,
            "user_id": user,
            "case_id": case_id,
            "details": details or {},
        }
        return get_client().table("audit_log").insert(payload).execute().data[0]

    async def get_log(self, case_id: str) -> list[dict]:
        return get_client().table("audit_log").select("*").eq("case_id", case_id).execute().data


def get_supabase_repository_bundle() -> RepositoryBundle:
    return RepositoryBundle(
        cases=SupabaseCaseRepo(),
        evidence=SupabaseEvidenceRepo(),
        family_links=SupabaseFamilyLinkRepo(),
        documents=SupabaseDocumentRepo(),
        announcements=SupabaseAnnouncementRepo(),
        referrals=SupabaseReferralRepo(),
        scores=SupabaseScoreRepo(),
        audit=SupabaseAuditRepo(),
    )
