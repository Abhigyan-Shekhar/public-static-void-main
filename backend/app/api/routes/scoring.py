# backend/app/api/routes/scoring.py
from fastapi import APIRouter, Depends
from typing import Annotated
from app.services.scoring_service import ScoringService
scoring_service = ScoringService()
from app.core.deps import get_current_user, require_permission
from app.core.security import User, Permission

router = APIRouter(tags=["scoring"])

@router.post("/score/recompute", response_model=dict | None)
async def recompute_score(
    case_id: str,
    current_user: Annotated[User, Depends(require_permission(Permission.CASE_MANAGER))]
):
    return await scoring_service.recompute_score(case_id)

@router.get("/score/latest", response_model=dict | None)
async def get_latest_score(
    case_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    return await scoring_service.get_latest_score(case_id)
