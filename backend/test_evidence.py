import requests
import sys

print('POST cases')
res=requests.post('http://127.0.0.1:8000/cases', json={'person_id': 'new', 'person': {'name': 'Ahmad', 'nationality': 'Syrian'}, 'status': 'intake_created'})
case=res.json()
print(case['case_id'])

print('POST evidence')
res2=requests.post(f"http://127.0.0.1:8000/cases/{case['case_id']}/evidence", json={'case_id': case['case_id'], 'person_id': 'new', 'evidence_class': 'official', 'evidence_type': 'Syrian Passport', 'payload': {}})
print(res2.status_code, res2.text)
