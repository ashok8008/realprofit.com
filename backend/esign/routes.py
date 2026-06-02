"""eSign API routes — FastAPI router.

Owner endpoints (auth required, JWT cookie):
  POST   /api/esign/documents               Create document + upload PDF
  GET    /api/esign/documents               List user's documents
  GET    /api/esign/documents/{id}          Document detail
  PATCH  /api/esign/documents/{id}          Update title/settings/signers/fields
  DELETE /api/esign/documents/{id}          Delete
  POST   /api/esign/documents/{id}/send     Send to signers (creates tokens, emails)
  POST   /api/esign/documents/{id}/void     Void document
  GET    /api/esign/documents/{id}/original Download original PDF
  GET    /api/esign/documents/{id}/signed   Download signed PDF

Public endpoints (token-based, no auth):
  GET    /api/esign/sign/{token}            Get signing view (records 'viewed' event)
  POST   /api/esign/sign/{token}/submit     Submit all field values
  POST   /api/esign/sign/{token}/decline    Decline with reason
  GET    /api/esign/sign/{token}/pdf        Public-key download of original PDF for the signer
  GET    /api/esign/verify/{doc_id}         Public verification endpoint
"""
from __future__ import annotations

import base64
import os
from datetime import datetime, timezone
from typing import Optional, List

import jwt as pyjwt
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form, BackgroundTasks, Depends
from fastapi.responses import Response, StreamingResponse, JSONResponse
from sqlalchemy import select, func, delete, Integer, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth import get_current_user
from . import storage, tokens as esign_tokens, pdf_processor, email_service
from .database import get_session
from .models import Document, Signer, SignatureField, AuditEvent
from .schemas import (
    DocumentOut, DocumentListItem, DocumentUpdate, SignerOut, FieldOut,
    SignerPublicView, SignSubmission, DeclineBody, SignerSummary,
)
from billing.service import (
    assert_can_create_doc, assert_can_set_signers, increment_doc_counter,
    is_branding_required, get_or_create_subscription,
)

router = APIRouter(prefix="/api/esign", tags=["esign"])

SIGNER_COLORS = ["#0B3D3D", "#C8A96E", "#7B6BC7", "#B53D2F", "#2A6B45",
                 "#A0621A", "#3A7CA5", "#8B4A6E", "#4A6E3A", "#6B3D8E"]

MAX_FILE_BYTES = 25 * 1024 * 1024  # 25 MB free


# ---------------- helpers ----------------

def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _user_agent(request: Request) -> str:
    return request.headers.get("user-agent", "")[:512]


async def _load_doc(session: AsyncSession, doc_id: str, owner_id: Optional[str] = None) -> Document:
    q = (
        select(Document)
        .where(Document.id == doc_id)
        .options(selectinload(Document.signers), selectinload(Document.fields))
    )
    res = await session.execute(q)
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    if owner_id and str(doc.owner_id) != str(owner_id):
        raise HTTPException(403, "Not authorized for this document")
    return doc


async def _add_audit(session: AsyncSession, doc_id, signer_id, event_type: str,
                     request: Optional[Request] = None, metadata: Optional[dict] = None):
    evt = AuditEvent(
        document_id=doc_id,
        signer_id=signer_id,
        event_type=event_type,
        ip_address=_client_ip(request) if request else None,
        user_agent=_user_agent(request) if request else None,
        event_metadata=metadata,
    )
    session.add(evt)


# ---------------- Owner endpoints ----------------

