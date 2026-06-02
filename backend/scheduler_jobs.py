"""Background scheduled jobs:
  - Daily 00:01 UTC: expire any documents past expires_at
  - Hourly: send 3-day, 7-day, 14-day reminder emails to pending signers
  - Daily 08:00 UTC: send 'expiring soon' warning emails
  - 1st of month 00:01 UTC: reset docs_used_this_month for all subscriptions
"""
from __future__ import annotations

import os
import asyncio
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from esign.database import SessionLocal
from esign.models import Document, Signer, AuditEvent
from esign import email_service, tokens as esign_tokens
from billing.service import reset_monthly_counters_job


scheduler: AsyncIOScheduler | None = None


async def _resolve_owner(owner_id: str) -> tuple[str, str]:
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


def _app_url() -> str:
    return os.environ.get("APP_URL", os.environ.get("FRONTEND_URL", "http://localhost:3000"))


async def expire_documents_job() -> None:
    """Daily — expire docs past expires_at; email all parties."""
    now = datetime.now(timezone.utc)
    async with SessionLocal() as session:
        res = await session.execute(
            select(Document).where(
                and_(
                    Document.status.in_(["sent", "partial"]),
                    Document.expires_at.isnot(None),
                    Document.expires_at < now,
                )
            )
        )
        docs = res.scalars().all()
        for doc in docs:
            doc.status = "expired"
            session.add(AuditEvent(
                document_id=doc.id, event_type="expired",
                event_metadata={"auto": True},
            ))
            res2 = await session.execute(
                select(Signer).where(Signer.document_id == doc.id)
            )
            signers = res2.scalars().all()
            owner_email, owner_name = await _resolve_owner(doc.owner_id)
            for s in signers:
                if s.email == owner_email:
                    continue
                # E12 — same template as voided but with different subject
                await email_service.send_voided(
                    to_email=s.email, recipient_name=s.name,
                    document_title=f"[Expired] {doc.title}",
                )
            if owner_email:
                await email_service.send_voided(
                    to_email=owner_email, recipient_name=owner_name,
                    document_title=f"[Expired] {doc.title}",
                )
        if docs:
            await session.commit()
            print(f"[scheduler] Expired {len(docs)} documents")


async def reminder_job() -> None:
    """Hourly — find docs sent N days ago with pending signers; send reminders.

    Reminder schedule from doc.settings.reminder_days (default [3, 7, 14]).
    Each signer tracks reminder_count; we send the next reminder when
    days_since_sent >= reminder_days[reminder_count].
    """
    now = datetime.now(timezone.utc)
    async with SessionLocal() as session:
        res = await session.execute(
            select(Document).where(Document.status.in_(["sent", "partial"]))
        )
        docs = res.scalars().all()
        total_sent = 0
        for doc in docs:
            # Time since sent — use updated_at as a proxy (set when status=sent)
            days_since = (now - doc.updated_at).total_seconds() / 86400
            reminder_days = (doc.settings or {}).get("reminder_days", [3, 7, 14])
            res2 = await session.execute(
                select(Signer).where(
                    and_(
                        Signer.document_id == doc.id,
                        Signer.status.in_(["notified", "viewed"]),
                    )
                )
            )
            signers = res2.scalars().all()
            owner_email, owner_name = await _resolve_owner(doc.owner_id)
            for s in signers:
                next_idx = s.reminder_count
                if next_idx >= len(reminder_days):
                    continue
                threshold = reminder_days[next_idx]
                if days_since < threshold:
                    continue
                # Generate a fresh token (token_hash already stored; create new and update hash)
                token = esign_tokens.create_signing_token(
                    str(s.id), str(doc.id), s.email, expires_at=doc.expires_at,
                )
                s.token_hash = esign_tokens.hash_token(token)
                s.reminder_count = next_idx + 1
                sign_url = f"{_app_url()}/sign/{token}"
                expiry = doc.expires_at.strftime("%b %d, %Y") if doc.expires_at else None
                await email_service.send_signature_request(
                    to_email=s.email, signer_name=s.name,
                    owner_name=owner_name or "Document owner",
                    document_title=f"[Reminder] {doc.title}",
                    sign_url=sign_url, expires=expiry,
                    role=s.role,
                )
                total_sent += 1
        if total_sent:
            await session.commit()
            print(f"[scheduler] Sent {total_sent} reminders")


async def reset_counters_job() -> None:
    """1st of month — reset all subscriptions' monthly document counters."""
    count = await reset_monthly_counters_job(SessionLocal)
    print(f"[scheduler] Reset monthly counters for {count} users")


