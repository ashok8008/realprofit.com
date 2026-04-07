from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime, timezone

from db import get_db
from auth import get_current_user, get_optional_user

router = APIRouter(prefix="/api/user-data", tags=["user-data"])


class SaveDataBody(BaseModel):
    tool_key: str
    data: Any


class BulkSaveBody(BaseModel):
    items: list[SaveDataBody]


@router.get("/")
async def list_user_data(request: Request):
    """List all saved tool data keys for the current user."""
    user = await get_current_user(request)
    uid = str(user["_id"])
    db = get_db()
    cursor = db.user_data.find({"user_id": uid}, {"_id": 0, "tool_key": 1, "updated_at": 1})
    items = []
    async for doc in cursor:
        items.append({
            "tool_key": doc["tool_key"],
            "updated_at": doc.get("updated_at", "").isoformat() if hasattr(doc.get("updated_at", ""), "isoformat") else str(doc.get("updated_at", "")),
        })
    return {"items": items}


@router.get("/{tool_key}")
async def get_user_data(tool_key: str, request: Request):
    """Get saved data for a specific tool."""
    user = await get_current_user(request)
    uid = str(user["_id"])
    db = get_db()
    doc = await db.user_data.find_one({"user_id": uid, "tool_key": tool_key}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="No saved data found")
    return {"tool_key": doc["tool_key"], "data": doc["data"], "updated_at": doc.get("updated_at", "").isoformat() if hasattr(doc.get("updated_at", ""), "isoformat") else str(doc.get("updated_at", ""))}


@router.put("/{tool_key}")
async def save_user_data(tool_key: str, body: SaveDataBody, request: Request):
    """Save/update data for a specific tool."""
    user = await get_current_user(request)
    uid = str(user["_id"])
    db = get_db()
    now = datetime.now(timezone.utc)
    await db.user_data.update_one(
        {"user_id": uid, "tool_key": tool_key},
        {"$set": {"data": body.data, "updated_at": now}, "$setOnInsert": {"created_at": now}},
        upsert=True,
    )
    return {"message": "Saved", "tool_key": tool_key}


@router.delete("/{tool_key}")
async def delete_user_data(tool_key: str, request: Request):
    """Delete saved data for a specific tool."""
    user = await get_current_user(request)
    uid = str(user["_id"])
    db = get_db()
    result = await db.user_data.delete_one({"user_id": uid, "tool_key": tool_key})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No saved data found")
    return {"message": "Deleted", "tool_key": tool_key}


@router.post("/bulk")
async def bulk_save(body: BulkSaveBody, request: Request):
    """Save multiple tool data items at once."""
    user = await get_current_user(request)
    uid = str(user["_id"])
    db = get_db()
    now = datetime.now(timezone.utc)
    for item in body.items:
        await db.user_data.update_one(
            {"user_id": uid, "tool_key": item.tool_key},
            {"$set": {"data": item.data, "updated_at": now}, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )
    return {"message": f"Saved {len(body.items)} items"}
