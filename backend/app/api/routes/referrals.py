from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_current_user
from app.core.security import User
from app.schemas.referral import ReferralCreate, ReferralUpdate
from app.services.referral_service import ReferralService

router = APIRouter(tags=["referrals"])
referral_service = ReferralService()

@router.post("/cases/{case_id}/referrals", response_model=dict)
async def create_referral(
    case_id: str,
    ref_in: ReferralCreate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    if ref_in.case_id != case_id:
        raise HTTPException(status_code=400, detail="case_id in body must match URL")
    ref_in = ref_in.model_copy(update={"case_id": case_id})
    return await referral_service.create_referral(case_id, ref_in, current_user)

@router.patch("/referrals/{referral_id}", response_model=dict)
async def update_referral(
    referral_id: str,
    ref_in: ReferralUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await referral_service.update_referral(referral_id, ref_in, current_user)
