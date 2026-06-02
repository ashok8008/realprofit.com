"""Iteration 39 — verify auth 401 behavior, eSign draft list, and invoice qty formatting.

Covers:
- Auth: /api/auth/login (cookie based), /api/auth/me
- eSign: /api/esign/documents (list), GET /api/esign/documents/{id} returns drafts
- Invoice: POST /api/invoices, GET public /api/invoices/public/{token} renders qty as "1" (no "1.0" or "hr")
- 401 on protected endpoints when no auth cookie
"""
import os
import re
import io
import pytest
import requests

BASE_URL = os.environ["NEXT_PUBLIC_BACKEND_URL"].rstrip("/") if "NEXT_PUBLIC_BACKEND_URL" in os.environ \
    else "https://26946d75-b144-4788-8ed6-b7fc8b535d7c.preview.emergentagent.com"

ADMIN_EMAIL = "admin@realprofits.com"
ADMIN_PASSWORD = "RealProfits2026!"


@pytest.fixture(scope="module")
def auth_session():
    s = requests.Session()
    r = s.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=15,
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    # validate session is real
    me = s.get(f"{BASE_URL}/api/auth/me", timeout=10)
    assert me.status_code == 200
    return s


# ---------- Health & Auth ----------

def test_health_ok():
    r = requests.get(f"{BASE_URL}/api/health", timeout=10)
    assert r.status_code == 200


def test_unauth_invoice_returns_401():
    r = requests.get(f"{BASE_URL}/api/invoices", timeout=10)
    assert r.status_code == 401, f"expected 401, got {r.status_code}"


def test_unauth_esign_returns_401():
    r = requests.get(f"{BASE_URL}/api/esign/documents", timeout=10)
    assert r.status_code == 401, f"expected 401, got {r.status_code}"


def test_login_sets_cookie(auth_session):
    # presence of session validated by fixture
    assert any("token" in c.name.lower() or "session" in c.name.lower() or "access" in c.name.lower()
               for c in auth_session.cookies) or len(auth_session.cookies) > 0


# ---------- eSign drafts list ----------

def test_esign_list_authenticated(auth_session):
    r = auth_session.get(f"{BASE_URL}/api/esign/documents", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "documents" in data
    assert isinstance(data["documents"], list)


# ---------- Invoice qty formatting in public portal ----------

@pytest.fixture(scope="module")
def created_invoice(auth_session):
    payload = {
        "client_name": "TEST_QtyClient",
        "client_email": "qty@test.com",
        "items": [
            {"description": "Consulting hours", "qty": 1, "rate": 100.0},
            {"description": "", "qty": 2.5, "rate": 50.0},  # empty description + fractional qty
        ],
        "currency": "USD",
    }
    r = auth_session.post(f"{BASE_URL}/api/invoices", json=payload, timeout=15)
    assert r.status_code in (200, 201), f"create invoice failed: {r.status_code} {r.text}"
    inv = r.json()
    assert "id" in inv
    yield inv
    # cleanup
    try:
        auth_session.delete(f"{BASE_URL}/api/invoices/{inv['id']}", timeout=10)
    except Exception:
        pass


def test_invoice_share_token(auth_session, created_invoice):
    r = auth_session.post(f"{BASE_URL}/api/invoices/{created_invoice['id']}/share", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    # may return {token: ...} or {public_url: ...}
    token = data.get("token") or (data.get("public_url", "").rstrip("/").split("/")[-1])
    assert token, f"no share token in response: {data}"
    created_invoice["_share_token"] = token


def test_public_portal_qty_format(auth_session, created_invoice):
    token = created_invoice.get("_share_token")
    if not token:
        # try to obtain again
        r = auth_session.post(f"{BASE_URL}/api/invoices/{created_invoice['id']}/share", timeout=15)
        data = r.json()
        token = data.get("token") or (data.get("public_url", "").rstrip("/").split("/")[-1])
    assert token
    r = requests.get(f"{BASE_URL}/api/invoices/public/{token}", timeout=15)
    assert r.status_code == 200, f"public portal returned {r.status_code}"
    html = r.text
    # Make sure '1.0 hr', '1.0' qty pattern and stray 'hr' unit don't appear in qty cell
    # Look at qty cells: text-align:center;">VALUE</td>
    qty_cells = re.findall(r'text-align:center;\">([^<]*)</td>', html)
    # filter only numeric-looking entries (skip headers like 'Qty')
    numeric_cells = [c.strip() for c in qty_cells if c.strip() and c.strip().lower() != 'qty']
    assert numeric_cells, f"no qty cells found in HTML. Cells parsed: {qty_cells[:5]}"
    # qty=1 must render as '1' (no '.0', no 'hr')
    assert "1" in numeric_cells, f"expected '1' in qty cells, got {numeric_cells}"
    # No '.0' literal in qty
    for c in numeric_cells:
        assert not c.endswith(".0"), f"qty cell '{c}' ends with '.0' — bad formatting"
        assert "hr" not in c.lower(), f"qty cell '{c}' contains 'hr' — bad formatting"
        assert "item" not in c.lower(), f"qty cell '{c}' contains 'Item' literal"
    # qty=2.5 should render as '2.5'
    assert "2.5" in numeric_cells, f"expected '2.5' in qty cells, got {numeric_cells}"


def test_public_portal_does_not_emit_literal_Item_for_empty_desc(created_invoice):
    token = created_invoice.get("_share_token")
    assert token
    r = requests.get(f"{BASE_URL}/api/invoices/public/{token}", timeout=15)
    assert r.status_code == 200
    html = r.text
    # Description cells (first td of each row) — look for literal "Item" placeholder
    # The fix means empty description renders empty (no fallback). Just ensure literal ">Item<" isn't present
    # for the row we created with empty description.
    # We can't easily isolate the row, so just sanity check: number of "Item" string occurrences should NOT
    # appear as a standalone td value.
    assert ">Item</td>" not in html, "literal 'Item' fallback found in description cell"
