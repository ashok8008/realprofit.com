"""
Invoice & Client API Tests
Tests for /api/invoices and /api/invoices/clients endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "test1234"


@pytest.fixture(scope="module")
def session():
    """Create authenticated session"""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    
    # Login
    resp = s.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return s


class TestInvoiceAPI:
    """Invoice CRUD endpoint tests"""
    
    def test_list_invoices(self, session):
        """GET /api/invoices - List all invoices"""
        resp = session.get(f"{BASE_URL}/api/invoices")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} invoices")
    
    def test_create_invoice(self, session):
        """POST /api/invoices - Create new invoice"""
        payload = {
            "invoice_number": "TEST-INV-001",
            "date": "2026-01-15",
            "due_date": "2026-02-15",
            "status": "draft",
            "currency": "USD",
            "business_name": "Test Business",
            "business_email": "test@business.com",
            "business_phone": "555-1234",
            "business_address": "123 Test St",
            "client_name": "TEST_Client",
            "client_email": "client@test.com",
            "items": [
                {"description": "Test Service", "qty": 2, "unit": "hr", "rate": 100}
            ],
            "subtotal": 200,
            "discount_amount": 0,
            "tax_amount": 0,
            "total": 200
        }
        resp = session.post(f"{BASE_URL}/api/invoices", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert data["status"] == "created"
        print(f"Created invoice with ID: {data['id']}")
        return data["id"]
    
    def test_get_invoice(self, session):
        """GET /api/invoices/{id} - Get specific invoice"""
        # First create an invoice
        create_resp = session.post(f"{BASE_URL}/api/invoices", json={
            "invoice_number": "TEST-INV-GET",
            "client_name": "TEST_GetClient",
            "client_email": "get@test.com",
            "items": [{"description": "Item", "qty": 1, "unit": "hr", "rate": 50}],
            "total": 50
        })
        assert create_resp.status_code == 200
        invoice_id = create_resp.json()["id"]
        
        # Get the invoice
        resp = session.get(f"{BASE_URL}/api/invoices/{invoice_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == invoice_id
        assert data["invoice_number"] == "TEST-INV-GET"
        assert data["client_name"] == "TEST_GetClient"
        print(f"Retrieved invoice: {data['invoice_number']}")
    
    def test_update_invoice(self, session):
        """PUT /api/invoices/{id} - Update invoice"""
        # Create invoice
        create_resp = session.post(f"{BASE_URL}/api/invoices", json={
            "invoice_number": "TEST-INV-UPDATE",
            "client_name": "TEST_UpdateClient",
            "client_email": "update@test.com",
            "items": [{"description": "Original", "qty": 1, "unit": "hr", "rate": 100}],
            "total": 100
        })
        invoice_id = create_resp.json()["id"]
        
        # Update invoice
        update_payload = {
            "invoice_number": "TEST-INV-UPDATE",
            "client_name": "TEST_UpdatedClient",
            "client_email": "updated@test.com",
            "items": [{"description": "Updated", "qty": 2, "unit": "hr", "rate": 150}],
            "total": 300,
            "status": "sent"
        }
        resp = session.put(f"{BASE_URL}/api/invoices/{invoice_id}", json=update_payload)
        assert resp.status_code == 200
        assert resp.json()["status"] == "updated"
        
        # Verify update
        get_resp = session.get(f"{BASE_URL}/api/invoices/{invoice_id}")
        data = get_resp.json()
        assert data["client_name"] == "TEST_UpdatedClient"
        assert data["status"] == "sent"
        print(f"Updated invoice: {data['invoice_number']}")
    
    def test_delete_invoice(self, session):
        """DELETE /api/invoices/{id} - Delete invoice"""
        # Create invoice
        create_resp = session.post(f"{BASE_URL}/api/invoices", json={
            "invoice_number": "TEST-INV-DELETE",
            "client_name": "TEST_DeleteClient",
            "client_email": "delete@test.com",
            "items": [],
            "total": 0
        })
        invoice_id = create_resp.json()["id"]
        
        # Delete invoice
        resp = session.delete(f"{BASE_URL}/api/invoices/{invoice_id}")
        assert resp.status_code == 200
        assert resp.json()["status"] == "deleted"
        
        # Verify deletion
        get_resp = session.get(f"{BASE_URL}/api/invoices/{invoice_id}")
        assert get_resp.status_code == 404
        print(f"Deleted invoice: {invoice_id}")
    
    def test_record_payment(self, session):
        """POST /api/invoices/{id}/payment - Record partial payment"""
        # Create invoice
        create_resp = session.post(f"{BASE_URL}/api/invoices", json={
            "invoice_number": "TEST-INV-PAYMENT",
            "client_name": "TEST_PaymentClient",
            "client_email": "payment@test.com",
            "items": [{"description": "Service", "qty": 1, "unit": "hr", "rate": 500}],
            "total": 500,
            "payments": []
        })
        invoice_id = create_resp.json()["id"]
        
        # Record payment
        payment_payload = {
            "amount": 250,
            "date": "2026-01-20",
            "note": "First payment"
        }
        resp = session.post(f"{BASE_URL}/api/invoices/{invoice_id}/payment", json=payment_payload)
        assert resp.status_code == 200
        assert resp.json()["status"] == "payment_recorded"
        
        # Verify payment was recorded
        get_resp = session.get(f"{BASE_URL}/api/invoices/{invoice_id}")
        data = get_resp.json()
        assert len(data["payments"]) == 1
        assert data["payments"][0]["amount"] == 250
        print(f"Recorded payment of $250 on invoice {invoice_id}")
    
    def test_get_stats(self, session):
        """GET /api/invoices/stats/summary - Get invoice statistics"""
        resp = session.get(f"{BASE_URL}/api/invoices/stats/summary")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_count" in data
        assert "total_revenue" in data
        assert "paid_count" in data
        assert "overdue_count" in data
        print(f"Stats: {data['total_count']} invoices, ${data['total_revenue']} revenue")


class TestClientAPI:
    """Client CRUD endpoint tests"""
    
    def test_list_clients(self, session):
        """GET /api/invoices/clients/list - List all clients"""
        resp = session.get(f"{BASE_URL}/api/invoices/clients/list")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} clients")
    
    def test_create_client(self, session):
        """POST /api/invoices/clients - Create new client"""
        payload = {
            "name": "TEST_NewClient",
            "company": "Test Company Inc",
            "email": "newclient@test.com",
            "address": "456 Client Ave"
        }
        resp = session.post(f"{BASE_URL}/api/invoices/clients", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert data["status"] == "created"
        print(f"Created client with ID: {data['id']}")
        return data["id"]
    
    def test_update_client(self, session):
        """PUT /api/invoices/clients/{id} - Update client"""
        # Create client
        create_resp = session.post(f"{BASE_URL}/api/invoices/clients", json={
            "name": "TEST_UpdateClient",
            "email": "updateclient@test.com"
        })
        client_id = create_resp.json()["id"]
        
        # Update client
        update_payload = {
            "name": "TEST_UpdatedClient",
            "company": "Updated Company",
            "email": "updatedclient@test.com",
            "address": "789 Updated St"
        }
        resp = session.put(f"{BASE_URL}/api/invoices/clients/{client_id}", json=update_payload)
        assert resp.status_code == 200
        assert resp.json()["status"] == "updated"
        
        # Verify update
        list_resp = session.get(f"{BASE_URL}/api/invoices/clients/list")
        clients = list_resp.json()
        updated_client = next((c for c in clients if c["id"] == client_id), None)
        assert updated_client is not None
        assert updated_client["name"] == "TEST_UpdatedClient"
        print(f"Updated client: {updated_client['name']}")
    
    def test_delete_client(self, session):
        """DELETE /api/invoices/clients/{id} - Delete client"""
        # Create client
        create_resp = session.post(f"{BASE_URL}/api/invoices/clients", json={
            "name": "TEST_DeleteClient",
            "email": "deleteclient@test.com"
        })
        client_id = create_resp.json()["id"]
        
        # Delete client
        resp = session.delete(f"{BASE_URL}/api/invoices/clients/{client_id}")
        assert resp.status_code == 200
        assert resp.json()["status"] == "deleted"
        
        # Verify deletion
        list_resp = session.get(f"{BASE_URL}/api/invoices/clients/list")
        clients = list_resp.json()
        deleted_client = next((c for c in clients if c["id"] == client_id), None)
        assert deleted_client is None
        print(f"Deleted client: {client_id}")


class TestAuthRequired:
    """Test that endpoints require authentication"""
    
    def test_invoices_without_auth(self):
        """GET /api/invoices without auth should return 401"""
        resp = requests.get(f"{BASE_URL}/api/invoices")
        assert resp.status_code == 401
        print("Invoices endpoint correctly requires auth")
    
    def test_clients_without_auth(self):
        """GET /api/invoices/clients/list without auth should return 401"""
        resp = requests.get(f"{BASE_URL}/api/invoices/clients/list")
        assert resp.status_code == 401
        print("Clients endpoint correctly requires auth")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_invoices(self, session):
        """Delete all TEST_ prefixed invoices"""
        resp = session.get(f"{BASE_URL}/api/invoices")
        invoices = resp.json()
        deleted = 0
        for inv in invoices:
            if inv.get("invoice_number", "").startswith("TEST-") or inv.get("client_name", "").startswith("TEST_"):
                session.delete(f"{BASE_URL}/api/invoices/{inv['id']}")
                deleted += 1
        print(f"Cleaned up {deleted} test invoices")
    
    def test_cleanup_test_clients(self, session):
        """Delete all TEST_ prefixed clients"""
        resp = session.get(f"{BASE_URL}/api/invoices/clients/list")
        clients = resp.json()
        deleted = 0
        for client in clients:
            if client.get("name", "").startswith("TEST_"):
                session.delete(f"{BASE_URL}/api/invoices/clients/{client['id']}")
                deleted += 1
        print(f"Cleaned up {deleted} test clients")
