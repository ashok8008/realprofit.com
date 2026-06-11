"""Tests for guest eSign flow + sliding session + bank details + invoice settings.

These are integration tests against a running local backend (port 8001).
Run with: pytest backend/tests/test_iter41.py -v
"""
import os
import io
import re
import time
import uuid
import asyncio
import pytest
import httpx
from sqlalchemy import select
from datetime import datetime, timezone

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Load backend env so esign.database picks up DATABASE_URL when the test
# process accesses Postgres directly (outside the live server).
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

API = os.environ.get("API_URL", "http://localhost:8001")

MIN_PDF = (
    b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj\n"
    b"2 0 obj <</Type/Pages/Kids[3 0 R]/Count 1>> endobj\n"
    b"3 0 obj <</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<<>>>> endobj\n"
    b"xref\n0 4\n0000000000 65535 f \n0000000015 00000 n \n0000000060 00000 n \n0000000111 00000 n \n"
    b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n186\n%%EOF\n"
)


# ─────────────────────────────────────────────────────────────────────────────
# (1) Session TTL: access token now 60 min, refresh works.
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_session_ttl_and_refresh():
    async with httpx.AsyncClient(base_url=API) as client:
        login = await client.post("/api/auth/login", json={
            "email": "admin@realprofits.com",
            "password": "RealProfits2026!",
        })
        assert login.status_code == 200
        access = login.cookies.get("access_token")
        assert access
        # Decode w/o verifying — confirm `exp` is ≥ 50 minutes out.
        import jwt
        payload = jwt.decode(access, options={"verify_signature": False})
        ttl_sec = payload["exp"] - int(time.time())
        assert ttl_sec > 50 * 60, f"access token TTL should be 60-min-ish, got {ttl_sec}s"

        # Refresh works and returns a new access cookie.
        refresh = await client.post("/api/auth/refresh", cookies=login.cookies)
        assert refresh.status_code == 200
        assert refresh.cookies.get("access_token")


# ─────────────────────────────────────────────────────────────────────────────
# (2) Invoice settings — bank details save + readback.
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_invoice_settings_bank_details_roundtrip():
    async with httpx.AsyncClient(base_url=API) as client:
        login = await client.post("/api/auth/login", json={
            "email": "admin@realprofits.com",
            "password": "RealProfits2026!",
        })
        assert login.status_code == 200
        bd = {
            "bank_name": "Chase",
            "account_holder": "Admin Account",
            "account_number": "111122223333",
            "routing_number": "021000021",
            "account_type": "Checking",
            "paypal": "@adminhandle",
            "notes": "Reference invoice # in memo",
        }
        put_res = await client.put("/api/invoices/settings",
                                     json={"bank_details": bd}, cookies=login.cookies)
        assert put_res.status_code == 200, put_res.text
        get_res = await client.get("/api/invoices/settings", cookies=login.cookies)
        assert get_res.status_code == 200
        body = get_res.json()
        assert body.get("bank_details", {}).get("bank_name") == "Chase"
        assert body["bank_details"]["account_number"] == "111122223333"


# ─────────────────────────────────────────────────────────────────────────────
# (3) Guest eSign — happy path: create -> verify -> sent.
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_guest_esign_happy_path(monkeypatch):
    # Clear rate-limit state from previous tests.
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        cl = AsyncIOMotorClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
        await cl[os.environ.get("DB_NAME", "realprofits")].esign_guest_sends.delete_many({})
        cl.close()
    except Exception:
        pass

    """Send as a guest. Monkeypatch the email sender to capture the OTP."""
    # Patch the verification email sender to capture the code in-process.
    captured = {}
    from esign import email_service as esvc

    original = esvc.send_guest_verification
    async def fake_send_guest_verification(*, to_email, sender_name, document_title,
                                            signer_name, signer_email, code,
                                            expires_minutes=30):
        captured["code"] = code
        captured["to_email"] = to_email
        return True
    monkeypatch.setattr(esvc, "send_guest_verification", fake_send_guest_verification)

    # Also stub the signer signature-request email so we don't hit Resend.
    sent_signing = {}
    async def fake_send_sig(*, to_email, signer_name, owner_name, document_title,
                             sign_url, expires=None, role="signer"):
        sent_signing["to"] = to_email
        sent_signing["role"] = role
        sent_signing["url"] = sign_url
        return True
    monkeypatch.setattr(esvc, "send_signature_request", fake_send_sig)

    unique = uuid.uuid4().hex[:8]
    sender_email = f"sender_{unique}@example.com"
    signer_email = f"signer_{unique}@example.com"

    # Now exercise the API through the live HTTP server. Because we monkeypatched
    # via `monkeypatch`, the patched function applies inside this pytest process
    # only. For server-side capture we need a different strategy: hit the API,
    # then read the verification code out of the documents row directly.
    import json as _json
    payload = {
        "title": "Guest Test Contract",
        "sender_name": "Guest Sender",
        "sender_email": sender_email,
        "signer_name": "Test Signer",
        "signer_email": signer_email,
        "fields": [
            {"page": 1, "x": 0.1, "y": 0.1, "width": 0.2, "height": 0.05,
             "field_type": "signature", "required": True}
        ],
        "signing_order": "parallel",
    }
    async with httpx.AsyncClient(base_url=API, timeout=30) as client:
        files = {
            "file": ("contract.pdf", MIN_PDF, "application/pdf"),
            "payload": (None, _json.dumps(payload), "application/json"),
        }
        # httpx multipart helper: re-encode using `data` + `files`.
        res = await client.post("/api/esign/guest/documents",
                                  data={"payload": _json.dumps(payload)},
                                  files={"file": ("contract.pdf", MIN_PDF, "application/pdf")})
        assert res.status_code == 200, res.text
        body = res.json()
        verification_id = body["verification_id"]
        doc_id = body["document_id"]

        # Read the 6-digit code straight out of Postgres (we don't have a Resend
        # capture point in the live server process).
        from esign.database import get_session
        from esign.models import Document, Signer
        from sqlalchemy import select as _select
        plain_code = None
        async for session in get_session():
            res2 = await session.execute(_select(Document).where(Document.id == uuid.UUID(doc_id)))
            doc = res2.scalar_one()
            assert doc.status == "pending_verify"
            assert doc.owner_id == f"guest:{sender_email}"
            # We can't read the plaintext code, but we can verify the hash is set
            # and length matches a bcrypt string.
            assert doc.settings.get("verification_code_hash", "").startswith("$2")
            assert doc.settings.get("verification_id") == verification_id
            # For the test we need to set a *known* code by overwriting the hash.
            import bcrypt
            doc.settings = {**doc.settings, "verification_code_hash": bcrypt.hashpw(b"123456", bcrypt.gensalt(rounds=4)).decode("utf-8")}
            await session.commit()
            plain_code = "123456"
            break
        assert plain_code

        # Verify the wrong code first.
        bad = await client.post("/api/esign/guest/documents/verify",
                                  json={"verification_id": verification_id, "code": "000000"})
        assert bad.status_code == 401

        # Now the right one.
        good = await client.post("/api/esign/guest/documents/verify",
                                   json={"verification_id": verification_id, "code": plain_code})
        assert good.status_code == 200, good.text
        out = good.json()
        assert out["status"] == "sent"
        assert out["document_id"] == doc_id
        claim_token = out["claim_token"]

        # Status endpoint with the claim token.
        st = await client.get(f"/api/esign/guest/documents/{doc_id}/status",
                                params={"claim": claim_token})
        assert st.status_code == 200
        s = st.json()
        assert s["status"] == "sent"


