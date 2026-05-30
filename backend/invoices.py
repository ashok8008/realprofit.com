"""Invoice & Client management API routes."""
import os
import asyncio
import logging
import base64
import secrets as _secrets
from pathlib import Path
import resend
from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from db import get_db
from auth import get_current_user

logger = logging.getLogger(__name__)

# Env vars are read at SEND TIME, not import time — so a late dotenv load
# or env-var change doesn't lock us into a stale/empty value.
def _resend_key() -> str:
    return (os.environ.get("RESEND_API_KEY", "") or "").strip()


def _sender_email() -> str:
    """Return SENDER_EMAIL with whitespace and stray quotes stripped.
    Resend rejects 'foo@bar.com ' (trailing space) or '"foo@bar.com"' (quoted)."""
    raw = os.environ.get("SENDER_EMAIL", "") or ""
    return raw.strip().strip('"').strip("'") or "onboarding@resend.dev"


import re
_EMAIL_RE = re.compile(r"^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$")
_FROM_FIELD_RE = re.compile(r"^[^<>]+<[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>$")


def _validate_from_field(value: str) -> Optional[str]:
    """Validate a Resend 'from' value. Returns error message or None if OK."""
    if not value:
        return "SENDER_EMAIL is empty"
    if _EMAIL_RE.match(value):
        return None
    if _FROM_FIELD_RE.match(value):
        return None
    return (
        f"SENDER_EMAIL={value!r} is not in 'name@domain.com' or "
        "'Name <name@domain.com>' format. Common causes: trailing whitespace, "
        "wrapping quotes, or comments in backend/.env."
    )


INVOICE_STORAGE_DIR = Path(os.environ.get("INVOICE_STORAGE_DIR", "/app/backend/uploads/invoices"))
INVOICE_STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# Cap each invoice's total attachments at 25 MB (Resend allows 40 MB).
MAX_INVOICE_ATTACHMENT_TOTAL = 25 * 1024 * 1024

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

# ── Models ──────────────────────────────────────────────

class LineItem(BaseModel):
    description: str = ""
    qty: float = 1
    unit: str = "hr"
    rate: float = 0

class PaymentRecord(BaseModel):
    amount: float
    date: str = ""
    note: str = ""

class Attachment(BaseModel):
    id: str
    filename: str
    mime: str
    size: int
    uploaded_at: str

class InvoiceCreate(BaseModel):
    invoice_number: str = ""
    date: str = ""
    due_date: str = ""
    status: str = "draft"
    currency: str = "USD"
    # Business
    business_name: str = ""
    business_email: str = ""
    business_phone: str = ""
    business_address: str = ""
    logo_url: str = ""
    accent_color: str = "#0B3D3D"
    # Client
    client_id: Optional[str] = None
    client_name: str = ""
    client_company: str = ""
    client_email: str = ""
    client_address: str = ""
    # Items
    items: List[LineItem] = []
    discount_type: str = "%"
    discount_value: float = 0
    tax_label: str = "Tax"
    tax_rate: float = 0
    # Extras
    notes: str = ""
    payment_terms: str = ""
    payment_link: str = ""
    signature_data: str = ""
    template: str = "minimal"
    # Recurring
    recurring: bool = False
    recurring_period: str = "monthly"
    # Computed
    subtotal: float = 0
    discount_amount: float = 0
    tax_amount: float = 0
    total: float = 0
    payments: List[PaymentRecord] = []
    attachments: List[Attachment] = []

class ClientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    company: str = ""
    email: EmailStr
    address: str = ""

    @field_validator("name", "company", "address", mode="before")
    @classmethod
    def _strip(cls, v: object) -> object:
        return v.strip() if isinstance(v, str) else v

    @field_validator("name")
    @classmethod
    def _name_not_blank(cls, v: str) -> str:
        if not v:
            raise ValueError("Name is required")
        return v

class SendInvoiceEmailRequest(BaseModel):
    invoice_id: str
    recipient_email: str
    subject: str = ""
    message: str = ""

# ── Helpers ─────────────────────────────────────────────

