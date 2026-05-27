"""Phase 2 backend tests — billing, tier-gating, saved-signature.

Covers:
- /api/billing/plans returns 3 plans
- /api/billing/status auth + free-tier limits
- /api/billing/checkout & /portal return 503 STRIPE_KEYS_NEEDED
- /api/billing/webhook idempotency
- Tier-gating: 6th doc returns 403 LIMIT_REACHED
- Tier-gating: 6+ signers returns 403 TOO_MANY_SIGNERS
- Free user cannot disable brand_enabled
- /api/esign/signature GET/PUT/DELETE
"""
import io
import os
import json
import uuid
import subprocess
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or os.environ.get(
    "NEXT_PUBLIC_BACKEND_URL",
    "https://26946d75-b144-4788-8ed6-b7fc8b535d7c.preview.emergentagent.com",
)
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@realprofits.com"
ADMIN_PASSWORD = "RealProfits2026!"


def _reset_counter():
    subprocess.run(
        ["su", "-", "postgres", "-c",
         "psql -d realprofits_esign -c \"UPDATE subscriptions SET docs_used_this_month = 0, tier='free';\""],
        capture_output=True, timeout=10,
    )


def _tiny_pdf() -> bytes:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    c.drawString(100, 750, "Phase 2 tier-gating PDF")
    c.showPage()
    c.save()
    return buf.getvalue()


@pytest.fixture(scope="module")
def auth_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    if r.status_code != 200:
        pytest.skip(f"login failed: {r.status_code} {r.text[:200]}")
    _reset_counter()
    return s


# ---------- Plans / Status (public + auth) ----------

