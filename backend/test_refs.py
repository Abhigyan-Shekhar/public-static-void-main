from fastapi.testclient import TestClient

from app.main import app

def test_create_case_then_referral():
    client = TestClient(app)
    headers = {"X-Demo-Username": "auth_manager"}

    case_res = client.post(
        "/cases",
        json={
            "person": {"name": "Test"},
            "status": "intake_created",
        },
        headers=headers,
    )
    assert case_res.status_code in (200, 201)

    case = case_res.json()
    assert "case_id" in case
    cid = case["case_id"]

    referral_res = client.post(
        f"/cases/{cid}/referrals",
        json={
            "case_id": cid,
            "referral_type": "referral",
            "from_agency": "UNHCR",
            "to_agency": "Country X",
            "reason": "Passed",
        },
        headers=headers,
    )
    assert referral_res.status_code in (200, 201)
