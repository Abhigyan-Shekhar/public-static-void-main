from pathlib import Path

from app.repositories.audit_repo import AuditRepo
from app.repositories.case_repo import CaseRepo
from app.repositories.score_repo import ScoreRepo
from app.repositories.json_store import JsonStore


def build_store(tmp_path: Path) -> JsonStore:
    return JsonStore(seed_dir=tmp_path)


async def _create_case(repo: CaseRepo):
    return await repo.insert(
        {
            "person": {"name": "Test Person", "nationality": "Syrian"},
            "status": "intake",
            "created_by": "tester",
        }
    )


def test_case_repo_insert_and_lookup(tmp_path):
    store = build_store(tmp_path)
    repo = CaseRepo(store=store)

    import asyncio

    created = asyncio.run(_create_case(repo))
    loaded = asyncio.run(repo.find_by_id(created["case_id"]))

    assert created["case_code"].startswith("BB-")
    assert loaded is not None
    assert loaded["person"]["name"] == "Test Person"


def test_score_repo_returns_latest_snapshot(tmp_path):
    store = build_store(tmp_path)
    repo = ScoreRepo(store=store)

    import asyncio

    asyncio.run(
        repo.insert(
            {
                "case_id": "case-1",
                "predicted_score": 45.0,
                "confidence_band": "low",
                "top_factors": [],
                "blocking_constraints": [],
                "computed_at": "2026-03-13T08:00:00+00:00",
            }
        )
    )
    newest = asyncio.run(
        repo.insert(
            {
                "case_id": "case-1",
                "predicted_score": 67.0,
                "confidence_band": "provisional_identity",
                "top_factors": [],
                "blocking_constraints": [],
                "computed_at": "2026-03-13T09:00:00+00:00",
            }
        )
    )

    latest = asyncio.run(repo.find_latest("case-1"))

    assert latest is not None
    assert latest["id"] == newest["id"]
    assert latest["predicted_score"] == 67.0


def test_audit_repo_persists_entries(tmp_path):
    store = build_store(tmp_path)
    repo = AuditRepo(store=store)

    import asyncio

    asyncio.run(repo.log_action("score_recomputed", "officer-1", "case-9", {"score": 72.1}))
    entries = asyncio.run(repo.get_log("case-9"))

    assert len(entries) == 1
    assert entries[0]["action"] == "score_recomputed"
    assert entries[0]["details"]["score"] == 72.1
