"""Iteration 40 — eSign: witness/next-signer sees other signers' filled fields.

Covers:
- GET /api/esign/sign/{token} returns `other_filled_fields` (list of fields signed
  by OTHER signers with non-null values) and `signers` (lightweight summary).
- After signer1 submits a signature, signer2 and witness BOTH receive the
  data:image URL of signer1's signature inside `other_filled_fields`.
- `signers` summary includes id/name/color/order_index/status for all signers.

Strategy:
- Login as admin, create a 1-page PDF doc, set 2 signers + 1 witness in PARALLEL.
- Mint signing tokens via /send + then directly using esign_tokens helper, and
  patch the DB token_hash so our minted tokens are accepted.
- POST /sign/{token1}/submit with a base64 PNG signature.
- GET /sign/{token2} and /sign/{tokenW} and assert other_filled_fields contains
  signer1's filled field with value starting with 'data:image' (after the
  signer-submit pipeline stores it). The frontend sends a real data URL; here we
  send the same shape so we can verify the round-trip.
"""
import io
import os
import base64
import subprocess
import sys

import pytest
import requests
from dotenv import load_dotenv

# Load backend .env so JWT_SECRET / DATABASE_URL are available for esign tokens.
load_dotenv("/app/backend/.env")
sys.path.insert(0, "/app/backend")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or os.environ.get(
    "NEXT_PUBLIC_BACKEND_URL",
    "https://26946d75-b144-4788-8ed6-b7fc8b535d7c.preview.emergentagent.com",
)
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@realprofits.com"
ADMIN_PASSWORD = "RealProfits2026!"


# ---------- Helpers ----------

def _tiny_pdf_bytes() -> bytes:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    c.drawString(100, 750, "Iter40 Witness Preview Test")
    c.showPage()
    c.save()
    return buf.getvalue()


def _psql(query: str) -> str:
    """Run a psql command via the postgres OS user and return stdout."""
    out = subprocess.run(
        ["su", "-", "postgres", "-c",
         f'psql -d realprofits_esign -t -A -F "|" -c "{query}"'],
        capture_output=True, text=True, timeout=15,
    )
    assert out.returncode == 0, f"psql failed: {out.stderr}\nquery: {query}"
    return out.stdout


@pytest.fixture(scope="module")
def auth_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
               timeout=15)
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text[:200]}")
    # Reset usage counters so tier-gating doesn't block creation
    try:
        _psql("UPDATE subscriptions SET docs_used_this_month = 0;")
    except Exception:
        pass
    return s


