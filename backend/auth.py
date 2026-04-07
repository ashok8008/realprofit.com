import os
import secrets
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
from bson import ObjectId

from db import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_ALGORITHM = "HS256"
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


# ---------- helpers ----------

def _jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access",
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh",
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def _set_auth_cookies(response: JSONResponse, access: str, refresh: str):
    response.set_cookie(key="access_token", value=access, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")


def _user_dict(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "user"),
        "created_at": user.get("created_at", "").isoformat() if hasattr(user.get("created_at", ""), "isoformat") else str(user.get("created_at", "")),
    }


async def get_current_user(request: Request) -> dict:
    db = get_db()
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_optional_user(request: Request):
    """Return user dict or None (no exception for anonymous)."""
    try:
        return await get_current_user(request)
    except HTTPException:
        return None


# ---------- brute-force protection ----------

async def _check_brute_force(ip: str, email: str):
    db = get_db()
    identifier = f"{ip}:{email}"
    record = await db.login_attempts.find_one({"identifier": identifier})
    if record and record.get("count", 0) >= MAX_LOGIN_ATTEMPTS:
        locked_until = record.get("locked_until")
        if locked_until and datetime.now(timezone.utc) < locked_until:
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})


async def _record_failed_attempt(ip: str, email: str):
    db = get_db()
    identifier = f"{ip}:{email}"
    record = await db.login_attempts.find_one({"identifier": identifier})
    if record:
        new_count = record.get("count", 0) + 1
        update = {"$set": {"count": new_count}}
        if new_count >= MAX_LOGIN_ATTEMPTS:
            update["$set"]["locked_until"] = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)
        await db.login_attempts.update_one({"identifier": identifier}, update)
    else:
        await db.login_attempts.insert_one({"identifier": identifier, "count": 1})


async def _clear_attempts(ip: str, email: str):
    db = get_db()
    await db.login_attempts.delete_many({"identifier": f"{ip}:{email}"})


# ---------- models ----------

class RegisterBody(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = ""


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordBody(BaseModel):
    email: EmailStr


class ResetPasswordBody(BaseModel):
    token: str
    new_password: str


# ---------- endpoints ----------

@router.post("/register")
async def register(body: RegisterBody):
    db = get_db()
    email = body.email.lower().strip()
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user_doc = {
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name or email.split("@")[0],
        "role": "user",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    access = create_access_token(str(result.inserted_id), email)
    refresh = create_refresh_token(str(result.inserted_id))
    resp = JSONResponse(content=_user_dict(user_doc))
    _set_auth_cookies(resp, access, refresh)
    return resp


@router.post("/login")
async def login(body: LoginBody, request: Request):
    db = get_db()
    email = body.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    await _check_brute_force(ip, email)
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await _record_failed_attempt(ip, email)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await _clear_attempts(ip, email)
    access = create_access_token(str(user["_id"]), email)
    refresh = create_refresh_token(str(user["_id"]))
    resp = JSONResponse(content=_user_dict(user))
    _set_auth_cookies(resp, access, refresh)
    return resp


@router.post("/logout")
async def logout():
    resp = JSONResponse(content={"message": "Logged out"})
    resp.delete_cookie("access_token", path="/")
    resp.delete_cookie("refresh_token", path="/")
    return resp


@router.get("/me")
async def me(request: Request):
    user = await get_current_user(request)
    return _user_dict(user)


@router.post("/refresh")
async def refresh_token(request: Request):
    db = get_db()
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(str(user["_id"]), user["email"])
        resp = JSONResponse(content=_user_dict(user))
        resp.set_cookie(key="access_token", value=access, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
        return resp
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordBody):
    db = get_db()
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        return {"message": "If that email exists, a reset link has been sent."}
    token = secrets.token_urlsafe(32)
    await db.password_reset_tokens.insert_one({
        "token": token,
        "user_id": str(user["_id"]),
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
        "used": False,
    })
    print(f"[RESET LINK] /reset-password?token={token}")
    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordBody):
    db = get_db()
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    record = await db.password_reset_tokens.find_one({"token": body.token, "used": False})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if record["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token expired")
    await db.users.update_one(
        {"_id": ObjectId(record["user_id"])},
        {"$set": {"password_hash": hash_password(body.new_password)}},
    )
    await db.password_reset_tokens.update_one({"_id": record["_id"]}, {"$set": {"used": True}})
    return {"message": "Password reset successfully"}


# ---------- admin seed ----------

async def seed_admin():
    db = get_db()
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@realprofits.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "RealProfits2026!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
        })
        print(f"[SEED] Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        print(f"[SEED] Admin password updated: {admin_email}")
