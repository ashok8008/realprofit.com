"""Invoice & Client management API routes."""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from db import get_db
from auth import get_current_user

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