class TestPlansAndStatus:
    def test_plans_returns_three(self):
        r = requests.get(f"{API}/billing/plans", timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert "plans" in body
        ids = [p["id"] for p in body["plans"]]
        assert set(ids) == {"free", "pro", "business"}
        pro = next(p for p in body["plans"] if p["id"] == "pro")
        assert pro["price_monthly"] == 9
        assert pro["price_annual"] == 79
        biz = next(p for p in body["plans"] if p["id"] == "business")
        assert biz["price_monthly"] == 29

    def test_status_requires_auth(self):
        r = requests.get(f"{API}/billing/status", timeout=15)
        assert r.status_code in (401, 403)

    def test_status_returns_free_tier(self, auth_session):
        _reset_counter()
        r = auth_session.get(f"{API}/billing/status", timeout=15)
        assert r.status_code == 200, r.text[:200]
        body = r.json()
        assert body["tier"] == "free"
        assert body["docs_used_this_month"] == 0
        assert body["limits"]["max_docs_per_month"] == 5
        assert body["limits"]["max_signers"] == 5
        assert body["limits"]["show_branding"] is True


# ---------- Stripe-not-configured 503 ----------

class TestStripeNotConfigured:
    def test_checkout_returns_503(self, auth_session):
        r = auth_session.post(f"{API}/billing/checkout",
                              json={"plan": "pro", "interval": "month"}, timeout=15)
        assert r.status_code == 503, f"got {r.status_code} {r.text[:200]}"
        body = r.json()
        # FastAPI wraps custom detail as {"detail": {...}}
        detail = body.get("detail", body)
        assert detail.get("code") == "STRIPE_KEYS_NEEDED"

    def test_portal_returns_503(self, auth_session):
        r = auth_session.post(f"{API}/billing/portal", timeout=15)
        assert r.status_code in (503, 400)  # 400 if no stripe_customer_id, 503 if key check first
        if r.status_code == 503:
            detail = r.json().get("detail", {})
            assert detail.get("code") == "STRIPE_KEYS_NEEDED"


# ---------- Webhook idempotency ----------

class TestWebhookIdempotency:
    def test_webhook_dedupe_by_event_id(self):
        # whsec_test => signature verification bypassed
        evt_id = f"evt_test_{uuid.uuid4().hex[:12]}"
        body = json.dumps({
            "id": evt_id,
            "type": "customer.subscription.updated",
            "data": {"object": {"customer": "cus_test_no_match", "id": "sub_xyz"}},
        })
        r1 = requests.post(f"{API}/billing/webhook", data=body,
                            headers={"Content-Type": "application/json"}, timeout=15)
        assert r1.status_code == 200, r1.text[:200]
        assert r1.json().get("ok") is True
        assert r1.json().get("duplicate") is not True
        # Duplicate
        r2 = requests.post(f"{API}/billing/webhook", data=body,
                            headers={"Content-Type": "application/json"}, timeout=15)
        assert r2.status_code == 200
        assert r2.json().get("duplicate") is True


# ---------- Tier gating ----------

class TestTierGating:
    def test_sixth_doc_returns_limit_reached(self, auth_session):
        _reset_counter()
        created_ids = []
        for i in range(5):
            r = auth_session.post(
                f"{API}/esign/documents",
                data={"title": f"TEST_TG_{i}"},
                files={"file": (f"t{i}.pdf", _tiny_pdf(), "application/pdf")},
                timeout=30,
            )
            assert r.status_code == 200, f"doc {i} failed: {r.status_code} {r.text[:200]}"
            created_ids.append(r.json()["id"])
        # 6th must fail
        r = auth_session.post(
            f"{API}/esign/documents",
            data={"title": "TEST_TG_6"},
            files={"file": ("t6.pdf", _tiny_pdf(), "application/pdf")},
            timeout=30,
        )
        assert r.status_code == 403, f"expected 403, got {r.status_code} {r.text[:200]}"
        detail = r.json().get("detail", {})
        if isinstance(detail, dict):
            assert detail.get("code") == "LIMIT_REACHED"
        else:
            assert "LIMIT_REACHED" in str(detail) or "limit" in str(detail).lower()
        # cleanup
        for did in created_ids:
            auth_session.delete(f"{API}/esign/documents/{did}")
        _reset_counter()

    def test_too_many_signers_returns_403(self, auth_session):
        _reset_counter()
        # Create a doc
        r = auth_session.post(
            f"{API}/esign/documents",
            data={"title": "TEST_TooManySigners"},
            files={"file": ("s.pdf", _tiny_pdf(), "application/pdf")},
            timeout=30,
        )
        assert r.status_code == 200
        doc_id = r.json()["id"]
        # Free tier MAX_SIGNERS=5, so 6 signers should fail
        signers = [
            {"name": f"S{i}", "email": f"TEST_s{i}@example.com",
             "role": "signer", "order_index": i}
            for i in range(6)
        ]
        r = auth_session.patch(f"{API}/esign/documents/{doc_id}",
                                json={"signers": signers}, timeout=15)
        assert r.status_code == 403, f"expected 403, got {r.status_code} {r.text[:200]}"
        detail = r.json().get("detail", {})
        if isinstance(detail, dict):
            assert detail.get("code") == "TOO_MANY_SIGNERS"
        else:
            assert "TOO_MANY_SIGNERS" in str(detail) or "signer" in str(detail).lower()
        # cleanup
        auth_session.delete(f"{API}/esign/documents/{doc_id}")

    def test_free_user_cannot_disable_branding(self, auth_session):
        _reset_counter()
        r = auth_session.post(
            f"{API}/esign/documents",
            data={"title": "TEST_Branding"},
            files={"file": ("b.pdf", _tiny_pdf(), "application/pdf")},
            timeout=30,
        )
        assert r.status_code == 200
        doc_id = r.json()["id"]
        r = auth_session.patch(f"{API}/esign/documents/{doc_id}",
                                json={"settings": {"brand_enabled": False}}, timeout=15)
        assert r.status_code == 200
        body = r.json()
        # brand_enabled should be forced back to True
        assert body.get("settings", {}).get("brand_enabled") is True, body.get("settings")
        auth_session.delete(f"{API}/esign/documents/{doc_id}")


# ---------- Saved signature ----------

class TestSavedSignature:
    def test_get_requires_auth(self):
        r = requests.get(f"{API}/esign/signature", timeout=15)
        assert r.status_code in (401, 403)

    def test_get_returns_null_when_empty(self, auth_session):
        # ensure clean
        auth_session.delete(f"{API}/esign/signature", timeout=15)
        r = auth_session.get(f"{API}/esign/signature", timeout=15)
        assert r.status_code == 200
        assert r.json().get("image_data") is None

    def test_put_save_and_get(self, auth_session):
        data_url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        r = auth_session.put(f"{API}/esign/signature",
                              json={"image_data": data_url, "method": "draw"}, timeout=15)
        assert r.status_code == 200, r.text[:200]
        r = auth_session.get(f"{API}/esign/signature", timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body["image_data"] == data_url
        assert body["method"] == "draw"

    def test_put_invalid_data_url(self, auth_session):
        r = auth_session.put(f"{API}/esign/signature",
                              json={"image_data": "not-a-data-url", "method": "draw"}, timeout=15)
        assert r.status_code == 400

    def test_put_too_large(self, auth_session):
        big = "data:image/png;base64," + ("A" * 500_001)
        r = auth_session.put(f"{API}/esign/signature",
                              json={"image_data": big, "method": "draw"}, timeout=15)
        assert r.status_code == 413

    def test_delete_wipes(self, auth_session):
        data_url = "data:image/png;base64,AAAA"
        auth_session.put(f"{API}/esign/signature",
                          json={"image_data": data_url, "method": "draw"}, timeout=15)
        r = auth_session.delete(f"{API}/esign/signature", timeout=15)
        assert r.status_code == 200
        r = auth_session.get(f"{API}/esign/signature", timeout=15)
        assert r.json().get("image_data") is None


def teardown_module(module):
    try:
        s = requests.Session()
        s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
        r = s.get(f"{API}/esign/documents", timeout=10)
        if r.status_code == 200:
            for d in r.json().get("documents", []):
                if d["title"].startswith("TEST_"):
                    s.delete(f"{API}/esign/documents/{d['id']}", timeout=10)
        _reset_counter()
    except Exception:
        pass
