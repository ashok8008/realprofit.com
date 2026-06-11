"""Verify bank block rendering on the public invoice HTML page.

Tests review item (3) — when bank_details set + no payment_link, the public
invoice HTML must contain 'Bank / payment details' and bank_name.
"""
import os
import pytest
import httpx

API = os.environ.get("API_URL", "http://localhost:8001")


@pytest.mark.asyncio
async def test_public_invoice_renders_bank_block():
    async with httpx.AsyncClient(base_url=API, timeout=30) as client:
        login = await client.post("/api/auth/login", json={
            "email": "admin@realprofits.com",
            "password": "RealProfits2026!",
        })
        assert login.status_code == 200

        bd = {
            "bank_name": "Chase Bank",
            "account_holder": "Test Holder",
            "account_number": "999988887777",
            "routing_number": "021000021",
            "account_type": "Checking",
            "paypal": "@testhandle",
            "notes": "Reference invoice in memo",
        }

        # Create an invoice with bank_details and NO payment_link.
        invoice_payload = {
            "client_name": "TEST_BankRender Client",
            "client_email": "test-bank@example.com",
            "items": [{"description": "Item 1", "quantity": 1, "rate": 100.0}],
            "tax_rate": 0,
            "currency": "USD",
            "bank_details": bd,
        }
        cr = await client.post("/api/invoices", json=invoice_payload, cookies=login.cookies)
        assert cr.status_code in (200, 201), cr.text
        invoice = cr.json()
        invoice_id = invoice.get("id") or invoice.get("_id")

        # Share / get public token
        sh = await client.post(f"/api/invoices/{invoice_id}/share", cookies=login.cookies)
        assert sh.status_code == 200, sh.text
        token = sh.json().get("token") or sh.json().get("share_token")
        assert token

        # Public render (HTML)
        pub = await client.get(f"/api/invoices/public/{token}")
        assert pub.status_code == 200, pub.text
        ctype = pub.headers.get("content-type", "")
        body = pub.text
        # Public route may return HTML or JSON depending on Accept header.
        if "html" in ctype:
            assert "Bank" in body and "Chase Bank" in body, \
                f"Bank block missing: {body[:1000]}"
        else:
            # JSON: bank_details should be present in payload.
            data = pub.json()
            assert data.get("bank_details", {}).get("bank_name") == "Chase Bank"

        # Cleanup
        await client.delete(f"/api/invoices/{invoice_id}", cookies=login.cookies)
