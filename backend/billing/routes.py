"""Billing routes: /api/billing/{plans, status, checkout, portal, webhook, cancel}.

Subscriptions live in Postgres (table `subscriptions`) keyed by Mongo user ObjectId.
The Stripe customer is created lazily on first checkout.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Optional

import stripe
from fastapi import APIRouter, HTTPException, Request, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from esign.database import get_session
from .models import Subscription, SubscriptionEvent
from .service import get_or_create_subscription, reset_counter_if_needed, limits_for
from .tiers import PLANS, TIER_LIMITS

router = APIRouter(prefix="/api/billing", tags=["billing"])


def _stripe_key() -> str:
    key = os.environ.get("STRIPE_API_KEY", "")
    if not key:
        raise HTTPException(500, "Stripe is not configured")
    if key == "sk_test_emergent":
        # The Emergent universal key only supports one-time checkout, not subscriptions.
        raise HTTPException(
            status_code=503,
            detail={
                "code": "STRIPE_KEYS_NEEDED",
                "message": (
                    "Stripe subscription billing is configured but requires real Stripe API keys "
                    "(test or live). Add STRIPE_API_KEY=sk_test_... and STRIPE_WEBHOOK_SECRET=whsec_... "
                    "to /app/backend/.env. See https://dashboard.stripe.com/test/apikeys"
                ),
            },
        )
    return key


# In-memory price map (test mode — products are created on first /checkout call).
# In production these IDs come from the Stripe dashboard.
_price_cache: dict[str, str] = {}


def _frontend_origin(request: Request) -> str:
    origin = request.headers.get("origin")
    if origin:
        return origin
    return os.environ.get("FRONTEND_URL", os.environ.get("APP_URL", "http://localhost:3000"))


async def _ensure_stripe_price(plan_id: str, interval: str) -> str:
    """Find or create a Stripe Product + Price for the given plan/interval (test mode)."""
    key = f"{plan_id}_{interval}"
    if key in _price_cache:
        return _price_cache[key]

    stripe.api_key = _stripe_key()

    plan = next((p for p in PLANS if p["id"] == plan_id), None)
    if not plan or plan_id == "free":
        raise HTTPException(400, "Invalid plan")

    amount_usd = plan["price_monthly"] if interval == "month" else plan["price_annual"]
    if amount_usd <= 0:
        raise HTTPException(400, "Invalid plan price")

    # Try to find an existing price first (lookup_key)
    lookup = f"rp_esign_{plan_id}_{interval}"
    existing = stripe.Price.list(lookup_keys=[lookup], limit=1)
    if existing.data:
        _price_cache[key] = existing.data[0].id
        return existing.data[0].id

    product = stripe.Product.create(name=f"RealProfits eSign {plan['name']}")
    price = stripe.Price.create(
        unit_amount=int(amount_usd * 100),
        currency="usd",
        recurring={"interval": interval},
        product=product.id,
        lookup_key=lookup,
    )
    _price_cache[key] = price.id
    return price.id


async def _ensure_stripe_customer(session: AsyncSession, sub: Subscription,
                                    user: dict) -> str:
    if sub.stripe_customer_id:
        return sub.stripe_customer_id
    stripe.api_key = _stripe_key()
    customer = stripe.Customer.create(
        email=user.get("email"),
        name=user.get("name"),
        metadata={"user_id": str(user["_id"])},
    )
    sub.stripe_customer_id = customer.id
    await session.commit()
    return customer.id


# --------------- Endpoints ---------------

@router.get("/plans")
async def get_plans():
    return {"plans": PLANS}


@router.get("/status")
async def get_status(request: Request, session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    sub = await get_or_create_subscription(session, str(user["_id"]))
    await reset_counter_if_needed(session, sub)
    await session.commit()
    limits = limits_for(sub.tier)  # type: ignore[arg-type]
    return {
        "tier": sub.tier,
        "status": sub.status,
        "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
        "cancel_at_period_end": sub.cancel_at_period_end,
        "docs_used_this_month": sub.docs_used_this_month,
        "docs_reset_at": sub.docs_reset_at.isoformat() if sub.docs_reset_at else None,
        "plan_interval": sub.plan_interval,
        "limits": {
            "max_docs_per_month": limits["MAX_DOCS_PER_MONTH"] if limits["MAX_DOCS_PER_MONTH"] != float("inf") else None,
            "max_signers": limits["MAX_SIGNERS"],
            "max_file_size_mb": limits["MAX_FILE_SIZE_MB"],
            "show_branding": limits["SHOW_BRANDING"],
        },
    }


@router.post("/checkout")
async def create_checkout(request: Request, session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    body = await request.json()
    plan_id = body.get("plan", "pro")
    interval = body.get("interval", "month")
    if plan_id not in ("pro", "business") or interval not in ("month", "year"):
        raise HTTPException(400, "Invalid plan or interval")

    sub = await get_or_create_subscription(session, str(user["_id"]))
    customer_id = await _ensure_stripe_customer(session, sub, user)
    price_id = await _ensure_stripe_price(plan_id, interval)

    origin = _frontend_origin(request)
    success_url = f"{origin}/account/billing?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/pricing"

    stripe.api_key = _stripe_key()
    checkout = stripe.checkout.Session.create(
        mode="subscription",
        customer=customer_id,
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"user_id": str(user["_id"]), "plan": plan_id, "interval": interval},
        allow_promotion_codes=True,
    )
    return {"url": checkout.url, "session_id": checkout.id}


@router.post("/portal")
async def create_portal(request: Request, session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    sub = await get_or_create_subscription(session, str(user["_id"]))
    if not sub.stripe_customer_id:
        raise HTTPException(400, "No Stripe customer for this user")
    stripe.api_key = _stripe_key()
    origin = _frontend_origin(request)
    portal = stripe.billing_portal.Session.create(
        customer=sub.stripe_customer_id,
        return_url=f"{origin}/account/billing",
    )
    return {"url": portal.url}


@router.get("/checkout-status/{session_id}")
async def checkout_status(session_id: str, request: Request,
                           session: AsyncSession = Depends(get_session)):
    """Poll endpoint — frontend hits this after Stripe redirects back."""
    user = await get_current_user(request)
    stripe.api_key = _stripe_key()
    try:
        cs = stripe.checkout.Session.retrieve(session_id)
    except stripe.error.StripeError as e:
        raise HTTPException(400, str(e))
    if cs.metadata and cs.metadata.get("user_id") != str(user["_id"]):
        raise HTTPException(403, "Session does not belong to current user")

    # If paid, eagerly sync the subscription state (webhook will also do it; idempotent)
    if cs.payment_status == "paid" and cs.subscription:
        await _sync_subscription(session, str(user["_id"]), cs.subscription, cs.metadata)
        await session.commit()

    return {
        "status": cs.status,
        "payment_status": cs.payment_status,
        "subscription_id": cs.subscription,
    }


async def _sync_subscription(session: AsyncSession, user_id: str,
                              stripe_subscription_id: str, metadata: dict | None = None) -> None:
    """Pull current subscription state from Stripe and persist to Postgres."""
    stripe.api_key = _stripe_key()
    sub_obj = stripe.Subscription.retrieve(stripe_subscription_id)
    sub = await get_or_create_subscription(session, user_id)

    sub.stripe_subscription_id = sub_obj.id
    sub.status = sub_obj.status
    sub.cancel_at_period_end = bool(sub_obj.cancel_at_period_end)
    if sub_obj.current_period_end:
        sub.current_period_end = datetime.fromtimestamp(sub_obj.current_period_end, tz=timezone.utc)

    # Determine tier from the plan
    if sub_obj["items"]["data"]:
        item = sub_obj["items"]["data"][0]
        price = item["price"]
        sub.plan_interval = price.get("recurring", {}).get("interval")
        # Map back to tier via lookup_key (we set rp_esign_<tier>_<interval>)
        lookup = price.get("lookup_key") or ""
        if "pro" in lookup:
            sub.tier = "pro"
        elif "business" in lookup:
            sub.tier = "business"

    # Active states unlock features; canceled/unpaid downgrade gradually
    if sub_obj.status in ("active", "trialing"):
        pass  # tier already set
    elif sub_obj.status in ("canceled", "incomplete_expired", "unpaid"):
        sub.tier = "free"

    sub.updated_at = datetime.now(timezone.utc)


@router.post("/webhook")
async def stripe_webhook(request: Request, background: BackgroundTasks,
                          session: AsyncSession = Depends(get_session)):
    stripe.api_key = _stripe_key()
    body = await request.body()
    sig = request.headers.get("stripe-signature", "")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

    try:
        if webhook_secret and webhook_secret != "whsec_test":
            event = stripe.Webhook.construct_event(body, sig, webhook_secret)
        else:
            # Local/test mode — parse without signature verification
            import json
            event = json.loads(body)
    except (stripe.error.SignatureVerificationError, ValueError) as e:
        raise HTTPException(400, f"Webhook signature failed: {e}")

    event_id = event.get("id") if isinstance(event, dict) else event["id"]
    event_type = event.get("type") if isinstance(event, dict) else event["type"]
    data = (event.get("data") or {}).get("object") if isinstance(event, dict) else event["data"]["object"]

    # Idempotency check
    existing = await session.execute(
        select(SubscriptionEvent).where(SubscriptionEvent.stripe_event_id == event_id)
    )
    if existing.scalar_one_or_none():
        return {"ok": True, "duplicate": True}

    user_id: Optional[str] = None
    tier: Optional[str] = None

    if event_type == "checkout.session.completed":
        user_id = (data.get("metadata") or {}).get("user_id")
        tier = (data.get("metadata") or {}).get("plan")
        if user_id and data.get("subscription"):
            await _sync_subscription(session, user_id, data["subscription"], data.get("metadata"))
    elif event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
        # Find user via stripe_customer_id
        customer_id = data.get("customer")
        if customer_id:
            res = await session.execute(
                select(Subscription).where(Subscription.stripe_customer_id == customer_id)
            )
            sub = res.scalar_one_or_none()
            if sub:
                user_id = sub.user_id
                await _sync_subscription(session, sub.user_id, data["id"])
                tier = sub.tier
    elif event_type in ("invoice.payment_failed", "invoice.payment_succeeded"):
        customer_id = data.get("customer")
        if customer_id:
            res = await session.execute(
                select(Subscription).where(Subscription.stripe_customer_id == customer_id)
            )
            sub = res.scalar_one_or_none()
            if sub:
                user_id = sub.user_id
                if event_type == "invoice.payment_failed":
                    sub.status = "past_due"
                tier = sub.tier

    # Log idempotently
    session.add(SubscriptionEvent(
        user_id=user_id,
        event_type=event_type,
        stripe_event_id=event_id,
        tier=tier,
        event_metadata={"keys": list(data.keys()) if isinstance(data, dict) else []},
    ))
    await session.commit()
    return {"ok": True}


@router.post("/cancel")
async def cancel_subscription(request: Request, session: AsyncSession = Depends(get_session)):
    """Request cancellation at end of current period. Stripe webhook will sync state."""
    user = await get_current_user(request)
    sub = await get_or_create_subscription(session, str(user["_id"]))
    if not sub.stripe_subscription_id:
        raise HTTPException(400, "No active subscription")
    stripe.api_key = _stripe_key()
    stripe.Subscription.modify(sub.stripe_subscription_id, cancel_at_period_end=True)
    sub.cancel_at_period_end = True
    await session.commit()
    return {"status": "canceled", "effective_at": sub.current_period_end.isoformat() if sub.current_period_end else None}