# ─────────────────────────────────────────────────────────────────────────────
# (4) Guest eSign reject: sender == signer email
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_guest_esign_rejects_same_sender_signer():
    import json as _json
    payload = {
        "title": "Bad doc",
        "sender_name": "Same", "sender_email": "same@example.com",
        "signer_name": "Same", "signer_email": "same@example.com",
        "fields": [{"page": 1, "x": 0.1, "y": 0.1, "width": 0.2, "height": 0.05,
                    "field_type": "signature", "required": True}],
    }
    async with httpx.AsyncClient(base_url=API) as client:
        res = await client.post("/api/esign/guest/documents",
                                  data={"payload": _json.dumps(payload)},
                                  files={"file": ("contract.pdf", MIN_PDF, "application/pdf")})
        assert res.status_code == 400
        assert "cannot be the same" in res.text


# ─────────────────────────────────────────────────────────────────────────────
# (5) Auto-attach: register a new user with an email that owns guest docs,
#     and confirm those docs are re-owned.
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_guest_doc_auto_attach_on_register():
    # Clear rate-limit history so this test never collides with prior runs.
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        cl = AsyncIOMotorClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
        await cl[os.environ.get("DB_NAME", "realprofits")].esign_guest_sends.delete_many({})
        cl.close()
    except Exception:
        pass

    unique = uuid.uuid4().hex[:10]
    sender_email = f"claim_{unique}@example.com"
    signer_email = f"recipient_{unique}@example.com"
    import json as _json
    payload = {
        "title": "Claim Test",
        "sender_name": "Claim Tester", "sender_email": sender_email,
        "signer_name": "Recip", "signer_email": signer_email,
        "fields": [{"page": 1, "x": 0.1, "y": 0.1, "width": 0.2, "height": 0.05,
                    "field_type": "signature", "required": True}],
    }
    async with httpx.AsyncClient(base_url=API, timeout=30) as client:
        res = await client.post("/api/esign/guest/documents",
                                  data={"payload": _json.dumps(payload)},
                                  files={"file": ("c.pdf", MIN_PDF, "application/pdf")})
        assert res.status_code == 200, res.text
        doc_id = res.json()["document_id"]

        # Register with the same email — should auto-attach.
        reg = await client.post("/api/auth/register", json={
            "email": sender_email, "password": "ClaimTest1!", "name": "Claim Tester",
        })
        assert reg.status_code == 200, reg.text
        user = reg.json()
        user_id = user["id"]

    # Confirm Postgres owner_id was updated (use sync driver to avoid event-loop juggling).
    import psycopg2
    dsn = os.environ["DATABASE_URL"].replace("postgresql+asyncpg://", "postgresql://").split("?")[0]
    conn = psycopg2.connect(dsn)
    try:
        cur = conn.cursor()
        cur.execute("SELECT owner_id FROM documents WHERE id = %s", (doc_id,))
        row = cur.fetchone()
        assert row is not None, "doc not found"
        assert row[0] == user_id, f"expected attach to {user_id}, got {row[0]}"
    finally:
        conn.close()
