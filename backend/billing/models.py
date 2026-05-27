"""Subscription + subscription_events models — share the eSign Postgres engine."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import Numeric

from esign.database import Base


def _now():
    return datetime.now(timezone.utc)


class Subscription(Base):
    """One row per user. Keyed by Mongo user ObjectId string."""
    __tablename__ = "subscriptions"

    user_id = Column(String(64), primary_key=True)  # Mongo ObjectId string
    tier = Column(String(20), nullable=False, default="free")
    status = Column(String(20), nullable=False, default="active")  # active/trialing/past_due/canceled/unpaid
    stripe_customer_id = Column(String(255), nullable=True, index=True)
    stripe_subscription_id = Column(String(255), nullable=True, index=True)
    plan_interval = Column(String(10), nullable=True)  # month|year
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end = Column(Boolean, nullable=False, default=False)
    docs_used_this_month = Column(Integer, nullable=False, default=0)
    docs_reset_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_now, onupdate=_now)


class SubscriptionEvent(Base):
    """Idempotent log of all Stripe webhook events received."""
    __tablename__ = "subscription_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(64), nullable=True, index=True)
    event_type = Column(String(100), nullable=False)
    stripe_event_id = Column(String(255), nullable=False, unique=True, index=True)
    amount_usd = Column(Numeric(10, 2), nullable=True)
    tier = Column(String(20), nullable=True)
    occurred_at = Column(DateTime(timezone=True), nullable=False, default=_now)
    event_metadata = Column("metadata", JSONB, nullable=True)


class SavedSignature(Base):
    """User-saved signature image — reused across documents (logged-in signers)."""
    __tablename__ = "saved_signatures"

    user_id = Column(String(64), primary_key=True)
    image_data = Column(Text, nullable=False)  # base64 PNG data URL
    method = Column(String(20), nullable=False, default="draw")  # draw|type|upload
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_now, onupdate=_now)