async def mark_invoices_overdue_job() -> None:
    """Daily — mark sent invoices past their due_date as overdue."""
    try:
        from db import get_db
        from datetime import datetime as _dt
        db = get_db()
        today = _dt.utcnow().date().isoformat()
        result = await db.invoices.update_many(
            {"status": "sent", "due_date": {"$ne": "", "$lt": today}},
            {"$set": {"status": "overdue", "updated_at": _dt.utcnow().isoformat()}},
        )
        if result.modified_count:
            print(f"[scheduler] Marked {result.modified_count} invoices overdue")
    except Exception as e:
        print(f"[scheduler] mark_invoices_overdue failed: {e}")


async def send_invoice_reminders_job() -> None:
    """Daily — email reminders for overdue invoices that haven't received a reminder in 7 days."""
    try:
        import resend as _resend
        from db import get_db
        from datetime import datetime as _dt, timedelta as _td
        _resend.api_key = os.environ.get("RESEND_API_KEY", "")
        sender = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
        if not _resend.api_key:
            return
        db = get_db()
        cutoff = _dt.utcnow() - _td(days=7)
        cursor = db.invoices.find({
            "status": "overdue",
            "client_email": {"$ne": ""},
            "$or": [
                {"last_reminder_at": {"$exists": False}},
                {"last_reminder_at": {"$lt": cutoff.isoformat()}},
            ],
        })
        sent = 0
        async for inv in cursor:
            try:
                html = f"""<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                <div style="background:#B53D2F;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h2 style="margin:0;font-size:18px;">Overdue invoice reminder</h2></div>
                <div style="padding:24px;border:1px solid #eee;border-top:0;border-radius:0 0 8px 8px;">
                <p>Hi {inv.get('client_name','there')},</p>
                <p>This is a friendly reminder that invoice <b>{inv.get('invoice_number','')}</b> from
                <b>{inv.get('business_name','')}</b> is currently overdue.</p>
                <p>Amount due: <b>${inv.get('total',0):,.2f}</b> · Was due {inv.get('due_date','')}</p>
                {f'<p><a href="{inv.get("payment_link","")}" style="display:inline-block;background:#0B3D3D;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">Pay now</a></p>' if inv.get('payment_link') else ''}
                <p style="font-size:12px;color:#999;margin-top:24px;">Sent via RealProfits Invoice Generator.</p>
                </div></div>"""
                await asyncio.to_thread(_resend.Emails.send, {
                    "from": sender,
                    "to": [inv["client_email"]],
                    "subject": f"[Overdue] Invoice {inv.get('invoice_number','')} from {inv.get('business_name','')}",
                    "html": html,
                })
                await db.invoices.update_one(
                    {"_id": inv["_id"]},
                    {"$set": {"last_reminder_at": _dt.utcnow().isoformat()}},
                )
                sent += 1
            except Exception as e:
                print(f"[scheduler] reminder email failed for {inv.get('_id')}: {e}")
        if sent:
            print(f"[scheduler] Sent {sent} overdue invoice reminders")
    except Exception as e:
        print(f"[scheduler] send_invoice_reminders failed: {e}")


def start_scheduler() -> None:
    global scheduler
    if scheduler is not None:
        return
    scheduler = AsyncIOScheduler(timezone="UTC")
    # Hourly reminders
    scheduler.add_job(reminder_job, CronTrigger(minute=15), id="reminders",
                       max_instances=1, coalesce=True)
    # Daily expiry (00:01 UTC)
    scheduler.add_job(expire_documents_job, CronTrigger(hour=0, minute=1),
                       id="expire_docs", max_instances=1, coalesce=True)
    # Monthly counter reset (1st of month 00:05 UTC)
    scheduler.add_job(reset_counters_job, CronTrigger(day=1, hour=0, minute=5),
                       id="reset_counters", max_instances=1, coalesce=True)
    # Daily — mark overdue invoices (00:30 UTC)
    scheduler.add_job(mark_invoices_overdue_job, CronTrigger(hour=0, minute=30),
                       id="mark_overdue", max_instances=1, coalesce=True)
    # Daily — overdue invoice reminders (09:00 UTC)
    scheduler.add_job(send_invoice_reminders_job, CronTrigger(hour=9, minute=0),
                       id="invoice_reminders", max_instances=1, coalesce=True)
    scheduler.start()
    print("[scheduler] Started: reminders (hourly), expire_docs (daily), reset_counters (monthly), mark_overdue (daily), invoice_reminders (daily)")


def stop_scheduler() -> None:
    global scheduler
    if scheduler is not None:
        scheduler.shutdown(wait=False)
        scheduler = None