def _clean_doc(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc.pop("user_id", None)
    return doc

# ── Invoice CRUD ────────────────────────────────────────

@router.get("")
async def list_invoices(request: Request):
    user = await get_current_user(request)
    db = get_db()
    cursor = db.invoices.find({"user_id": str(user["_id"])}, {"_id": 1, "invoice_number": 1, "client_name": 1, "client_company": 1, "status": 1, "total": 1, "currency": 1, "date": 1, "due_date": 1, "created_at": 1}).sort("created_at", -1)
    invoices = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        doc.pop("user_id", None)
        invoices.append(doc)
    return invoices

# ── Static routes (MUST be before /{invoice_id}) ────────

@router.get("/stats/summary")
async def invoice_stats(request: Request):
    user = await get_current_user(request)
    db = get_db()
    pipeline = [
        {"$match": {"user_id": str(user["_id"])}},
        {"$group": {
            "_id": None,
            "total_count": {"$sum": 1},
            "total_revenue": {"$sum": "$total"},
            "paid_count": {"$sum": {"$cond": [{"$eq": ["$status", "paid"]}, 1, 0]}},
            "overdue_count": {"$sum": {"$cond": [{"$eq": ["$status", "overdue"]}, 1, 0]}},
        }}
    ]
    result = await db.invoices.aggregate(pipeline).to_list(1)
    if result:
        r = result[0]
        r.pop("_id", None)
        return r
    return {"total_count": 0, "total_revenue": 0, "paid_count": 0, "overdue_count": 0}

@router.get("/settings")
async def get_invoice_settings(request: Request):
    user = await get_current_user(request)
    db = get_db()
    doc = await db.invoice_settings.find_one({"user_id": str(user["_id"])}, {"_id": 0, "user_id": 0})
    return doc or {}

@router.post("/upload-logo")
async def upload_logo(request: Request):
    user = await get_current_user(request)
    form = await request.form()
    file = form.get("file")
    if not file:
        raise HTTPException(400, "No file provided")
    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 2MB)")
    content_type = file.content_type or "image/png"
    if content_type not in ("image/png", "image/jpeg", "image/webp", "image/svg+xml"):
        raise HTTPException(400, "Invalid file type. Use PNG, JPEG, WebP, or SVG")
    b64 = base64.b64encode(content).decode()
    data_url = f"data:{content_type};base64,{b64}"
    db = get_db()
    await db.invoice_settings.update_one(
        {"user_id": str(user["_id"])},
        {"$set": {"logo_url": data_url, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"logo_url": data_url, "status": "uploaded"}

@router.get("/clients/list")
async def list_clients(request: Request):
    user = await get_current_user(request)
    db = get_db()
    cursor = db.invoice_clients.find({"user_id": str(user["_id"])}).sort("name", 1)
    clients = []
    async for doc in cursor:
        clients.append(_clean_doc(doc))
    return clients

@router.post("/clients")
async def create_client(body: ClientCreate, request: Request):
    user = await get_current_user(request)
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()
    doc = body.model_dump()
    doc["user_id"] = str(user["_id"])
    doc["created_at"] = now
    result = await db.invoice_clients.insert_one(doc)
    return {"id": str(result.inserted_id), "status": "created"}

@router.post("/send-email")
async def send_invoice_email(body: SendInvoiceEmailRequest, request: Request):
    user = await get_current_user(request)
    db = get_db()
    doc = await db.invoices.find_one({"_id": ObjectId(body.invoice_id), "user_id": str(user["_id"])})
    if not doc:
        raise HTTPException(404, "Invoice not found")

    api_key = _resend_key()
    sender = _sender_email()
    logger.info(
        "[invoice-send] invoice=%s recipient=%s sender=%r api_key=%s",
        body.invoice_id, body.recipient_email, sender,
        "SET(len=%d)" % len(api_key) if api_key else "EMPTY",
    )

    if not api_key:
        logger.error("[invoice-send] RESEND_API_KEY missing — backend cannot send email")
        raise HTTPException(
            500,
            "Email service is not configured (RESEND_API_KEY missing in backend/.env). "
            "Set the key and restart the backend.",
        )

    sender_err = _validate_from_field(sender)
    if sender_err:
        logger.error("[invoice-send] %s", sender_err)
        raise HTTPException(500, sender_err)

    # Apply the API key just-in-time so a late-loaded .env still works.
    resend.api_key = api_key

    # Pre-flight: Resend sandbox can only send to the account owner.
    if sender == "onboarding@resend.dev":
        owner = (os.environ.get("RESEND_VERIFIED_TO") or "").strip().lower()
        if not owner or owner != body.recipient_email.strip().lower():
            hint = (
                "Resend is in sandbox mode and can only deliver to the email tied to your "
                "Resend account. Verify a domain at https://resend.com/domains and update "
                "SENDER_EMAIL in backend/.env (e.g. sign@yourdomain.com) to send to clients."
            )
            logger.warning("[invoice-send] sandbox-mode block — %s", hint)
            raise HTTPException(400, hint)

    inv_num = doc.get("invoice_number", "INV-000")
    client_name = doc.get("client_name", "Client")
    total = doc.get("total", 0)
    currency = doc.get("currency", "USD")
    due_date = doc.get("due_date", "")
    biz_name = doc.get("business_name", "Your Business")
    biz_email = doc.get("business_email", "")
    accent = doc.get("accent_color", "#0B3D3D")
    items = doc.get("items", [])
    notes = doc.get("notes", "")
    payment_link = doc.get("payment_link", "")
    sym_map = {"USD": "$", "EUR": "€", "GBP": "£", "INR": "₹", "CAD": "C$", "AUD": "A$"}
    sym = sym_map.get(currency, "$")
    subject = body.subject or f"Invoice {inv_num} from {biz_name}"
    custom_msg = body.message or ""
    items_rows = ""
    for item in items:
        desc = item.get("description", "Item")
        qty = item.get("qty", 1)
        unit = item.get("unit", "hr")
        rate = item.get("rate", 0)
        amt = qty * rate
        items_rows += f'<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;">{desc}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">{qty} {unit}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">{sym}{rate:,.2f}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">{sym}{amt:,.2f}</td></tr>'

    # Totals breakdown for email body
    discount_amount = float(doc.get("discount_amount", 0) or 0)
    tax_amount = float(doc.get("tax_amount", 0) or 0)
    tax_label = doc.get("tax_label") or "Tax"
    payments_list = doc.get("payments", []) or []
    paid_total = sum(float(p.get("amount", 0) or 0) for p in payments_list)
    outstanding = max(0.0, float(total) - paid_total)

    totals_rows = ""
    if discount_amount > 0:
        totals_rows += f'<tr><td style="padding:3px 0;color:#666">Discount</td><td style="padding:3px 0;text-align:right;color:#B53D2F">-{sym}{discount_amount:,.2f}</td></tr>'
    if tax_amount > 0:
        totals_rows += f'<tr><td style="padding:3px 0;color:#666">{tax_label}</td><td style="padding:3px 0;text-align:right">{sym}{tax_amount:,.2f}</td></tr>'

    payments_block = ""
    if payments_list:
        rows_p = "".join(
            f'<tr><td style="padding:4px 0;color:#666">{(p.get("date") or "")}</td>'
            f'<td style="padding:4px 0;text-align:right;color:#2A6B45;font-weight:600">'
            f'{sym}{float(p.get("amount", 0) or 0):,.2f}</td></tr>'
            for p in payments_list
        )
        payments_block = (
            f'<div style="margin-top:18px;padding:12px 16px;background:#F7FBF8;border-radius:8px;font-size:13px">'
            f'<div style="font-weight:700;color:#2A6B45;margin-bottom:6px">Payments received</div>'
            f'<table style="width:100%;font-size:12px">{rows_p}</table>'
            f'<div style="margin-top:8px;display:flex;justify-content:space-between;border-top:1px solid #D8E8DE;padding-top:6px">'
            f'<span style="color:#666">Outstanding balance</span>'
            f'<span style="font-weight:700;color:{"#A0621A" if outstanding > 0 else "#2A6B45"}">{sym}{outstanding:,.2f}</span>'
            f'</div></div>'
        )

    payment_btn = ""
    if payment_link:
        payment_btn = f'<div style="text-align:center;margin:24px 0;"><a href="{payment_link}" style="background:{accent};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">Pay Now</a></div>'
    html = f"""
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:{accent};padding:24px 32px;border-radius:8px 8px 0 0;">
        <h1 style="color:#fff;font-size:24px;margin:0;">{biz_name}</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px;">Invoice {inv_num}</p>
      </div>
      <div style="padding:32px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px;">
        <p style="font-size:16px;color:#333;margin:0 0 8px;">Hi {client_name},</p>
        {"<p style='font-size:14px;color:#555;margin:0 0 16px;'>" + custom_msg + "</p>" if custom_msg else ""}
        <p style="font-size:14px;color:#555;margin:0 0 24px;">Please find your invoice details below.</p>
        <div style="background:#f9f8f5;border-radius:8px;padding:16px;margin-bottom:24px;">
          <table style="width:100%;font-size:13px;color:#555;">
            <tr><td style="padding:4px 0;"><strong>Invoice:</strong> {inv_num}</td><td style="text-align:right;padding:4px 0;"><strong>Due:</strong> {due_date}</td></tr>
          </table>
        </div>
        <table style="width:100%;font-size:13px;border-collapse:collapse;">
          <thead><tr style="background:#f5f5f5;">
            <th style="padding:8px 12px;text-align:left;font-weight:600;color:#555;">Description</th>
            <th style="padding:8px 12px;text-align:center;font-weight:600;color:#555;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;color:#555;">Rate</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;color:#555;">Amount</th>
          </tr></thead>
          <tbody>{items_rows}</tbody>
        </table>
        <table style="width:100%;margin-top:14px;font-size:13px;color:#555">{totals_rows}</table>
        <div style="text-align:right;margin-top:8px;padding-top:12px;border-top:2px solid {accent};">
          <span style="font-size:14px;color:#555;">Total Due: </span>
          <span style="font-size:24px;font-weight:700;color:{accent};">{sym}{total:,.2f}</span>
        </div>
        {payments_block}
        {payment_btn}
        {"<div style='background:#f9f8f5;border-radius:8px;padding:12px 16px;margin-top:16px;font-size:13px;color:#666;'><strong>Notes:</strong> " + notes + "</div>" if notes else ""}
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="font-size:12px;color:#999;text-align:center;">Sent via <a href="https://realprofits.com" style="color:{accent};text-decoration:none;">RealProfits</a> Invoice Generator</p>
        {f"<p style='font-size:12px;color:#999;text-align:center;'>{biz_email}</p>" if biz_email else ""}
      </div>
    </div>
    """

    # Load any attachments stored on disk for this invoice and pass them to Resend.
    resend_attachments = []
    for a in doc.get("attachments", []) or []:
        fpath = INVOICE_STORAGE_DIR / str(doc["_id"]) / f'{a["id"]}_{a["filename"]}'
        try:
            data = await asyncio.to_thread(fpath.read_bytes)
            resend_attachments.append({
                "filename": a["filename"],
                "content": base64.b64encode(data).decode(),
            })
        except FileNotFoundError:
            logger.warning("Attachment file missing for invoice %s: %s", doc["_id"], fpath)

    try:
        params = {"from": sender, "to": [body.recipient_email], "subject": subject, "html": html}
        if resend_attachments:
            params["attachments"] = resend_attachments
        logger.info(
            "[invoice-send] calling resend.Emails.send → from=%s to=%s subject=%r attachments=%d",
            sender, body.recipient_email, subject, len(resend_attachments),
        )
        email_result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info("[invoice-send] resend response → %s", email_result)
        await db.invoices.update_one(
            {"_id": ObjectId(body.invoice_id)},
            {"$set": {"status": "sent", "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
        return {
            "status": "sent",
            "email_id": email_result.get("id", "") if isinstance(email_result, dict) else "",
            "message": f"Invoice sent to {body.recipient_email}",
            "attachments_count": len(resend_attachments),
        }
    except HTTPException:
        raise
    except Exception as e:
        msg = str(e)
        logger.exception("[invoice-send] resend.Emails.send raised: %s", msg)
        # Surface Resend's most common errors as user-friendly text.
        lower = msg.lower()
        if "invalid `from`" in lower or ("invalid" in lower and "from" in lower and "field" in lower):
            raise HTTPException(
                500,
                f"SENDER_EMAIL is rejected by Resend: {msg}. Current value: {sender!r}. "
                "Check backend/.env for stray whitespace, quotes, or invalid characters. "
                "Format must be 'name@yourdomain.com' or 'Display Name <name@yourdomain.com>'.",
            )
        if "you can only send testing emails" in lower or ("verify" in lower and "domain" in lower):
            raise HTTPException(
                400,
                "Resend only allows test emails to your account owner address. "
                "Verify a domain at https://resend.com/domains and update SENDER_EMAIL in backend/.env.",
            )
        if "invalid" in lower and "api" in lower:
            raise HTTPException(500, "Email provider rejected the API key. Check RESEND_API_KEY in backend/.env.")
        raise HTTPException(500, f"Failed to send email: {msg}")


# ── Invoice attachments (saved on the invoice itself) ───

@router.post("/{invoice_id}/attachments")
async def upload_attachment(invoice_id: str, request: Request, file: UploadFile = File(...)):
    user = await get_current_user(request)
    db = get_db()
    doc = await db.invoices.find_one({"_id": ObjectId(invoice_id), "user_id": str(user["_id"])})
    if not doc:
        raise HTTPException(404, "Invoice not found")

    content = await file.read()
    size = len(content)
    if size == 0:
        raise HTTPException(400, "Empty file")

    existing_total = sum(int(a.get("size", 0) or 0) for a in doc.get("attachments", []) or [])
    if existing_total + size > MAX_INVOICE_ATTACHMENT_TOTAL:
        raise HTTPException(
            413,
            f"Total attachment size would exceed 25 MB limit. "
            f"Current: {existing_total / 1024 / 1024:.1f} MB, this file: {size / 1024 / 1024:.1f} MB.",
        )

    folder = INVOICE_STORAGE_DIR / invoice_id
    folder.mkdir(parents=True, exist_ok=True)
    att_id = _secrets.token_urlsafe(12)
    safe_name = "".join(c for c in (file.filename or "file") if c.isalnum() or c in ("-", "_", ".")) or "file"
    target = folder / f"{att_id}_{safe_name}"
    await asyncio.to_thread(target.write_bytes, content)

    att = {
        "id": att_id,
        "filename": safe_name,
        "mime": file.content_type or "application/octet-stream",
        "size": size,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.invoices.update_one(
        {"_id": ObjectId(invoice_id)},
        {"$push": {"attachments": att}, "$set": {"updated_at": att["uploaded_at"]}},
    )
    return att


@router.delete("/{invoice_id}/attachments/{attachment_id}")
async def delete_attachment(invoice_id: str, attachment_id: str, request: Request):
    user = await get_current_user(request)
    db = get_db()
    doc = await db.invoices.find_one({"_id": ObjectId(invoice_id), "user_id": str(user["_id"])})
    if not doc:
        raise HTTPException(404, "Invoice not found")
    att = next((a for a in doc.get("attachments", []) or [] if a.get("id") == attachment_id), None)
    if not att:
        raise HTTPException(404, "Attachment not found")
    fpath = INVOICE_STORAGE_DIR / invoice_id / f'{att["id"]}_{att["filename"]}'
    try:
        await asyncio.to_thread(fpath.unlink)
    except FileNotFoundError:
        pass
    await db.invoices.update_one(
        {"_id": ObjectId(invoice_id)},
        {"$pull": {"attachments": {"id": attachment_id}},
         "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"status": "deleted"}


@router.get("/{invoice_id}/attachments/{attachment_id}")
async def download_attachment(invoice_id: str, attachment_id: str, request: Request):
    user = await get_current_user(request)
    db = get_db()
    doc = await db.invoices.find_one({"_id": ObjectId(invoice_id), "user_id": str(user["_id"])})
    if not doc:
        raise HTTPException(404, "Invoice not found")
    att = next((a for a in doc.get("attachments", []) or [] if a.get("id") == attachment_id), None)
    if not att:
        raise HTTPException(404, "Attachment not found")
    fpath = INVOICE_STORAGE_DIR / invoice_id / f'{att["id"]}_{att["filename"]}'
    if not fpath.exists():
        raise HTTPException(404, "File not found on disk")
    return FileResponse(path=fpath, filename=att["filename"], media_type=att.get("mime") or "application/octet-stream")

# ── Public client portal ────────────────────────────────

def _portal_html(doc: dict) -> str:
    """Render a clean public invoice view + Pay button if payment_link is set."""
    sym_map = {"USD": "$", "EUR": "€", "GBP": "£", "INR": "₹", "CAD": "C$", "AUD": "A$"}
    sym = sym_map.get(doc.get("currency", "USD"), "$")
    items = doc.get("items", [])
    rows = ""
    for it in items:
        desc = (it.get("description") or "Item")[:200]
        qty = it.get("qty", 1)
        unit = it.get("unit", "hr")
        rate = it.get("rate", 0)
        amt = qty * rate
        rows += f'<tr><td style="padding:10px 12px;border-bottom:1px solid #eee;">{desc}</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;">{qty} {unit}</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;">{sym}{rate:,.2f}</td><td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">{sym}{amt:,.2f}</td></tr>'

    # Subtotal / discount / tax breakdown
    subtotal = float(doc.get("subtotal", 0) or 0)
    discount_amount = float(doc.get("discount_amount", 0) or 0)
    tax_amount = float(doc.get("tax_amount", 0) or 0)
    tax_label = doc.get("tax_label") or "Tax"
    breakdown = (
        f'<tr><td style="padding:4px 0;color:#6E6B63">Subtotal</td>'
        f'<td style="padding:4px 0;text-align:right">{sym}{subtotal:,.2f}</td></tr>'
    )
    if discount_amount > 0:
        breakdown += (
            f'<tr><td style="padding:4px 0;color:#6E6B63">Discount</td>'
            f'<td style="padding:4px 0;text-align:right;color:#B53D2F">-{sym}{discount_amount:,.2f}</td></tr>'
        )
    if tax_amount > 0:
        breakdown += (
            f'<tr><td style="padding:4px 0;color:#6E6B63">{tax_label}</td>'
            f'<td style="padding:4px 0;text-align:right">{sym}{tax_amount:,.2f}</td></tr>'
        )

    # Payments + outstanding
    payments_list = doc.get("payments", []) or []
    paid_total = sum(float(p.get("amount", 0) or 0) for p in payments_list)
    total = float(doc.get("total", 0) or 0)
    outstanding = max(0.0, total - paid_total)
    payments_block = ""
    if payments_list:
        rows_p = "".join(
            f'<tr><td style="padding:6px 0;color:#6E6B63;font-size:12px">{(p.get("date") or "")}</td>'
            f'<td style="padding:6px 0;text-align:right;color:#2A6B45;font-weight:600;font-size:13px">'
            f'{sym}{float(p.get("amount", 0) or 0):,.2f}</td></tr>'
            for p in payments_list
        )
        payments_block = (
            f'<div style="background:#F7FBF8;border-radius:8px;padding:14px 18px;margin-top:18px">'
            f'<div style="font-weight:700;color:#2A6B45;font-size:13px;margin-bottom:8px">'
            f'Payments received ({len(payments_list)})</div>'
            f'<table style="width:100%">{rows_p}</table>'
            f'<div style="display:flex;justify-content:space-between;border-top:1px solid #D8E8DE;'
            f'padding-top:8px;margin-top:8px;font-size:13px">'
            f'<span style="color:#6E6B63">Outstanding balance</span>'
            f'<span style="font-weight:700;color:{"#A0621A" if outstanding > 0 else "#2A6B45"}">'
            f'{sym}{outstanding:,.2f}</span></div></div>'
        )

    # Attachments
    attachments = doc.get("attachments", []) or []
    attachments_block = ""
    if attachments:
        att_links = ""
        share_token = doc.get("share_token", "")
        for a in attachments:
            label = a.get("filename", "file")
            size_kb = max(1, int((a.get("size", 0) or 0) / 1024))
            href = f'/api/invoices/public/{share_token}/attachments/{a.get("id", "")}' if share_token else "#"
            att_links += (
                f'<li style="margin:4px 0"><a href="{href}" style="color:#0B3D3D;text-decoration:none;'
                f'font-weight:600">📎 {label}</a> '
                f'<span style="color:#9A968B;font-size:11px">({size_kb} KB)</span></li>'
            )
        attachments_block = (
            f'<div style="background:#FAF5EE;border-radius:8px;padding:14px 18px;margin-top:18px">'
            f'<div style="font-weight:700;font-size:13px;margin-bottom:6px">Attachments</div>'
            f'<ul style="list-style:none;padding:0;margin:0;font-size:13px">{att_links}</ul></div>'
        )

    pay_btn = ""
    pl = doc.get("payment_link", "")
    accent = doc.get("accent_color", "#0B3D3D")
    if pl and doc.get("status") != "paid":
        pay_btn = f'<a href="{pl}" data-testid="public-pay-btn" target="_blank" rel="noopener" style="display:inline-block;background:{accent};color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Pay Now {sym}{outstanding if outstanding > 0 else total:,.2f}</a>'
    status = doc.get("status", "sent")
    status_color = {"paid": "#2A6B45", "overdue": "#B53D2F", "sent": "#A0621A", "partial": "#A0621A"}.get(status, "#6E6B63")
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice {doc.get("invoice_number","")} from {doc.get("business_name","")}</title>
<meta name="robots" content="noindex,nofollow">
<style>
body{{margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;background:#F5F3EE;color:#1C1B18;}}
.wrap{{max-width:760px;margin:0 auto;padding:24px;}}
.card{{background:#fff;border:1px solid #E2DDD4;border-radius:12px;overflow:hidden;}}
.bar{{background:{accent};color:#fff;padding:24px 32px;}}
.bar h1{{font-size:24px;margin:0;}}
.body{{padding:28px 32px;}}
.row{{display:flex;justify-content:space-between;gap:16px;margin-bottom:24px;flex-wrap:wrap;}}
.pill{{display:inline-block;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;}}
table{{width:100%;border-collapse:collapse;font-size:13px;}}
thead th{{background:#f9f8f5;padding:10px 12px;text-align:left;color:#6E6B63;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;}}
.breakdown{{margin-top:18px;padding-top:18px;border-top:1px solid #eee;font-size:13px;}}
.totals{{margin-top:14px;padding-top:14px;border-top:2px solid {accent};text-align:right;}}
.totals .big{{font-size:28px;font-weight:700;color:{accent};}}
.cta{{text-align:center;margin:32px 0 8px;}}
.foot{{text-align:center;padding:18px;font-size:11px;color:#6E6B63;}}
.foot a{{color:{accent};text-decoration:none;font-weight:600;}}
</style></head><body>
<div class="wrap"><div class="card">
<div class="bar"><h1>{doc.get("business_name","Your Business")}</h1>
<div style="opacity:.8;font-size:13px;margin-top:4px">Invoice {doc.get("invoice_number","")}</div></div>
<div class="body">
<div class="row">
<div><div style="font-size:11px;color:#6E6B63;letter-spacing:.05em;text-transform:uppercase">Bill to</div>
<div style="font-weight:600;font-size:15px;margin-top:4px">{doc.get("client_name","")}</div>
<div style="color:#6E6B63;font-size:13px">{doc.get("client_company","")}</div></div>
<div style="text-align:right">
<div><span class="pill" style="background:{status_color}22;color:{status_color}">{status}</span></div>
<div style="margin-top:8px;font-size:12px;color:#6E6B63">Issued: {doc.get("date","")}</div>
<div style="font-size:12px;color:#6E6B63">Due: {doc.get("due_date","")}</div></div>
</div>
<table><thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
<tbody>{rows}</tbody></table>
<table class="breakdown">{breakdown}</table>
<div class="totals"><div style="font-size:12px;color:#6E6B63">Total due</div><div class="big">{sym}{total:,.2f}</div></div>
{payments_block}
{attachments_block}
<div class="cta">{pay_btn}</div>
{"<div style='background:#FAF5EE;border-radius:8px;padding:14px 18px;margin-top:12px;font-size:13px'><b>Notes:</b> "+(doc.get("notes",""))+"</div>" if doc.get("notes") else ""}
</div>
<div class="foot">Sent via <a href="https://realprofits.com/tools/invoice">RealProfits Invoice Generator</a> · Need to sign too? <a href="https://realprofits.com/tools/esign">Try RealProfits eSign — free</a></div>
</div></div></body></html>"""


@router.post("/{invoice_id}/share")
async def share_invoice(invoice_id: str, request: Request):
    """Generate or return a public share token. Anyone with the URL can view (not edit) the invoice."""
    user = await get_current_user(request)
    db = get_db()
    doc = await db.invoices.find_one({"_id": ObjectId(invoice_id), "user_id": str(user["_id"])})
    if not doc:
        raise HTTPException(404, "Invoice not found")
    token = doc.get("share_token")
    if not token:
        token = _secrets.token_urlsafe(24)
        await db.invoices.update_one(
            {"_id": ObjectId(invoice_id)},
            {"$set": {"share_token": token, "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
    base = os.environ.get("APP_URL", os.environ.get("FRONTEND_URL", "")).rstrip("/")
    return {"share_token": token, "public_url": f"{base}/i/{token}" if base else f"/i/{token}"}


@router.get("/public/{token}", response_class=None)
async def public_invoice(token: str):
    """Public read-only invoice view by share token."""
    from fastapi.responses import HTMLResponse
    db = get_db()
    doc = await db.invoices.find_one({"share_token": token})
    if not doc:
        raise HTTPException(404, "Invoice not found")
    return HTMLResponse(content=_portal_html(doc), status_code=200)


@router.get("/public/{token}/attachments/{attachment_id}")
async def public_download_attachment(token: str, attachment_id: str):
    """Public download for an attachment via the invoice share token."""
    db = get_db()
    doc = await db.invoices.find_one({"share_token": token})
    if not doc:
        raise HTTPException(404, "Invoice not found")
    att = next((a for a in doc.get("attachments", []) or [] if a.get("id") == attachment_id), None)
    if not att:
        raise HTTPException(404, "Attachment not found")
    fpath = INVOICE_STORAGE_DIR / str(doc["_id"]) / f'{att["id"]}_{att["filename"]}'
    if not fpath.exists():
        raise HTTPException(404, "File not found on disk")
    return FileResponse(path=fpath, filename=att["filename"], media_type=att.get("mime") or "application/octet-stream")


# ── Parameterized routes ────────────────────────────────

@router.get("/{invoice_id}")
async def get_invoice(invoice_id: str, request: Request):
    user = await get_current_user(request)
    db = get_db()
    doc = await db.invoices.find_one({"_id": ObjectId(invoice_id), "user_id": str(user["_id"])})
    if not doc:
        raise HTTPException(404, "Invoice not found")
    return _clean_doc(doc)

@router.post("")
async def create_invoice(body: InvoiceCreate, request: Request):
    user = await get_current_user(request)
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()
    doc = body.model_dump()
    doc["user_id"] = str(user["_id"])
    doc["created_at"] = now
    doc["updated_at"] = now
    result = await db.invoices.insert_one(doc)
    return {"id": str(result.inserted_id), "status": "created"}

@router.put("/{invoice_id}")
async def update_invoice(invoice_id: str, body: InvoiceCreate, request: Request):
    user = await get_current_user(request)
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()
    update = body.model_dump()
    update["updated_at"] = now
    result = await db.invoices.update_one(
        {"_id": ObjectId(invoice_id), "user_id": str(user["_id"])},
        {"$set": update}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Invoice not found")
    return {"id": invoice_id, "status": "updated"}

@router.delete("/{invoice_id}")
async def delete_invoice(invoice_id: str, request: Request):
    user = await get_current_user(request)
    db = get_db()
    result = await db.invoices.delete_one({"_id": ObjectId(invoice_id), "user_id": str(user["_id"])})
    if result.deleted_count == 0:
        raise HTTPException(404, "Invoice not found")
    return {"status": "deleted"}

@router.post("/{invoice_id}/payment")
async def record_payment(invoice_id: str, body: PaymentRecord, request: Request):
    user = await get_current_user(request)
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()
    payment = body.model_dump()
    payment["recorded_at"] = now
    result = await db.invoices.update_one(
        {"_id": ObjectId(invoice_id), "user_id": str(user["_id"])},
        {"$push": {"payments": payment}, "$set": {"updated_at": now}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Invoice not found")
    return {"status": "payment_recorded"}


@router.put("/clients/{client_id}")
async def update_client(client_id: str, body: ClientCreate, request: Request):
    user = await get_current_user(request)
    db = get_db()
    result = await db.invoice_clients.update_one(
        {"_id": ObjectId(client_id), "user_id": str(user["_id"])},
        {"$set": body.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Client not found")
    return {"id": client_id, "status": "updated"}

@router.delete("/clients/{client_id}")
async def delete_client(client_id: str, request: Request):
    user = await get_current_user(request)
    db = get_db()
    result = await db.invoice_clients.delete_one({"_id": ObjectId(client_id), "user_id": str(user["_id"])})
    if result.deleted_count == 0:
        raise HTTPException(404, "Client not found")
    return {"status": "deleted"}

