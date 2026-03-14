# backend/app/api/routes/evidence.py
from fastapi import APIRouter, Depends
from typing import List, Annotated
from app.schemas.evidence import Evidence, EvidenceCreate, EvidenceReview
from app.services.evidence_service import EvidenceService
evidence_service = EvidenceService()
from app.core.deps import get_current_user, require_permission
from app.core.security import User, Permission

router = APIRouter(tags=["evidence"])

@router.post("/cases/{case_id}/evidence", response_model=dict)
async def add_evidence(
    case_id: str,
    evidence_in: EvidenceCreate,
    current_user: Annotated[User, Depends(get_current_user)]
):
    return await evidence_service.add_evidence(case_id, evidence_in, current_user)

@router.get("/cases/{case_id}/evidence", response_model=List[dict])
async def get_evidence(
    case_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    return await evidence_service.get_evidence(case_id)

@router.patch("/evidence/{evidence_id}/review", response_model=dict)
async def review_evidence(
    evidence_id: str,
    review_in: EvidenceReview,
    current_user: Annotated[User, Depends(require_permission(Permission.REVIEWER))]
):
    return await evidence_service.review_evidence(evidence_id, review_in, current_user)
