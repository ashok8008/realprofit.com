"""Invoice & Client management API routes."""
import os
import asyncio
import logging
import resend
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from db import get_db
from auth import get_current_user

logger = logging.getLogger(__name__)
resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

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

class ClientCreate(BaseModel):
    name: str
    company: str = ""
    email: str
    address: str = ""

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

# ── Client CRUD ─────────────────────────────────────────

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


# ── Email Invoice ───────────────────────────────────────

class SendInvoiceEmailRequest(BaseModel):
    invoice_id: str
    recipient_email: str
    subject: str = ""
    message: str = ""

@router.post("/send-email")
async def send_invoice_email(body: SendInvoiceEmailRequest, request: Request):
    user = await get_current_user(request)
    db = get_db()

    doc = await db.invoices.find_one({"_id": ObjectId(body.invoice_id), "user_id": str(user["_id"])})
    if not doc:
        raise HTTPException(404, "Invoice not found")

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

    # Build items HTML
    items_rows = ""
    for item in items:
        desc = item.get("description", "Item")
        qty = item.get("qty", 1)
        unit = item.get("unit", "hr")
        rate = item.get("rate", 0)
        amt = qty * rate
        items_rows += f'<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;">{desc}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">{qty} {unit}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">{sym}{rate:,.2f}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">{sym}{amt:,.2f}</td></tr>'

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

        <div style="text-align:right;margin-top:16px;padding-top:16px;border-top:2px solid {accent};">
          <span style="font-size:14px;color:#555;">Total Due: </span>
          <span style="font-size:24px;font-weight:700;color:{accent};">{sym}{total:,.2f}</span>
        </div>

        {payment_btn}

        {"<div style='background:#f9f8f5;border-radius:8px;padding:12px 16px;margin-top:16px;font-size:13px;color:#666;'><strong>Notes:</strong> " + notes + "</div>" if notes else ""}

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="font-size:12px;color:#999;text-align:center;">Sent via <a href="https://realprofits.com" style="color:{accent};text-decoration:none;">RealProfits</a> Invoice Generator</p>
        {f"<p style='font-size:12px;color:#999;text-align:center;'>{biz_email}</p>" if biz_email else ""}
      </div>
    </div>
    """

    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [body.recipient_email],
            "subject": subject,
            "html": html,
        }
        email_result = await asyncio.to_thread(resend.Emails.send, params)

        # Update invoice status to sent
        await db.invoices.update_one(
            {"_id": ObjectId(body.invoice_id)},
            {"$set": {"status": "sent", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )

        return {"status": "sent", "email_id": email_result.get("id", ""), "message": f"Invoice sent to {body.recipient_email}"}
    except Exception as e:
        logger.error(f"Failed to send invoice email: {e}")
        raise HTTPException(500, f"Failed to send email: {str(e)}")
