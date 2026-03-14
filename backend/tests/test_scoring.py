"""Tests for scoring endpoints."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
HEADERS = {"X-Demo-Username": "auth_manager"}


def test_get_latest_score_no_data():
    """Score endpoint returns null (not 500) when no snapshot exists for a case."""
    # First create a real case so the 404 guard doesn't fire
    case_res = client.post(
        "/cases",
        json={"person_id": "person-score-test", "intake_location": "Test Border"},
        headers=HEADERS,
    )
    assert case_res.status_code == 200
    case_id = case_res.json()["id"]

    res = client.get(f"/cases/{case_id}/score/latest", headers=HEADERS)
    assert res.status_code == 200
    assert res.json() is None  # no snapshot yet — valid empty state


def test_recompute_and_get_latest_score():
    """Full scoring round-trip: create case → add evidence → recompute → latest."""
    # 1. Case
    case_res = client.post(
        "/cases",
        json={"person_id": "person-score-e2e", "intake_location": "Camp Delta"},
        headers=HEADERS,
    )
    assert case_res.status_code == 200
    case_id = case_res.json()["id"]

    # 2. Evidence
    ev_res = client.post(
        f"/cases/{case_id}/evidence",
        json={
            "case_id": case_id,
            "person_id": "person-score-e2e",
            "evidence_class": "official",
            "evidence_type": "government_record",
            "payload": {},
        },
        headers=HEADERS,
    )
    assert ev_res.status_code == 200
    ev_id = ev_res.json()["id"]

    # 3. Review it
    review_res = client.patch(
        f"/evidence/{ev_id}/review",
        json={"state": "accepted"},
        headers=HEADERS,
    )
    assert review_res.status_code == 200

    # 4. Recompute
    score_res = client.post(f"/cases/{case_id}/score/recompute", headers=HEADERS)
    assert score_res.status_code == 200
    score = score_res.json()
    assert "predicted_score" in score
    assert "confidence_band" in score
    assert "feature_snapshot" in score
    assert score["predicted_score"] >= 0

    # 5. Latest should now return the snapshot
    latest_res = client.get(f"/cases/{case_id}/score/latest", headers=HEADERS)
    assert latest_res.status_code == 200
    latest = latest_res.json()
    assert latest is not None
    assert latest["id"] == score["id"]
    assert latest["case_id"] == case_id
