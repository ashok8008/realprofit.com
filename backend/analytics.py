"""Simple A/B test analytics endpoints.

We don't need a full analytics platform — just log impressions + clicks to MongoDB
so the user can run aggregations after a few weeks.

Schema (collection: `ab_events`):
  - experiment: str (e.g. 'pricing_hero_cta_v1')
  - variant: str (e.g. 'free' | 'pro')
  - event: 'impression' | 'click' | 'convert'
  - user_id: optional Mongo ObjectId string
  - session_id: anonymous browser session id
  - path: page where the event happened
  - meta: free-form dict
  - created_at: datetime UTC
"""
from datetime import datetime, timezone
from typing import Literal, Optional

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field

from db import get_db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


class ABEvent(BaseModel):
    experiment: str = Field(..., min_length=1, max_length=100)
    variant: str = Field(..., min_length=1, max_length=50)
    event: Literal["impression", "click", "convert"]
    session_id: str = Field(..., min_length=8, max_length=100)
    path: Optional[str] = None
    meta: Optional[dict] = None


@router.post("/event")
async def record_event(payload: ABEvent, request: Request):
    db = get_db()
    user_id = None
    # Best-effort user binding — don't fail if not logged in
    try:
        from auth import get_current_user
        user = await get_current_user(request)
        if user:
            user_id = str(user.get("_id"))
    except Exception:
        pass

    await db.ab_events.insert_one({
        "experiment": payload.experiment,
        "variant": payload.variant,
        "event": payload.event,
        "user_id": user_id,
        "session_id": payload.session_id,
        "path": payload.path,
        "meta": payload.meta or {},
        "created_at": datetime.now(timezone.utc),
        "user_agent": request.headers.get("user-agent", "")[:300],
    })
    return {"ok": True}


@router.get("/summary/{experiment}")
async def summary(experiment: str, request: Request):
    """Owner-only summary endpoint. Returns counts per variant + conversion rates."""
    from auth import get_current_user
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    db = get_db()
    pipeline = [
        {"$match": {"experiment": experiment}},
        {"$group": {
            "_id": {"variant": "$variant", "event": "$event"},
            "count": {"$sum": 1},
        }},
    ]
    raw = await db.ab_events.aggregate(pipeline).to_list(length=200)
    by_variant: dict[str, dict] = {}
    for r in raw:
        v = r["_id"]["variant"]
        ev = r["_id"]["event"]
        by_variant.setdefault(v, {"impression": 0, "click": 0, "convert": 0})
        by_variant[v][ev] = r["count"]
    summary = []
    for v, stats in by_variant.items():
        impressions = max(stats["impression"], 1)
        summary.append({
            "variant": v,
            "impressions": stats["impression"],
            "clicks": stats["click"],
            "conversions": stats["convert"],
            "click_rate": round(stats["click"] / impressions * 100, 2),
            "conversion_rate": round(stats["convert"] / impressions * 100, 2),
        })
    return {"experiment": experiment, "variants": summary}
