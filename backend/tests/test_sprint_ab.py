"""Sprint A/B regression tests:
   - Analytics (A/B test events) — POST /api/analytics/event + admin GET /api/analytics/summary
   - Invoice public share endpoint (POST /share, GET /public/{token})
   - Scheduler: mark_invoices_overdue_job behaviour
"""
import os
import time
import asyncio
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
ADMIN_EMAIL = "admin@realprofits.com"
ADMIN_PASS = "RealProfits2026!"


# ──────────────────────────  fixtures  ──────────────────────────
@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return s


# ──────────────────────  Analytics endpoints  ───────────────────
class TestAnalytics:
    def test_event_unauth_writes_ok(self):
        """POST /api/analytics/event works without auth and persists."""
        sid = f"TEST_sess_{int(time.time())}"
        body = {"experiment": "TEST_exp_unit", "variant": "free",
                "event": "impression", "session_id": sid, "path": "/pricing"}
        r = requests.post(f"{BASE_URL}/api/analytics/event", json=body)
        assert r.status_code == 200, r.text
        assert r.json() == {"ok": True}

    def test_event_invalid_event_400(self):
        r = requests.post(f"{BASE_URL}/api/analytics/event", json={
            "experiment": "TEST_exp_unit", "variant": "free",
            "event": "garbage", "session_id": "12345678",
        })
        assert r.status_code == 422

    def test_summary_requires_admin(self):
        r = requests.get(f"{BASE_URL}/api/analytics/summary/TEST_exp_unit")
        # Unauthenticated → 401 (current_user dependency) or 403
        assert r.status_code in (401, 403), r.status_code

    def test_summary_admin_aggregates_variants(self, admin_session):
        # Seed both variants
        for variant, evt in [("free", "impression"), ("free", "click"),
                              ("pro", "impression"), ("pro", "convert")]:
            requests.post(f"{BASE_URL}/api/analytics/event", json={
                "experiment": "TEST_exp_summary", "variant": variant,
                "event": evt, "session_id": f"TEST_s_{variant}_{evt}",
            })
        r = admin_session.get(f"{BASE_URL}/api/analytics/summary/TEST_exp_summary")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["experiment"] == "TEST_exp_summary"
        variants = {v["variant"]: v for v in data["variants"]}
        assert "free" in variants and "pro" in variants
        # free variant: 1 impression, 1 click  → click_rate 100%
        assert variants["free"]["clicks"] == 1
        assert variants["free"]["click_rate"] == 100.0
        # pro: 1 impression, 1 convert  → conversion_rate 100%
        assert variants["pro"]["conversion_rate"] == 100.0


