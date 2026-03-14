from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_current_user, require_permission
from app.core.security import Permission, Role, User
from app.repositories.audit_repo import AuditRepo
from app.repositories.family_link_repo import FamilyLinkRepo
from app.schemas.family_link import FamilyLink, FamilyLinkCreate, FamilyLinkReview

repo = FamilyLinkRepo()
audit_repo = AuditRepo()

router = APIRouter(tags=["family_links"])

@router.post("/cases/{case_id}/family-links", response_model=FamilyLink)
async def add_family_link(
    case_id: str,
    link_in: FamilyLinkCreate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    if link_in.case_id != case_id:
        raise HTTPException(status_code=400, detail="case_id in body must match URL")

    data = link_in.model_dump()
    data["case_id"] = case_id
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    if current_user.role == Role.REFUGEE:
        data["link_status"] = "declared"
    else:
        data["link_status"] = "declared"

    created = await repo.insert(data)
    await audit_repo.log_action(
            action="create_family_link",
            user=current_user.id,
            case_id=case_id,
            details={"relation": data.get("relation_type")},
    )
    return created

@router.patch("/family-links/{link_id}", response_model=FamilyLink)
async def update_family_link(
    link_id: str,
    review_in: FamilyLinkReview,
    current_user: Annotated[User, Depends(require_permission(Permission.REVIEWER))],
):
    link = await repo.find_by_id(link_id)
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    updates = {"link_status": review_in.link_status.value}
    updated = await repo.update(link_id, updates)

    await audit_repo.log_action(
        action="update_family_link",
        user=current_user.id,
        case_id=link["case_id"],
        details={"new_status": review_in.link_status.value},
    )
    return updated
