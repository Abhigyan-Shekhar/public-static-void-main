import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def make_request(method, url, payload=None):
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8') if payload else None,
        headers={'Content-Type': 'application/json'},
        method=method
    )
    try:
        res = urllib.request.urlopen(req)
        return json.loads(res.read())
    except urllib.error.HTTPError as e:
        print(f"Request failed with {e.code}: {e.read().decode('utf-8')}")
        sys.exit(1)

print("--- 1. POST /cases ---")
case = make_request("POST", f"{BASE_URL}/cases", {
    "person_id": "new",
    "person": {
        "name": "Ahmad Karimi",
        "nationality": "Syrian",
        "language": "Arabic",
        "date_of_birth": "1985-03-15"
    },
    "status": "intake_created"
})
case_id = case["case_id"]
person_id = case.get("person_id") or "new"
print(f"Created case: {case_id}")

print(f"\n--- 2. POST /cases/{case_id}/evidence ---")
evidence = make_request("POST", f"{BASE_URL}/cases/{case_id}/evidence", {
    "case_id": case_id,
    "person_id": person_id,
    "evidence_class": "official",
    "evidence_type": "Syrian Passport",
    "payload": {"document_number": "N123456"}
})
print(f"Submitted evidence: {evidence['id']}")

print(f"\n--- 3. POST /cases/{case_id}/score/recompute ---")
score = make_request("POST", f"{BASE_URL}/cases/{case_id}/score/recompute")
print(f"Recomputed score: {score['predicted_score']}")

print(f"\n--- 4. POST /cases/{case_id}/referrals ---")
referral = make_request("POST", f"{BASE_URL}/cases/{case_id}/referrals", {
    "case_id": case_id,
    "referral_type": "referral",
    "from_agency": "UNHCR",
    "to_agency": "Resettlement Country X",
    "reason": "Verified and passed threshold"
})
print(f"Created referral: {referral['id']}")

print("\n--- Demo flow completed successfully! ---")
