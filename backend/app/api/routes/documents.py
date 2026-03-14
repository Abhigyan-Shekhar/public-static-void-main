from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_current_user, require_permission
from app.core.security import Permission, User
from app.repositories.audit_repo import AuditRepo
from app.repositories.case_repo import CaseRepo
from app.repositories.document_repo import DocumentRepo
from app.schemas.document import Document, DocumentCreate, DocumentReview

repo = DocumentRepo()
case_repo = CaseRepo()
audit_repo = AuditRepo()

router = APIRouter(tags=["documents"])

@router.post("/cases/{case_id}/documents/register", response_model=Document)
async def register_document(
    case_id: str,
    doc_in: DocumentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    if doc_in.case_id != case_id:
        raise HTTPException(status_code=400, detail="case_id in body must match URL")
    if not await case_repo.find_by_id(case_id):
        raise HTTPException(status_code=404, detail="Case not found")

    data = doc_in.model_dump()
    data["case_id"] = case_id
    data["uploaded_by"] = current_user.id
    data["uploaded_at"] = datetime.now(timezone.utc).isoformat()
    data["state"] = "pending"

    created = await repo.insert(data)

    await audit_repo.log_action(
            action="register_document",
            user=current_user.id,
            case_id=case_id,
            details={"type": data["document_type"]},
    )
    return created

@router.patch("/documents/{document_id}/review", response_model=Document)
async def review_document(
    document_id: str,
    review_in: DocumentReview,
    current_user: Annotated[User, Depends(require_permission(Permission.REVIEWER))],
):
    doc = await repo.find_by_id(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    updates = {
        "state": review_in.state.value,
        "verified_by": current_user.id,
        "verified_at": datetime.now(timezone.utc).isoformat(),
    }

    updated = await repo.update(document_id, updates)

    await audit_repo.log_action(
        action="review_document",
        user=current_user.id,
        case_id=doc["case_id"],
        details={"new_state": review_in.state.value},
    )
    return updated
