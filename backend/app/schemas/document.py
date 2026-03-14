# backend/app/schemas/document.py
from pydantic import BaseModel, ConfigDict
from enum import Enum
from typing import Optional

class DocumentState(str, Enum):
    PENDING = "pending" # pending_review
    VERIFIED = "verified"
    REJECTED = "rejected"

class DocumentBase(BaseModel):
    case_id: str
    person_id: str
    document_type: str
    storage_path: str

class DocumentCreate(DocumentBase):
    pass

class DocumentReview(BaseModel):
    state: DocumentState

class Document(DocumentBase):
    id: str
    state: DocumentState = DocumentState.PENDING
    uploaded_by: Optional[str] = None
    uploaded_at: str
    verified_by: Optional[str] = None
    verified_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
