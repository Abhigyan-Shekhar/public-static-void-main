from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

print("--- 1. POST /cases ---")
res = client.post("/cases", json={
    "person_id": "new",
    "person": {
        "name": "Ahmad Karimi",
        "nationality": "Syrian",
        "language": "Arabic",
        "date_of_birth": "1985-03-15"
    },
    "status": "intake_created"
})
if res.status_code != 200:
    print(f"Failed: {res.status_code} {res.text}")
    exit(1)
case = res.json()
print("Case created:", case["case_id"])
case_id = case["case_id"]

print("\n--- 2. POST /evidence ---")
res = client.post(f"/cases/{case_id}/evidence", json={
    "case_id": case_id,
    "person_id": "new",
    "evidence_class": "official",
    "evidence_type": "Syrian Passport",
    "payload": {"document_number": "N123456"}
})
if res.status_code != 200:
    print(f"Failed: {res.status_code} {res.text}")
    exit(1)
evidence = res.json()
print("Evidence submitted:", evidence["id"])

print("\n--- 3. POST /score/recompute ---")
res = client.post(f"/cases/{case_id}/score/recompute")
if res.status_code != 200:
    print(f"Failed: {res.status_code} {res.text}")
    exit(1)
score = res.json()
print("Score recomputed:", score["predicted_score"])

print("\n--- 4. POST /referrals ---")
res = client.post(f"/cases/{case_id}/referrals", json={
    "case_id": case_id,
    "referral_type": "referral",
    "from_agency": "UNHCR",
    "to_agency": "Resettlement Country X",
    "reason": "Verified and passed threshold"
})
if res.status_code != 200:
    print(f"Failed: {res.status_code} {res.text}")
    exit(1)
ref = res.json()
print("Referral created:", ref["id"])

print("\nDemo flow success!")
