# backend/app/api/routes/cases.py
from fastapi import APIRouter, Depends, Query
from typing import List, Annotated, Optional
from app.schemas.case import CaseCreate
from app.services.case_service import CaseService
case_service = CaseService()
from app.core.deps import get_current_user, require_permission
from app.core.security import User, Permission
from app.services.timeline_service import TimelineService

router = APIRouter(prefix="/cases", tags=["cases"])
timeline_service = TimelineService()

@router.get("", response_model=List[dict])
async def list_cases(
    current_user: Annotated[User, Depends(get_current_user)],
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    return await case_service.list_cases(status=status, search=search)

@router.post("", response_model=dict)
async def create_case(
    case_in: CaseCreate,
    current_user: Annotated[User, Depends(require_permission(Permission.INTAKE_OFFICER))]
):
    return await case_service.create_case(case_in, current_user.id, current_user.role)

@router.get("/{case_id}", response_model=dict)
async def get_case(
    case_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    return await case_service.get_case(case_id)

@router.get("/{case_id}/timeline", response_model=List[dict])
async def get_case_timeline(
    case_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Return the aggregated timeline for a case."""
    return await timeline_service.get_timeline(case_id)