@pytest.fixture(scope="module")
def witness_doc(auth_session):
    """Create doc + 2 signers + 1 witness, parallel mode, with 3 signature fields."""
    pdf = _tiny_pdf_bytes()
    r = auth_session.post(
        f"{API}/esign/documents",
        data={"title": "TEST_Iter40_Witness"},
        files={"file": ("w.pdf", pdf, "application/pdf")},
        timeout=30,
    )
    assert r.status_code == 200, r.text[:300]
    doc = r.json()

    patch = {
        "signing_order": "parallel",
        "signers": [
            {"name": "Signer One", "email": "TEST_iter40_s1@example.com",
             "role": "signer", "order_index": 0},
            {"name": "Signer Two", "email": "TEST_iter40_s2@example.com",
             "role": "signer", "order_index": 1},
            {"name": "Wendy Witness", "email": "TEST_iter40_witness@example.com",
             "role": "witness", "order_index": 2},
        ],
    }
    r = auth_session.patch(f"{API}/esign/documents/{doc['id']}", json=patch, timeout=15)
    assert r.status_code == 200, r.text[:300]
    doc = r.json()
    assert len(doc["signers"]) == 3
    signers_by_role = {s["role"]: s for s in doc["signers"]}
    assert "witness" in signers_by_role, "witness signer not created"

    # Add one signature field per signer
    sid_by_email = {s["email"]: s["id"] for s in doc["signers"]}
    fields = [
        {"signer_id": sid_by_email["test_iter40_s1@example.com"], "page": 1,
         "x": 0.1, "y": 0.1, "width": 0.3, "height": 0.08,
         "field_type": "signature", "required": True, "label": "Signer1 Sig"},
        {"signer_id": sid_by_email["test_iter40_s2@example.com"], "page": 1,
         "x": 0.5, "y": 0.1, "width": 0.3, "height": 0.08,
         "field_type": "signature", "required": True, "label": "Signer2 Sig"},
        {"signer_id": sid_by_email["test_iter40_witness@example.com"], "page": 1,
         "x": 0.1, "y": 0.3, "width": 0.3, "height": 0.08,
         "field_type": "signature", "required": True, "label": "Witness Sig"},
    ]
    r = auth_session.patch(f"{API}/esign/documents/{doc['id']}",
                            json={"fields": fields}, timeout=15)
    assert r.status_code == 200, r.text[:300]
    doc = r.json()
    assert len(doc["fields"]) == 3

    # Send to create initial tokens
    r = auth_session.post(f"{API}/esign/documents/{doc['id']}/send", timeout=20)
    assert r.status_code == 200, r.text[:300]
    assert r.json()["status"] == "sent"

    yield doc

    # Cleanup
    try:
        auth_session.delete(f"{API}/esign/documents/{doc['id']}", timeout=10)
    except Exception:
        pass


def _mint_tokens_for_doc(doc_id: str) -> dict:
    """Mint fresh tokens for all signers and update token_hash in DB.

    Returns: { email -> (signer_id, token) }
    """
    from esign import tokens as esign_tokens
    q = f"SELECT id, email FROM signers WHERE document_id='{doc_id}';"
    out = _psql(q)
    rows = [ln for ln in out.strip().split("\n") if ln.strip()]
    assert rows, "no signers found"
    result = {}
    for ln in rows:
        sid, email = ln.split("|")
        tok = esign_tokens.create_signing_token(sid, doc_id, email)
        th = esign_tokens.hash_token(tok)
        _psql(f"UPDATE signers SET token_hash='{th}', token_used=false "
              f"WHERE id='{sid}';")
        result[email.lower()] = (sid, tok)
    return result


# ---------- Tests ----------

