$case = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/cases" -Headers @{"Content-Type" = "application/json"} -Body '{"person_id": "new", "person": {"name": "Ahmad Karimi", "nationality": "Syrian", "language": "Arabic", "date_of_birth": "1985-03-15"}, "status": "intake_created"}'
Write-Host "Created case:" $case.case_id

$caseId = $case.case_id

$evidence = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/cases/$caseId/evidence" -Headers @{"Content-Type" = "application/json"} -Body "{`"case_id`": `"$caseId`", `"person_id`": `"new`", `"evidence_class`": `"official`", `"evidence_type`": `"Syrian Passport`", `"payload`": {`"document_number`": `"N123456`"}}"
Write-Host "Submitted evidence:" $evidence.id

$score = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/cases/$caseId/score/recompute" -Headers @{"Content-Type" = "application/json"} 
Write-Host "Recomputed score:" $score.predicted_score

$ref = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/cases/$caseId/referrals" -Headers @{"Content-Type" = "application/json"} -Body "{`"case_id`": `"$caseId`", `"referral_type`": `"referral`", `"from_agency`": `"UNHCR`", `"to_agency`": `"Resettlement Country X`", `"reason`": `"Verified and passed threshold`"}"
Write-Host "Created referral:" $ref.id

Write-Host "Demo Flow Completed successfully!"
