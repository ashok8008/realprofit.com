"""Guest (non-authenticated) eSign endpoints.

Business rules (per product requirement):
- A guest can upload a PDF, place fields, add ONE signer (role="signer"),
  and send the document — without creating an account.
- Adding a 2nd signer, OR any approver/witness/cc role, requires login.
  The frontend enforces this UX-wise; the backend re-validates here too.
- Before signing emails go out, the guest sender's identity is verified via
  a 6-digit code emailed to their address (legal-audit hygiene). The doc
  stays in status="pending_sender_verification" until verified.
- Anti-abuse: at most MAX_GUEST_SENDS_PER_IP_24H verified sends per remote
  IP per 24 hours.
- Auto-attach: when a user later registers/logs in with the verified
  sender email, all guest docs owned by `guest:<email>` are reassigned to
  their Mongo user id.
"""
from __future__ import annotations

import base64
import os
import secrets
import uuid as _uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from . import email_service, pdf_processor, storage, tokens as esign_tokens
from .database import get_session
from .models import AuditEvent, Document, SignatureField, Signer

router = APIRouter(prefix="/api/esign/guest", tags=["esign-guest"])

MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB — stricter for guests than paid
MAX_PAGES = 20
MAX_GUEST_SENDS_PER_IP_24H = 3
VERIFICATION_TTL_MIN = 30


# ─────────────────────────────────────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────────────────────────────────────

class GuestField(BaseModel):
    page: int
    x: float
    y: float
    width: float
    height: float
    field_type: str
    required: bool = True
    label: Optional[str] = None

    @field_validator("x", "y", "width", "height")
    @classmethod
    def _frac(cls, v: float) -> float:
        if not (0.0 <= v <= 1.0):
            raise ValueError("must be a fraction 0..1")
        return v


class GuestSendRequest(BaseModel):
    title: str
    sender_name: str
    sender_email: EmailStr
    signer_name: str
    signer_email: EmailStr
    fields: List[GuestField]
    signing_order: str = "parallel"  # only 1 signer so this is informational


class VerifyRequest(BaseModel):
    verification_id: str
    code: str


class GuestStatusResponse(BaseModel):
    document_id: str
    title: str
    status: str
    signer_status: str
    signed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _gen_code() -> str:
    return f"{secrets.randbelow(900_000) + 100_000}"  # 6 digits, no leading zero


def _hash_code(code: str) -> str:
    return bcrypt.hashpw(code.encode("utf-8"), bcrypt.gensalt(rounds=8)).decode("utf-8")


