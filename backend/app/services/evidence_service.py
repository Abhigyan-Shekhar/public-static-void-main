# backend/app/services/evidence_service.py
from datetime import datetime, timezone
from fastapi import HTTPException
from app.repositories.evidence_repo import EvidenceRepo
from app.repositories.case_repo import CaseRepo
from app.repositories.audit_repo import AuditRepo
from app.schemas.evidence import EvidenceCreate, EvidenceReview, EvidenceClass, EvidenceState
from app.services.case_service import CaseService
from app.schemas.case import CaseStatus
from app.core.security import User

class EvidenceService:
    def __init__(self):
        self.repo = EvidenceRepo()
        self.case_repo = CaseRepo()
        self.audit_repo = AuditRepo()
        self.case_service = CaseService()

    async def add_evidence(self, case_id: str, evidence_in: EvidenceCreate, current_user: User) -> dict:
        case = await self.case_service.get_case(case_id) # ensure case exists
        
        evidence_data = evidence_in.model_dump()
        
        # Enforce refugee rules
        if current_user.role == "refugee":
            trust_class = EvidenceClass.SELF_DECLARED.value
            state = EvidenceState.PENDING.value
        else:
            trust_class = evidence_data.get("evidence_class", "official")
            state = EvidenceState.PENDING.value # All starts as pending until reviewed

        payload = {
            "case_id": case_id,
            "evidence_type": evidence_data["evidence_type"],
            "trust_class": trust_class,
            "source": current_user.role,
            "details": evidence_data.get("payload", {}),
            "review_status": state
        }
        
        created = await self.repo.insert(payload)
        
        await self.audit_repo.log_action(
            action="add_evidence",
            user=current_user.id,
            case_id=case_id,
            details={"type": payload["evidence_type"], "class": payload["trust_class"]}
        )
        
        # Update case state if it's the first evidence
        if case and case.get("status") == CaseStatus.INTAKE_CREATED.value:
            await self.case_repo.update_status(case_id, CaseStatus.EVIDENCE_PENDING.value)
            
        return created

    async def get_evidence(self, case_id: str) -> list[dict]:
        return await self.repo.find_by_case(case_id)

    async def review_evidence(self, evidence_id: str, review_in: EvidenceReview, current_user: User) -> dict:
        evidence = await self.repo.find_by_id(evidence_id)
        if not evidence:
            raise HTTPException(status_code=404, detail="Evidence not found")
            
        # Refugees cannot review
        if current_user.role == "refugee":
             raise HTTPException(status_code=403, detail="Refugees cannot review evidence.")
             
        updates = {
            "review_status": review_in.state.value,
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "reviewed_by": current_user.id
        }
        
        updated = await self.repo.update(evidence_id, updates)
        
        await self.audit_repo.log_action(
            action="review_evidence",
            user=current_user.id,
            case_id=evidence["case_id"],
            details={"new_state": review_in.state.value}
        )
        return updated