@router.post("/documents", response_model=DocumentOut)
async def create_document(
    request: Request,
    title: str = Form(...),
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
):
    user = await get_current_user(request)
    if not file.content_type or "pdf" not in file.content_type.lower():
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(400, "Only PDF files are allowed")
    content = await file.read()
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(413, "File too large (max 25 MB)")
    # Magic-byte check
    if not content.startswith(b"%PDF"):
        raise HTTPException(400, "File is not a valid PDF")

    page_count = pdf_processor.get_page_count(content)

    # Tier-gating: docs/mo, file size, page count
    sub = await assert_can_create_doc(session, str(user["_id"]), len(content), page_count)
    branding_required = is_branding_required(sub.tier)

    doc = Document(
        owner_id=str(user["_id"]),
        title=title.strip()[:255],
        original_key="",  # filled below
        status="draft",
        signing_order="parallel",
        page_count=page_count,
        settings={
            "uuid_enabled": True,
            "qr_enabled": True,
            "brand_enabled": branding_required or True,  # free can't disable; paid defaults on
            "email_owner_on_view": False,
            "reminder_days": [3, 7, 14],
        },
    )
    session.add(doc)
    await session.flush()  # populate doc.id

    rel_key, sha = storage.save_original(str(doc.id), content)
    doc.original_key = rel_key
    doc.doc_hash = sha

    await increment_doc_counter(session, sub)
    await _add_audit(session, doc.id, None, "document_created", request,
                     metadata={"title": title, "page_count": page_count, "tier": sub.tier})
    await session.commit()
    await session.refresh(doc, attribute_names=["signers", "fields"])
    return doc