class TestWitnessPreview:
    def test_initial_other_filled_fields_empty(self, witness_doc):
        """Before anyone signs, other_filled_fields must be empty for everyone."""
        toks = _mint_tokens_for_doc(witness_doc["id"])
        for email, (_sid, tok) in toks.items():
            r = requests.get(f"{API}/esign/sign/{tok}", timeout=15)
            assert r.status_code == 200, f"{email}: {r.status_code} {r.text[:200]}"
            body = r.json()
            # Response schema includes new fields
            assert "other_filled_fields" in body, f"missing other_filled_fields for {email}"
            assert "signers" in body, f"missing signers summary for {email}"
            assert isinstance(body["other_filled_fields"], list)
            assert body["other_filled_fields"] == [], \
                f"expected empty other_filled_fields for {email}, got {body['other_filled_fields']}"
            # signers summary has 3 entries with required keys
            assert len(body["signers"]) == 3, f"expected 3 signers, got {len(body['signers'])}"
            for s in body["signers"]:
                for key in ("id", "name", "color", "order_index", "status"):
                    assert key in s, f"signers entry missing {key}: {s}"

    def test_signer2_and_witness_see_signer1_signature(self, witness_doc):
        """After signer1 signs, signer2 and witness must see signer1's signature
        in other_filled_fields with the data:image value preserved."""
        # Re-mint tokens (previous test may have consumed view state but token_hash unchanged)
        toks = _mint_tokens_for_doc(witness_doc["id"])
        s1_email = "test_iter40_s1@example.com"
        s2_email = "test_iter40_s2@example.com"
        w_email = "test_iter40_witness@example.com"
        _s1_sid, s1_tok = toks[s1_email]
        _s2_sid, s2_tok = toks[s2_email]
        _w_sid, w_tok = toks[w_email]

        # 1) Signer1 fetches view -> get their field id
        r = requests.get(f"{API}/esign/sign/{s1_tok}", timeout=15)
        assert r.status_code == 200, r.text[:200]
        s1_view = r.json()
        assert len(s1_view["fields"]) == 1, \
            f"signer1 should only see own field, got {len(s1_view['fields'])}"
        s1_field_id = s1_view["fields"][0]["id"]

        # 2) Signer1 submits a real data URL signature
        # 1x1 transparent PNG data URL
        png_b64 = ("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQ"
                   "VR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")
        data_url = f"data:image/png;base64,{png_b64}"
        submit_payload = {
            "signer_name": "Signer One",
            "field_values": [{"field_id": s1_field_id, "value": data_url}],
            "consent": True,
        }
        r = requests.post(f"{API}/esign/sign/{s1_tok}/submit",
                           json=submit_payload, timeout=30)
        assert r.status_code == 200, f"submit failed: {r.status_code} {r.text[:300]}"
        assert r.json()["status"] == "signed"
        assert r.json()["document_status"] == "partial"

        # 3) Signer2 fetches view -> should see signer1's signature in other_filled_fields
        r = requests.get(f"{API}/esign/sign/{s2_tok}", timeout=15)
        assert r.status_code == 200
        s2_view = r.json()
        assert "other_filled_fields" in s2_view
        # Should contain exactly signer1's filled field
        assert len(s2_view["other_filled_fields"]) == 1, \
            f"signer2 should see 1 other field, got {len(s2_view['other_filled_fields'])}: {s2_view['other_filled_fields']}"
        other = s2_view["other_filled_fields"][0]
        assert other["value"].startswith("data:image"), \
            f"expected data:image value, got: {other['value'][:50]}..."
        assert other["id"] == s1_field_id
        assert other["signer_id"] != s2_view["fields"][0]["signer_id"], \
            "other_filled_fields must NOT contain signer2's own fields"
        # Field has bbox info for overlay positioning
        for key in ("page", "x", "y", "width", "height"):
            assert key in other, f"overlay field missing {key}"

        # 4) Witness fetches view -> should ALSO see signer1's signature
        r = requests.get(f"{API}/esign/sign/{w_tok}", timeout=15)
        assert r.status_code == 200
        w_view = r.json()
        assert len(w_view["other_filled_fields"]) == 1, \
            f"witness should see 1 other field, got {len(w_view['other_filled_fields'])}"
        wo = w_view["other_filled_fields"][0]
        assert wo["value"].startswith("data:image")
        assert wo["id"] == s1_field_id
        # Witness signer summary present
        assert any(s["name"] == "Wendy Witness" for s in w_view["signers"])

    def test_signer1_view_excludes_own_filled_field(self, witness_doc):
        """Signer1 should NOT see their own field in other_filled_fields
        (would be redundant) — only OTHER signers' filled fields appear."""
        toks = _mint_tokens_for_doc(witness_doc["id"])
        # signer1 already submitted in previous test; token_used=true. Re-minting
        # resets token_used=false but keeps signer.status='signed' and the field
        # already has a value. We can still fetch the view.
        s1_email = "test_iter40_s1@example.com"
        _sid, s1_tok = toks[s1_email]
        r = requests.get(f"{API}/esign/sign/{s1_tok}", timeout=15)
        assert r.status_code == 200, r.text[:200]
        body = r.json()
        # other_filled_fields must NOT contain signer1's own signer_id
        my_sid = body["fields"][0]["signer_id"] if body["fields"] else None
        for f in body.get("other_filled_fields", []):
            assert f["signer_id"] != my_sid, \
                "own filled field leaked into other_filled_fields"
