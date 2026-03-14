# backend/app/services/referral_service.py
from datetime import datetime, timezone
from fastapi import HTTPException
from app.repositories.referral_repo import ReferralRepo
from app.repositories.case_repo import CaseRepo
from app.repositories.audit_repo import AuditRepo
from app.schemas.referral import ReferralCreate, ReferralUpdate, ReferralStatus
from app.services.case_service import CaseService
from app.schemas.case import CaseStatus
from app.core.security import Permission, Role, User

class ReferralService:
    def __init__(self):
        self.repo = ReferralRepo()
        self.case_repo = CaseRepo()
        self.audit_repo = AuditRepo()
        self.case_service = CaseService()

    @staticmethod
    def _can_manage_referrals(current_user: User) -> bool:
        if current_user.role == Role.AUTHORITY and Permission.CASE_MANAGER in current_user.permissions:
            return True
        if current_user.role == Role.PARTNER and Permission.PARTNER_SERVICE_OFFICER in current_user.permissions:
            return True
        return False

    async def create_referral(self, case_id: str, referral_in: ReferralCreate, current_user: User) -> dict:
        case = await self.case_service.get_case(case_id)
        
        # Governance constraint: "no employment referral without case-manager approval"
        # Since only case managers can approve, and creating essentially starts this process:
        if not self._can_manage_referrals(current_user):
             raise HTTPException(status_code=403, detail="Only case managers or approved partner officers can create referrals.")
        
        referral_data = referral_in.model_dump()
        referral_data["case_id"] = case_id
        referral_data["status"] = ReferralStatus.OPEN.value
        referral_data["created_by"] = current_user.id
        referral_data["created_at"] = datetime.now(timezone.utc).isoformat()
        
        created = await self.repo.insert(referral_data)
        
        await self.audit_repo.log_action(
            action="create_referral",
            user=current_user.id,
            case_id=case_id,
            details={
                "to_agency": referral_data.get("to_agency"),
                "referral_type": referral_data.get("referral_type"),
            }
        )
        
        # Transition case to referred
        if case and case.get("status") in [CaseStatus.VERIFIED_FOR_HANDOFF.value]:
            await self.case_repo.update_status(case_id, CaseStatus.REFERRED.value)
            
        return created

    async def update_referral(self, referral_id: str, update_in: ReferralUpdate, current_user: User) -> dict:
        if not self._can_manage_referrals(current_user):
            raise HTTPException(status_code=403, detail="Only case managers or approved partner officers can update referrals.")

        referral = await self.repo.find_by_id(referral_id)
        if not referral:
             raise HTTPException(status_code=404, detail="Referral not found")
             
        updates = {"status": update_in.status.value}
        updated = await self.repo.update(referral_id, updates)
        
        await self.audit_repo.log_action(
            action="update_referral",
            user=current_user.id,
            case_id=referral["case_id"],
            details={"new_status": update_in.status.value}
        )
        return updated
