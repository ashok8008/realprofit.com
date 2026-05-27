"""Background scheduled jobs:
  - Daily 00:01 UTC: expire any documents past expires_at
  - Hourly: send 3-day, 7-day, 14-day reminder emails to pending signers
  - Daily 08:00 UTC: send 'expiring soon' warning emails
  - 1st of month 00:01 UTC: reset docs_used_this_month for all subscriptions
"""
from __future__ import annotations

import os
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
                )
                total_sent += 1
        if total_sent:
            await session.commit()
            print(f"[scheduler] Sent {total_sent} reminders")


async def reset_counters_job() -> None:
    """1st of month — reset all subscriptions' monthly document counters."""
    count = await reset_monthly_counters_job(SessionLocal)
    print(f"[scheduler] Reset monthly counters for {count} users")


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
    scheduler.start()
    print("[scheduler] Started: reminders (hourly), expire_docs (daily), reset_counters (monthly)")


def stop_scheduler() -> None:
    global scheduler
    if scheduler is not None:
        scheduler.shutdown(wait=False)
        scheduler = None