# ────────────────────  Invoice share endpoints  ─────────────────
class TestInvoiceShare:
    @pytest.fixture(scope="class")
    def invoice_id(self, admin_session):
        body = {
            "invoice_number": "TEST_SHARE_001",
            "business_name": "Test Biz",
            "client_name": "Tester",
            "client_email": "tester@example.com",
            "items": [{"description": "Item A", "quantity": 1, "rate": 100.0}],
            "subtotal": 100.0, "tax": 0, "total": 100.0,
            "status": "sent",
            "payment_link": "https://pay.example.com/abc",
            "currency": "USD",
            "due_date": "2026-12-31",
        }
        r = admin_session.post(f"{BASE_URL}/api/invoices", json=body)
        assert r.status_code == 200, r.text
        inv_id = r.json()["id"]
        yield inv_id
        # cleanup
        admin_session.delete(f"{BASE_URL}/api/invoices/{inv_id}")

    def test_share_creates_token(self, admin_session, invoice_id):
        r = admin_session.post(f"{BASE_URL}/api/invoices/{invoice_id}/share")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "share_token" in data and "public_url" in data
        # token_urlsafe(24) → 32-char base64 url-safe
        assert len(data["share_token"]) >= 24
        assert f"/i/{data['share_token']}" in data["public_url"]

    def test_share_is_idempotent(self, admin_session, invoice_id):
        r1 = admin_session.post(f"{BASE_URL}/api/invoices/{invoice_id}/share").json()
        r2 = admin_session.post(f"{BASE_URL}/api/invoices/{invoice_id}/share").json()
        assert r1["share_token"] == r2["share_token"], "share token must be stable"

    def test_public_invoice_returns_html(self, admin_session, invoice_id):
        token = admin_session.post(f"{BASE_URL}/api/invoices/{invoice_id}/share").json()["share_token"]
        r = requests.get(f"{BASE_URL}/api/invoices/public/{token}")  # NO auth
        assert r.status_code == 200, r.text
        assert "text/html" in r.headers.get("content-type", "")
        assert "TEST_SHARE_001" in r.text or "Test Biz" in r.text
        # Pay Now button present because payment_link set + not paid
        assert "Pay Now" in r.text
        assert "public-pay-btn" in r.text

    def test_public_invalid_token_404(self):
        r = requests.get(f"{BASE_URL}/api/invoices/public/nonexistent_token_xyz")
        assert r.status_code == 404

    def test_public_paid_invoice_hides_pay_btn(self, admin_session, invoice_id):
        # mark as paid
        admin_session.put(f"{BASE_URL}/api/invoices/{invoice_id}", json={
            "invoice_number": "TEST_SHARE_001", "business_name": "Test Biz",
            "client_name": "Tester", "client_email": "tester@example.com",
            "items": [{"description": "Item A", "quantity": 1, "rate": 100.0}],
            "subtotal": 100.0, "tax": 0, "total": 100.0,
            "status": "paid",
            "payment_link": "https://pay.example.com/abc",
            "currency": "USD", "due_date": "2026-12-31",
        })
        token = admin_session.post(f"{BASE_URL}/api/invoices/{invoice_id}/share").json()["share_token"]
        r = requests.get(f"{BASE_URL}/api/invoices/public/{token}")
        assert r.status_code == 200
        assert "public-pay-btn" not in r.text


# ───────────────────  Scheduler: mark_overdue  ──────────────────
class TestMarkOverdue:
    def test_mark_invoices_overdue_job(self, admin_session):
        """Create a sent invoice with past due_date; run job; verify status=overdue."""
        body = {
            "invoice_number": "TEST_OVERDUE_001",
            "business_name": "B", "client_name": "C", "client_email": "c@e.com",
            "items": [{"description": "x", "quantity": 1, "rate": 50.0}],
            "subtotal": 50, "tax": 0, "total": 50,
            "status": "sent",
            "currency": "USD",
            "due_date": "2024-01-01",  # past
        }
        r = admin_session.post(f"{BASE_URL}/api/invoices", json=body)
        assert r.status_code == 200
        inv_id = r.json()["id"]
        try:
            # Load backend .env so DATABASE_URL/MONGO_URL are available
            import sys
            from dotenv import load_dotenv
            load_dotenv("/app/backend/.env")
            sys.path.insert(0, "/app/backend")
            from scheduler_jobs import mark_invoices_overdue_job
            asyncio.run(mark_invoices_overdue_job())
            time.sleep(0.5)
            got = admin_session.get(f"{BASE_URL}/api/invoices/{inv_id}").json()
            assert got["status"] == "overdue", got
        finally:
            admin_session.delete(f"{BASE_URL}/api/invoices/{inv_id}")


# ───────────────────────  Scheduler boot  ───────────────────────
def test_scheduler_logged_five_jobs():
    """The current/latest backend boot must log all 5 jobs."""
    import subprocess
    out = subprocess.run(
        ["grep", "-h", r"\[scheduler\] Started:", "/var/log/supervisor/backend.out.log"],
        capture_output=True, text=True,
    ).stdout
    assert out.strip(), "no scheduler boot log found"
    last = out.strip().splitlines()[-1]
    for job in ["reminders", "expire_docs", "reset_counters", "mark_overdue", "invoice_reminders"]:
        assert job in last, f"job '{job}' missing in scheduler boot log: {last}"
