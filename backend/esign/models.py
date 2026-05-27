"""SQLAlchemy models for the eSign module.

Schema names are kept exactly as specified in RealProfits_eSign_Scope.docx:
documents, signers, signature_fields, audit_events. This keeps the future
billing module (subscriptions, subscription_events, upgrade_prompts) connecting
cleanly via foreign keys.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from .database import Base


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ENUM constants (use VARCHAR for portability + flexibility)
DOC_STATUSES = ("draft", "sent", "partial", "completed", "expired", "voided", "declined")
SIGNER_ROLES = ("signer", "approver", "cc", "witness")
SIGNING_ORDERS = ("sequential", "parallel")
SIGNER_STATUSES = ("pending", "notified", "viewed", "signed", "declined")
FIELD_TYPES = ("signature", "initials", "date", "text", "checkbox", "stamp")


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    owner_id = Column(String(64), nullable=False, index=True)  # Mongo user ObjectId string
    title = Column(String(255), nullable=False)
    original_key = Column(String(500), nullable=False)  # relative path on disk
    signed_key = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="draft")
    doc_hash = Column(String(64), nullable=True)  # SHA-256 of original PDF
    signing_order = Column(String(20), nullable=False, default="parallel")
    page_count = Column(Integer, nullable=False, default=1)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    settings = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_now, onupdate=_now)

    signers = relationship("Signer", back_populates="document", cascade="all, delete-orphan",
                           order_by="Signer.order_index")
    fields = relationship("SignatureField", back_populates="document", cascade="all, delete-orphan")
    events = relationship("AuditEvent", back_populates="document", cascade="all, delete-orphan",
                          order_by="AuditEvent.occurred_at")


class Signer(Base):
    __tablename__ = "signers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"),
                         nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="signer")
    order_index = Column(Integer, nullable=False, default=0)
    color = Column(String(7), nullable=False, default="#0B3D3D")
    token_hash = Column(String(128), nullable=True, index=True)  # SHA-256 of signing JWT
    token_used = Column(Boolean, nullable=False, default=False)
    status = Column(String(20), nullable=False, default="pending")
    signed_at = Column(DateTime(timezone=True), nullable=True)
    viewed_at = Column(DateTime(timezone=True), nullable=True)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(Text, nullable=True)
    geo_country = Column(String(100), nullable=True)
    geo_city = Column(String(100), nullable=True)
    reminder_count = Column(Integer, nullable=False, default=0)
    decline_reason = Column(Text, nullable=True)

    document = relationship("Document", back_populates="signers")
    fields = relationship("SignatureField", back_populates="signer", cascade="all, delete-orphan")


class SignatureField(Base):
    __tablename__ = "signature_fields"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"),
                         nullable=False, index=True)
    signer_id = Column(UUID(as_uuid=True), ForeignKey("signers.id", ondelete="CASCADE"),
                       nullable=False, index=True)
    page = Column(Integer, nullable=False, default=1)
    # Fractional coords (0.0–1.0) of the page — multiply by page dims at render time
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    width = Column(Float, nullable=False, default=0.2)
    height = Column(Float, nullable=False, default=0.06)
    field_type = Column(String(20), nullable=False, default="signature")
    required = Column(Boolean, nullable=False, default=True)
    label = Column(String(100), nullable=True)
    filled_at = Column(DateTime(timezone=True), nullable=True)
    value = Column(Text, nullable=True)  # text/checkbox value or base64 PNG for signature

    document = relationship("Document", back_populates="fields")
    signer = relationship("Signer", back_populates="fields")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"),
                         nullable=False, index=True)
    signer_id = Column(UUID(as_uuid=True), ForeignKey("signers.id", ondelete="SET NULL"),
                       nullable=True)
    event_type = Column(String(50), nullable=False)  # document_sent|viewed|signed|declined|...
    occurred_at = Column(DateTime(timezone=True), nullable=False, default=_now, index=True)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(Text, nullable=True)
    event_metadata = Column("metadata", JSONB, nullable=True)

    document = relationship("Document", back_populates="events")


Index("ix_signers_doc_order", Signer.document_id, Signer.order_index)