def _verify_code(code: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(code.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


async def _check_guest_rate_limit(ip: str) -> None:
    """Soft rate limit: count successful guest sends from this IP in the last 24h."""
    db = get_db()
    since = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    count = await db.esign_guest_sends.count_documents({"ip": ip, "verified_at": {"$gte": since}})
    if count >= MAX_GUEST_SENDS_PER_IP_24H:
        raise HTTPException(429, f"Guest send limit reached ({MAX_GUEST_SENDS_PER_IP_24H} per day). Please sign up for unlimited.")


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/documents")
async def guest_create(
    request: Request,
    file: UploadFile = File(...),
    payload: str = Form(...),  # JSON-encoded GuestSendRequest
    session: AsyncSession = Depends(get_session),
):
    """Guest creates a document + signer + fields + sender info in one POST.

    The doc is created with status='pending_sender_verification'. A 6-digit
    code is emailed to the sender's address; on verification, the signing
    email is sent.
    """
    import json
    try:
        body = GuestSendRequest.model_validate(json.loads(payload))
    except Exception as e:
        raise HTTPException(400, f"Invalid payload: {e}")

    # ── Validations ───────────────────────────────────────────────────────
    if body.sender_email.lower() == body.signer_email.lower():
        raise HTTPException(400, "The sender and signer cannot be the same email address. Add yourself as the only signer? Sign up — guest mode is for sending to others.")

    ip = _client_ip(request)
    await _check_guest_rate_limit(ip)

    if not file.content_type or "pdf" not in file.content_type.lower():
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(400, "Only PDF files are allowed")
    content = await file.read()
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(413, "File too large (guest limit: 10 MB — sign up for 50 MB)")
    if not content.startswith(b"%PDF"):
        raise HTTPException(400, "File is not a valid PDF")

    page_count = pdf_processor.get_page_count(content)
    if page_count > MAX_PAGES:
        raise HTTPException(413, f"Too many pages (guest limit: {MAX_PAGES} — sign up for unlimited)")

    # Validate fields reference page numbers within the document.
    for f in body.fields:
        if f.page < 1 or f.page > page_count:
            raise HTTPException(400, f"Field references page {f.page} but document has {page_count} pages")

    # ── Create the doc + signer + fields ───────────────────────────────────
    sender_email_norm = body.sender_email.lower().strip()
    code = _gen_code()
    code_expires = datetime.now(timezone.utc) + timedelta(minutes=VERIFICATION_TTL_MIN)
    verification_id = secrets.token_urlsafe(24)

    doc = Document(
        owner_id=f"guest:{sender_email_norm}",  # special owner prefix; reassigned on signup
        title=body.title.strip()[:255] or "Untitled document",
        original_key="",
        status="pending_verify",
        signing_order="parallel",
        page_count=page_count,
        settings={
            "uuid_enabled": True,
            "qr_enabled": True,
            "brand_enabled": True,  # free guests get RealProfits branding on the audit page
            "email_owner_on_view": False,
            "reminder_days": [3, 7, 14],
            "guest": True,
            "sender_name": body.sender_name.strip()[:120],
            "sender_email": sender_email_norm,
            "ip": ip,
            "verification_id": verification_id,
            "verification_code_hash": _hash_code(code),
            "verification_expires_at": code_expires.isoformat(),
            "verification_attempts": 0,
        },
    )
    session.add(doc)
    await session.flush()

    rel_key, sha = storage.save_original(str(doc.id), content)
    doc.original_key = rel_key
    doc.doc_hash = sha

    signer = Signer(
        document_id=doc.id,
        name=body.signer_name.strip()[:120],
        email=body.signer_email.lower().strip(),
        role="signer",
        order_index=0,
        color="#0B3D3D",
        status="pending",
        reminder_count=0,
    )
    session.add(signer)
    await session.flush()

    for f in body.fields:
        session.add(SignatureField(
            document_id=doc.id,
            signer_id=signer.id,
            page=f.page,
            x=f.x, y=f.y, width=f.width, height=f.height,
            field_type=f.field_type,
            required=f.required,
            label=(f.label or None),
        ))

    session.add(AuditEvent(
        document_id=doc.id,
        signer_id=None,
        event_type="guest_created",
        occurred_at=datetime.now(timezone.utc),
        ip_address=ip,
        user_agent=(request.headers.get("user-agent") or "")[:500],
        event_metadata={"sender_email": sender_email_norm},
    ))

    await session.commit()

    # ── Email the verification code ────────────────────────────────────────
    try:
        await email_service.send_guest_verification(
            to_email=sender_email_norm,
            sender_name=body.sender_name,
            document_title=doc.title,
            signer_name=body.signer_name,
            signer_email=body.signer_email,
            code=code,
            expires_minutes=VERIFICATION_TTL_MIN,
        )
    except Exception:
        # Don't roll back — surface a soft failure to the client. They can
        # re-trigger the email via a (future) /resend endpoint.
        pass

    return {
        "verification_id": verification_id,
        "expires_at": code_expires.isoformat(),
        "sender_email": sender_email_norm,
        "document_id": str(doc.id),
    }


@router.post("/documents/verify")
async def guest_verify(
    request: Request,
    body: VerifyRequest,
    session: AsyncSession = Depends(get_session),
):
    """Confirm the sender owns the email by checking the 6-digit code.
    On success: status='sent', signer JWT minted, signing email dispatched."""
    res = await session.execute(
        select(Document).where(Document.status == "pending_verify")
    )
    candidates = res.scalars().all()
    doc: Optional[Document] = None
    for c in candidates:
        if c.settings.get("verification_id") == body.verification_id:
            doc = c
            break
    if not doc:
        raise HTTPException(404, "Verification request not found or already used.")

    # Expiry
    try:
        expires_at = datetime.fromisoformat(doc.settings.get("verification_expires_at", ""))
    except Exception:
        expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(410, "Verification code expired. Start over.")

    attempts = int(doc.settings.get("verification_attempts", 0) or 0)
    if attempts >= 5:
        raise HTTPException(429, "Too many attempts. Start over.")

    if not _verify_code(body.code.strip(), doc.settings.get("verification_code_hash", "")):
        # Persist increased attempt count
        new_settings = dict(doc.settings or {})
        new_settings["verification_attempts"] = attempts + 1
        doc.settings = new_settings
        await session.commit()
        raise HTTPException(401, f"Incorrect code. {4 - attempts} attempts left.")

    # ── Verified — promote to "sent" and dispatch signing email ─────────────
    sender_email = doc.settings.get("sender_email") or ""
    sender_name = doc.settings.get("sender_name") or "Document sender"

    # Load the (only) signer.
    s_res = await session.execute(select(Signer).where(Signer.document_id == doc.id))
    signers = s_res.scalars().all()
    if not signers:
        raise HTTPException(500, "Document has no signers — please contact support.")
    signer = signers[0]

    # Mint signing token & store its hash.
    sign_token = esign_tokens.create_signing_token(
        str(signer.id), str(doc.id), signer.email,
        # Use the doc's expires_at if set, otherwise 30 days from now.
        expires_at=doc.expires_at or (datetime.now(timezone.utc) + timedelta(days=30)),
    )
    signer.token_hash = esign_tokens.hash_token(sign_token)
    signer.status = "notified"

    # Clear verification material from settings (they're sensitive).
    new_settings = dict(doc.settings or {})
    for k in ("verification_code_hash", "verification_expires_at",
              "verification_attempts", "verification_id"):
        new_settings.pop(k, None)
    new_settings["sender_verified_at"] = datetime.now(timezone.utc).isoformat()
    doc.settings = new_settings
    doc.status = "sent"

    session.add(AuditEvent(
        document_id=doc.id,
        signer_id=None,
        event_type="guest_sender_verified",
        occurred_at=datetime.now(timezone.utc),
        ip_address=_client_ip(request),
        user_agent=(request.headers.get("user-agent") or "")[:500],
        event_metadata={"sender_email": sender_email},
    ))
    session.add(AuditEvent(
        document_id=doc.id,
        signer_id=signer.id,
        event_type="document_sent",
        occurred_at=datetime.now(timezone.utc),
        ip_address=_client_ip(request),
        event_metadata={"role": signer.role},
    ))
    await session.commit()

    # Record rate-limit successful send (Mongo).
    try:
        db = get_db()
        await db.esign_guest_sends.insert_one({
            "ip": doc.settings.get("ip") or _client_ip(request),
            "sender_email": sender_email,
            "document_id": str(doc.id),
            "verified_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception:
        pass

    # Dispatch signing email.
    app_url = os.environ.get("APP_URL", os.environ.get("FRONTEND_URL", "http://localhost:3000")).rstrip("/")
    sign_url = f"{app_url}/sign/{sign_token}"
    expiry_str = doc.expires_at.strftime("%b %d, %Y") if doc.expires_at else None
    try:
        await email_service.send_signature_request(
            to_email=signer.email, signer_name=signer.name, owner_name=sender_name,
            document_title=doc.title, sign_url=sign_url, expires=expiry_str,
            role=signer.role,
        )
    except Exception:
        pass

    # Mint a short-lived guest "claim token" so the guest can poll status.
    claim_token = secrets.token_urlsafe(24)
    new_settings = dict(doc.settings)
    new_settings["claim_token"] = claim_token
    doc.settings = new_settings
    await session.commit()

    return {
        "document_id": str(doc.id),
        "status": "sent",
        "claim_token": claim_token,
    }


@router.get("/documents/{document_id}/status", response_model=GuestStatusResponse)
async def guest_status(
    document_id: str,
    claim: str,
    session: AsyncSession = Depends(get_session),
):
    """Poll status of a guest document via the claim token."""
    try:
        doc_uuid = _uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(404, "Document not found.")
    res = await session.execute(select(Document).where(Document.id == doc_uuid))
    doc = res.scalar_one_or_none()
    if not doc or (doc.settings or {}).get("claim_token") != claim:
        raise HTTPException(404, "Document not found.")
    s_res = await session.execute(select(Signer).where(Signer.document_id == doc.id))
    signer = s_res.scalar_one_or_none()
    return GuestStatusResponse(
        document_id=str(doc.id),
        title=doc.title,
        status=doc.status,
        signer_status=(signer.status if signer else "unknown"),
        signed_at=(signer.signed_at if signer else None),
        completed_at=doc.completed_at,
    )
