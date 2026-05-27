"""Saved-signature routes — let logged-in users store a reusable signature."""
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from esign.database import get_session
from .models import SavedSignature

router = APIRouter(prefix="/api/esign/signature", tags=["esign-signature"])


class SavedSigBody(BaseModel):
    image_data: str
    method: str = "draw"


@router.get("")
async def get_saved(request: Request, session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    res = await session.execute(
        select(SavedSignature).where(SavedSignature.user_id == str(user["_id"]))
    )
    sig = res.scalar_one_or_none()
    if not sig:
        return {"image_data": None, "method": None}
    return {"image_data": sig.image_data, "method": sig.method, "updated_at": sig.updated_at.isoformat()}


@router.put("")
async def save(body: SavedSigBody, request: Request,
                session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    if not body.image_data.startswith("data:image"):
        raise HTTPException(400, "Must be a base64 data URL")
    if len(body.image_data) > 500_000:
        raise HTTPException(413, "Signature too large (max 500 KB)")
    res = await session.execute(
        select(SavedSignature).where(SavedSignature.user_id == str(user["_id"]))
    )
    sig = res.scalar_one_or_none()
    if sig:
        sig.image_data = body.image_data
        sig.method = body.method
    else:
        session.add(SavedSignature(
            user_id=str(user["_id"]),
            image_data=body.image_data,
            method=body.method,
        ))
    await session.commit()
    return {"ok": True}


@router.delete("")
async def delete(request: Request, session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request)
    res = await session.execute(
        select(SavedSignature).where(SavedSignature.user_id == str(user["_id"]))
    )
    sig = res.scalar_one_or_none()
    if sig:
        await session.delete(sig)
        await session.commit()
    return {"ok": True}
