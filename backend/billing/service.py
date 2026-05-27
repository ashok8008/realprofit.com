"""Subscription service helpers — read + enforce tier limits."""
from __future__ import annotations

import math
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Subscription
from .tiers import TIER_LIMITS, Tier


def _next_month_reset(now: datetime) -> datetime:
    """1st day of next month at UTC midnight."""
    year = now.year + (1 if now.month == 12 else 0)
    month = 1 if now.month == 12 else now.month + 1
    return datetime(year, month, 1, tzinfo=timezone.utc)


async def get_or_create_subscription(session: AsyncSession, user_id: str) -> Subscription:
    res = await session.execute(select(Subscription).where(Subscription.user_id == user_id))
    sub = res.scalar_one_or_none()
    if sub:
        return sub
    sub = Subscription(
        user_id=user_id,
        tier="free",
        status="active",
        docs_used_this_month=0,
        docs_reset_at=_next_month_reset(datetime.now(timezone.utc)),
    )
    session.add(sub)
    await session.flush()
    return sub


async def reset_counter_if_needed(session: AsyncSession, sub: Subscription) -> None:
    now = datetime.now(timezone.utc)
    if sub.docs_reset_at and sub.docs_reset_at <= now:
        sub.docs_used_this_month = 0
        sub.docs_reset_at = _next_month_reset(now)


def limits_for(tier: Tier) -> dict:
    return TIER_LIMITS[tier]


async def assert_can_create_doc(session: AsyncSession, user_id: str,
                                  file_size_bytes: int, page_count: int) -> Subscription:
    sub = await get_or_create_subscription(session, user_id)
    await reset_counter_if_needed(session, sub)
    limits = limits_for(sub.tier)  # type: ignore[arg-type]

    if sub.docs_used_this_month >= limits["MAX_DOCS_PER_MONTH"]:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "LIMIT_REACHED",
                "message": f"You've used all {int(limits['MAX_DOCS_PER_MONTH'])} free documents this month. Upgrade to Pro for unlimited documents.",
                "upgrade_url": "/pricing",
                "current_tier": sub.tier,
            },
        )

    max_mb = limits["MAX_FILE_SIZE_MB"]
    if max_mb != math.inf and file_size_bytes > max_mb * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail={
                "code": "FILE_TOO_LARGE",
                "message": f"File exceeds {int(max_mb)} MB limit on the {sub.tier} plan. Upgrade for larger uploads.",
                "upgrade_url": "/pricing",
            },
        )

    max_pages = limits["MAX_PAGES"]
    if max_pages != math.inf and page_count > max_pages:
        raise HTTPException(
            status_code=413,
            detail={
                "code": "TOO_MANY_PAGES",
                "message": f"Document exceeds {int(max_pages)} page limit on the {sub.tier} plan.",
                "upgrade_url": "/pricing",
            },
        )

    return sub


async def assert_can_set_signers(session: AsyncSession, user_id: str, signer_count: int) -> None:
    sub = await get_or_create_subscription(session, user_id)
    limits = limits_for(sub.tier)  # type: ignore[arg-type]
    if signer_count > limits["MAX_SIGNERS"]:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "TOO_MANY_SIGNERS",
                "message": f"Your {sub.tier} plan supports up to {limits['MAX_SIGNERS']} signers per document. Upgrade for more.",
                "upgrade_url": "/pricing",
            },
        )


async def increment_doc_counter(session: AsyncSession, sub: Subscription) -> None:
    sub.docs_used_this_month = (sub.docs_used_this_month or 0) + 1
    sub.updated_at = datetime.now(timezone.utc)


def is_branding_required(tier: str) -> bool:
    return bool(limits_for(tier)["SHOW_BRANDING"])  # type: ignore[arg-type]


async def reset_monthly_counters_job(session_factory) -> int:
    """Background job — run on the 1st of every month at 00:01 UTC. Returns count reset."""
    async with session_factory() as session:
        now = datetime.now(timezone.utc)
        res = await session.execute(select(Subscription))
        subs = res.scalars().all()
        count = 0
        for sub in subs:
            if not sub.docs_reset_at or sub.docs_reset_at <= now:
                sub.docs_used_this_month = 0
                sub.docs_reset_at = _next_month_reset(now)
                count += 1
        await session.commit()
        return count