@router.get("/documents")
async def list_documents(request: Request, session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    q = (
        select(
            Document,
            func.count(Signer.id).label("signer_count"),
            func.sum(func.cast(Signer.status == "signed", type_=Integer)).label("signed_count"),
        )
        .outerjoin(Signer, Signer.document_id == Document.id)
        .where(Document.owner_id == str(user["_id"]))
        .group_by(Document.id)
        .order_by(Document.created_at.desc())
    )
    res = await session.execute(q)
    items: List[dict] = []
    for doc, signer_count, signed_count in res.all():
        items.append({
            "id": str(doc.id),
            "title": doc.title,
            "status": doc.status,
            "page_count": doc.page_count,
            "created_at": doc.created_at.isoformat(),
            "expires_at": doc.expires_at.isoformat() if doc.expires_at else None,
            "signer_count": signer_count or 0,
            "signed_count": int(signed_count or 0),
        })
    return {"documents": items}


@router.get("/documents/{doc_id}", response_model=DocumentOut)
async def get_document(doc_id: str, request: Request, session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    return await _load_doc(session, doc_id, owner_id=str(user["_id"]))


@router.patch("/documents/{doc_id}", response_model=DocumentOut)
async def update_document(doc_id: str, body: DocumentUpdate, request: Request,
                           session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    doc = await _load_doc(session, doc_id, owner_id=str(user["_id"]))
    if doc.status not in ("draft", "sent", "partial"):
        raise HTTPException(400, f"Cannot edit document in status '{doc.status}'")

    if body.title is not None:
        doc.title = body.title[:255]
    if body.signing_order is not None:
        doc.signing_order = body.signing_order
    if body.expires_at is not None:
        doc.expires_at = body.expires_at
    if body.settings is not None:
        # Enforce branding: free users cannot disable
        sub = await get_or_create_subscription(session, str(user["_id"]))
        new_settings = body.settings.model_dump()
        if is_branding_required(sub.tier):
            new_settings["brand_enabled"] = True
        doc.settings = new_settings

    # Replace signers if provided
    if body.signers is not None:
        # Tier-gate signer count
        await assert_can_set_signers(session, str(user["_id"]), len(body.signers))
        # Wipe existing signers + fields (CASCADE on signer→fields)
        await session.execute(delete(SignatureField).where(SignatureField.document_id == doc.id))
        await session.execute(delete(Signer).where(Signer.document_id == doc.id))
        await session.flush()
        for idx, s in enumerate(body.signers):
            color = s.color or SIGNER_COLORS[idx % len(SIGNER_COLORS)]
            session.add(Signer(
                document_id=doc.id, name=s.name, email=s.email.lower(),
                role=s.role, order_index=s.order_index, color=color,
            ))
        await session.flush()

    # Replace fields if provided
    if body.fields is not None:
        await session.execute(delete(SignatureField).where(SignatureField.document_id == doc.id))
        await session.flush()
        for f in body.fields:
            session.add(SignatureField(
                document_id=doc.id, signer_id=f.signer_id, page=f.page,
                x=f.x, y=f.y, width=f.width, height=f.height,
                field_type=f.field_type, required=f.required, label=f.label,
            ))

    doc.updated_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(doc, attribute_names=["signers", "fields"])
    return doc


@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, request: Request, session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    doc = await _load_doc(session, doc_id, owner_id=str(user["_id"]))
    storage.delete_document(str(doc.id))
    await session.delete(doc)
    await session.commit()
    return {"message": "deleted"}


@router.post("/documents/{doc_id}/send")
async def send_document(doc_id: str, request: Request, background: BackgroundTasks,
                         session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    doc = await _load_doc(session, doc_id, owner_id=str(user["_id"]))
    if not doc.signers:
        raise HTTPException(400, "Add at least one signer before sending")
    if not doc.fields:
        raise HTTPException(400, "Place at least one signature field before sending")

    app_url = os.environ.get("APP_URL", os.environ.get("FRONTEND_URL", "http://localhost:3000"))
    owner_name = user.get("name") or user.get("email", "Document owner")

    # Determine which signers get notified now (parallel = all; sequential = order_index 0 only)
    if doc.signing_order == "sequential":
        ordered = sorted(doc.signers, key=lambda s: s.order_index)
        to_notify = [ordered[0]] if ordered else []
    else:
        to_notify = list(doc.signers)

    # Generate tokens for ALL signers (we'll still email only the relevant ones now)
    raw_tokens: dict[str, str] = {}  # signer_id → raw token (in-memory only)
    for s in doc.signers:
        token = esign_tokens.create_signing_token(str(s.id), str(doc.id), s.email,
                                                  expires_at=doc.expires_at)
        s.token_hash = esign_tokens.hash_token(token)
        s.token_used = False
        s.status = "notified" if s in to_notify else "pending"
        raw_tokens[str(s.id)] = token

    doc.status = "sent"
    doc.updated_at = datetime.now(timezone.utc)
    await _add_audit(session, doc.id, None, "document_sent", request,
                     metadata={"recipients": [s.email for s in to_notify]})
    await session.commit()

    expiry_str = doc.expires_at.strftime("%b %d, %Y") if doc.expires_at else None
    for s in to_notify:
        sign_url = f"{app_url}/sign/{raw_tokens[str(s.id)]}"
        background.add_task(
            email_service.send_signature_request,
            to_email=s.email, signer_name=s.name, owner_name=owner_name,
            document_title=doc.title, sign_url=sign_url, expires=expiry_str,
        )

    return {"status": "sent", "recipients": len(to_notify)}


@router.post("/documents/{doc_id}/void")
async def void_document(doc_id: str, request: Request, background: BackgroundTasks,
                         session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    doc = await _load_doc(session, doc_id, owner_id=str(user["_id"]))
    if doc.status in ("completed", "voided"):
        raise HTTPException(400, f"Cannot void a {doc.status} document")
    doc.status = "voided"
    doc.updated_at = datetime.now(timezone.utc)
    await _add_audit(session, doc.id, None, "document_voided", request)
    await session.commit()

    for s in doc.signers:
        background.add_task(email_service.send_voided, to_email=s.email,
                            recipient_name=s.name, document_title=doc.title)
    return {"status": "voided"}


@router.get("/documents/{doc_id}/original")
async def download_original(doc_id: str, request: Request, session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    doc = await _load_doc(session, doc_id, owner_id=str(user["_id"]))
    data = storage.read(doc.original_key)
    if data is None:
        raise HTTPException(404, "File missing")
    return Response(content=data, media_type="application/pdf",
                    headers={"Content-Disposition": f'inline; filename="{doc.title}.pdf"'})


@router.get("/documents/{doc_id}/signed")
async def download_signed(doc_id: str, request: Request, session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    doc = await _load_doc(session, doc_id, owner_id=str(user["_id"]))
    if not doc.signed_key:
        raise HTTPException(404, "Document not yet signed")
    data = storage.read(doc.signed_key)
    if data is None:
        raise HTTPException(404, "Signed file missing")
    return Response(content=data, media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="{doc.title}-signed.pdf"'})


# ---------------- Public signing endpoints ----------------

async def _resolve_token(session: AsyncSession, token: str) -> tuple[Document, Signer]:
    try:
        payload = esign_tokens.decode_signing_token(token)
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(410, "This link has expired. Contact the sender.")
    except pyjwt.InvalidTokenError:
        raise HTTPException(401, "Invalid signing link.")
    token_hash = esign_tokens.hash_token(token)
    res = await session.execute(
        select(Signer).where(Signer.id == payload["sid"], Signer.token_hash == token_hash)
        .options(selectinload(Signer.document).selectinload(Document.fields))
    )
    signer = res.scalar_one_or_none()
    if not signer:
        raise HTTPException(401, "Invalid signing link.")
    doc = signer.document
    if doc.status == "voided":
        raise HTTPException(410, "This document has been voided.")
    if doc.status == "expired":
        raise HTTPException(410, "This document has expired.")
    return doc, signer


@router.get("/sign/{token}", response_model=SignerPublicView)
async def signing_view(token: str, request: Request, session: AsyncSession = Depends(get_session)):
    doc, signer = await _resolve_token(session, token)

    # Record view (only once)
    if not signer.viewed_at:
        signer.viewed_at = datetime.now(timezone.utc)
        signer.status = "viewed" if signer.status in ("pending", "notified") else signer.status
        signer.ip_address = _client_ip(request)
        signer.user_agent = _user_agent(request)
        await _add_audit(session, doc.id, signer.id, "viewed", request)
        await session.commit()

    fields = [f for f in doc.fields if str(f.signer_id) == str(signer.id)]
    # Show other signers' already-filled values (read-only overlays) so the
    # witness / next signer sees signatures that earlier signers have applied.
    other_filled_fields = [
        f for f in doc.fields
        if str(f.signer_id) != str(signer.id) and f.value is not None
    ]
    # Lightweight signer summary list for labels / colors.
    res_signers = await session.execute(
        select(Signer).where(Signer.document_id == doc.id).order_by(Signer.order_index)
    )
    all_signers = res_signers.scalars().all()

    return SignerPublicView(
        document_id=doc.id, document_title=doc.title, page_count=doc.page_count,
        signer_name=signer.name, signer_email=signer.email,
        fields=[FieldOut.model_validate(f) for f in fields],
        other_filled_fields=[FieldOut.model_validate(f) for f in other_filled_fields],
        signers=[SignerSummary.model_validate(s) for s in all_signers],
        already_signed=signer.token_used,
        expired=False,
    )


@router.get("/sign/{token}/pdf")
async def signer_pdf(token: str, session: AsyncSession = Depends(get_session)):
    doc, _signer = await _resolve_token(session, token)
    data = storage.read(doc.original_key)
    if data is None:
        raise HTTPException(404, "File missing")
    return Response(content=data, media_type="application/pdf")


@router.post("/sign/{token}/submit")
async def submit_signature(token: str, body: SignSubmission, request: Request,
                             background: BackgroundTasks,
                             session: AsyncSession = Depends(get_session)):
    doc, signer = await _resolve_token(session, token)
    if signer.token_used:
        raise HTTPException(403, "Already signed")
    if not body.consent:
        raise HTTPException(400, "Legal consent required to sign")

    # Save each field value
    value_by_id = {str(fv.field_id): fv.value for fv in body.field_values}
    res = await session.execute(
        select(SignatureField).where(SignatureField.signer_id == signer.id)
    )
    fields = res.scalars().all()
    now = datetime.now(timezone.utc)
    missing_required = []
    for f in fields:
        v = value_by_id.get(str(f.id))
        if f.required and not v:
            missing_required.append(f.label or f.field_type)
            continue
        if v is not None:
            f.value = v
            f.filled_at = now
    if missing_required:
        raise HTTPException(400, f"Missing required fields: {', '.join(missing_required)}")

    signer.status = "signed"
    signer.token_used = True
    signer.signed_at = now
    signer.ip_address = _client_ip(request)
    signer.user_agent = _user_agent(request)
    await _add_audit(session, doc.id, signer.id, "signed", request,
                     metadata={"name_typed": body.signer_name})

    # Re-fetch all signers
    res = await session.execute(
        select(Signer).where(Signer.document_id == doc.id).order_by(Signer.order_index)
    )
    all_signers = res.scalars().all()
    remaining = [s for s in all_signers if s.status not in ("signed", "declined") and s.role != "cc"]

    # Sequential: trigger next signer
    next_to_notify: Optional[Signer] = None
    if doc.signing_order == "sequential" and remaining:
        next_to_notify = remaining[0]

    if not remaining:
        # All done — generate signed PDF + audit page
        signed_pdf, audit_pdf = await _finalize_document(session, doc, all_signers)
        doc.status = "completed"
        doc.completed_at = now
        await _add_audit(session, doc.id, None, "completed", request)
        await session.commit()

        # Email everybody with attachments
        app_url = os.environ.get("APP_URL", os.environ.get("FRONTEND_URL", "http://localhost:3000"))
        document_url = f"{app_url}/tools/esign/dashboard"
        signed_b64 = base64.b64encode(signed_pdf).decode() if signed_pdf else None
        audit_b64 = base64.b64encode(audit_pdf).decode() if audit_pdf else None

        # Owner — fetch their email
        # Owner email not stored in Postgres; we send a generic completion email
        # by querying Mongo for owner name+email.
        owner_email, owner_name = await _resolve_owner(doc.owner_id)
        if owner_email:
            background.add_task(email_service.send_completion,
                                to_email=owner_email, recipient_name=owner_name,
                                document_title=doc.title, document_url=document_url,
                                signed_pdf_b64=signed_b64, audit_pdf_b64=audit_b64,
                                is_owner=True)
        for s in all_signers:
            background.add_task(email_service.send_completion,
                                to_email=s.email, recipient_name=s.name,
                                document_title=doc.title, document_url=document_url,
                                signed_pdf_b64=signed_b64, audit_pdf_b64=audit_b64,
                                is_owner=False)
    else:
        doc.status = "partial"
        await session.commit()
        # Notify owner of partial
        owner_email, owner_name = await _resolve_owner(doc.owner_id)
        app_url = os.environ.get("APP_URL", os.environ.get("FRONTEND_URL", "http://localhost:3000"))
        if owner_email:
            background.add_task(email_service.send_partial_notify,
                                to_email=owner_email, owner_name=owner_name,
                                document_title=doc.title, signer_name=signer.name,
                                remaining=len(remaining),
                                document_url=f"{app_url}/tools/esign/dashboard")
        if next_to_notify:
            new_token = esign_tokens.create_signing_token(
                str(next_to_notify.id), str(doc.id), next_to_notify.email,
                expires_at=doc.expires_at)
            next_to_notify.token_hash = esign_tokens.hash_token(new_token)
            next_to_notify.status = "notified"
            await session.commit()
            sign_url = f"{app_url}/sign/{new_token}"
            background.add_task(email_service.send_signature_request,
                                to_email=next_to_notify.email, signer_name=next_to_notify.name,
                                owner_name=owner_name or "Document owner",
                                document_title=doc.title, sign_url=sign_url,
                                expires=doc.expires_at.strftime("%b %d, %Y") if doc.expires_at else None)

    return {"status": "signed", "document_status": doc.status}


@router.post("/sign/{token}/decline")
async def decline_signing(token: str, body: DeclineBody, request: Request,
                            background: BackgroundTasks,
                            session: AsyncSession = Depends(get_session)):
    doc, signer = await _resolve_token(session, token)
    if signer.token_used:
        raise HTTPException(403, "Already signed")
    signer.status = "declined"
    signer.token_used = True
    signer.decline_reason = (body.reason or "")[:1000]
    signer.signed_at = datetime.now(timezone.utc)
    signer.ip_address = _client_ip(request)
    signer.user_agent = _user_agent(request)
    doc.status = "declined"
    doc.updated_at = datetime.now(timezone.utc)
    await _add_audit(session, doc.id, signer.id, "declined", request,
                     metadata={"reason": body.reason})
    await session.commit()

    owner_email, owner_name = await _resolve_owner(doc.owner_id)
    app_url = os.environ.get("APP_URL", os.environ.get("FRONTEND_URL", "http://localhost:3000"))
    document_url = f"{app_url}/tools/esign/dashboard"
    if owner_email:
        background.add_task(email_service.send_declined, to_email=owner_email,
                            recipient_name=owner_name, document_title=doc.title,
                            signer_name=signer.name, reason=body.reason,
                            document_url=document_url)
    for s in doc.signers:
        if s.email != owner_email:
            background.add_task(email_service.send_declined, to_email=s.email,
                                recipient_name=s.name, document_title=doc.title,
                                signer_name=signer.name, reason=body.reason,
                                document_url=document_url)
    return {"status": "declined"}


# ---------------- Public verification ----------------

@router.get("/verify/{doc_id}")
async def verify_document(doc_id: str, session: AsyncSession = Depends(get_session)):
    """Public — verify a document was signed via RealProfits eSign."""
    res = await session.execute(
        select(Document).where(Document.id == doc_id).options(selectinload(Document.signers))
    )
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    return {
        "document_id": str(doc.id),
        "title": doc.title,
        "status": doc.status,
        "completed_at": doc.completed_at.isoformat() if doc.completed_at else None,
        "doc_hash": doc.doc_hash,
        "signers": [
            {
                "name": s.name,
                "email_masked": _mask_email(s.email),
                "status": s.status,
                "signed_at": s.signed_at.isoformat() if s.signed_at else None,
                "signer_id": str(s.id),
            } for s in doc.signers
        ],
    }


def _mask_email(email: str) -> str:
    if "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    if len(local) <= 2:
        return f"***@{domain}"
    return f"{local[0]}***{local[-1]}@{domain}"


# ---------------- Helpers ----------------

async def _resolve_owner(owner_id: str) -> tuple[str, str]:
    """Look up owner email/name from Mongo. Falls back to empty string."""
    try:
        from db import get_db
        from bson import ObjectId
        db = get_db()
        u = await db.users.find_one({"_id": ObjectId(owner_id)})
        if not u:
            return "", ""
        return u.get("email", ""), u.get("name", "") or u.get("email", "")
    except Exception:
        return "", ""


async def _finalize_document(session: AsyncSession, doc: Document,
                               all_signers: list[Signer]) -> tuple[bytes, bytes]:
    """Compose the signed PDF and audit page."""
    original = storage.read(doc.original_key)
    if not original:
        raise HTTPException(500, "Original PDF missing")

    # Load all fields with values
    res = await session.execute(
        select(SignatureField).where(SignatureField.document_id == doc.id)
    )
    fields = res.scalars().all()
    signer_by_id = {str(s.id): s for s in all_signers}

    fields_by_page: dict[int, list[dict]] = {}
    for f in fields:
        s = signer_by_id.get(str(f.signer_id))
        fields_by_page.setdefault(f.page, []).append({
            "field_type": f.field_type,
            "x": f.x, "y": f.y, "width": f.width, "height": f.height,
            "value": f.value,
            "signer_name": s.name if s else "",
            "signer_uuid": str(f.signer_id),
        })

    settings = doc.settings or {}
    merged = pdf_processor.merge_signatures(
        original, fields_by_page,
        uuid_enabled=settings.get("uuid_enabled", True),
        brand_enabled=settings.get("brand_enabled", True),
    )
    final_hash = pdf_processor.sha256_bytes(merged)
    app_url = os.environ.get("APP_URL", os.environ.get("FRONTEND_URL", "http://localhost:3000"))
    verify_url = f"{app_url}/verify/{doc.id}"
    audit = pdf_processor.build_audit_page(doc, all_signers, final_hash, verify_url)
    full = pdf_processor.append_audit_page(merged, audit)
    doc.signed_key = storage.save_signed(str(doc.id), full)
    doc.doc_hash = pdf_processor.sha256_bytes(full)
    return full, audit
