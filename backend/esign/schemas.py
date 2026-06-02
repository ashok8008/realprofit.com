"""Pydantic schemas for the eSign API."""
from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, EmailStr, Field
import uuid


class SignerIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    role: Literal["signer", "approver", "cc", "witness"] = "signer"
    order_index: int = 0
    color: Optional[str] = None


class SignerOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    order_index: int
    color: str
    status: str
    signed_at: Optional[datetime] = None
    viewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FieldIn(BaseModel):
    signer_id: uuid.UUID
    page: int = 1
    x: float
    y: float
    width: float = 0.2
    height: float = 0.06
    field_type: Literal["signature", "initials", "date", "text", "checkbox", "stamp"] = "signature"
    required: bool = True
    label: Optional[str] = None


class FieldOut(BaseModel):
    id: uuid.UUID
    signer_id: uuid.UUID
    page: int
    x: float
    y: float
    width: float
    height: float
    field_type: str
    required: bool
    label: Optional[str] = None
    filled_at: Optional[datetime] = None
    value: Optional[str] = None

    class Config:
        from_attributes = True


class DocumentSettings(BaseModel):
    uuid_enabled: bool = True
    qr_enabled: bool = True
    brand_enabled: bool = True  # "Powered by RealProfits" footer
    email_owner_on_view: bool = False
    reminder_days: List[int] = [3, 7, 14]


class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    signing_order: Optional[Literal["sequential", "parallel"]] = None
    expires_at: Optional[datetime] = None
    settings: Optional[DocumentSettings] = None
    signers: Optional[List[SignerIn]] = None
    fields: Optional[List[FieldIn]] = None


class DocumentOut(BaseModel):
    id: uuid.UUID
    title: str
    status: str
    signing_order: str
    page_count: int
    expires_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    settings: dict
    created_at: datetime
    updated_at: datetime
    doc_hash: Optional[str] = None
    signers: List[SignerOut] = []
    fields: List[FieldOut] = []

    class Config:
        from_attributes = True


class DocumentListItem(BaseModel):
    id: uuid.UUID
    title: str
    status: str
    page_count: int
    created_at: datetime
    expires_at: Optional[datetime] = None
    signer_count: int
    signed_count: int


# Public signing API


class SignerSummary(BaseModel):
    id: uuid.UUID
    name: str
    role: str
    order_index: int
    color: str
    status: str
    signed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SignerPublicView(BaseModel):
    document_id: uuid.UUID
    document_title: str
    page_count: int
    signer_name: str
    signer_email: str
    fields: List[FieldOut]
    # Fields belonging to OTHER signers that have already been filled.
    # These are sent so the current signer / witness can preview the document
    # with the existing signatures visible (read-only).
    other_filled_fields: List[FieldOut] = []
    # Lightweight list of all signers (so the UI can label other_filled_fields).
    signers: List[SignerSummary] = []
    already_signed: bool = False
    expired: bool = False


class FieldValue(BaseModel):
    field_id: uuid.UUID
    value: str  # base64 PNG for signature/initials/stamp; plain text otherwise


class SignSubmission(BaseModel):
    signer_name: str  # confirmation typed name
    field_values: List[FieldValue]
    consent: bool = True


class DeclineBody(BaseModel):
    reason: Optional[str] = None
