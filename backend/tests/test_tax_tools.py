"""
Tax Tools API Tests
Tests the /api/tax-tools/explain endpoint for AI tax explanations
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('NEXT_PUBLIC_BACKEND_URL', 'https://26946d75-b144-4788-8ed6-b7fc8b535d7c.preview.emergentagent.com')


class TestTaxToolsAPI:
    """Tests for Tax Tools API endpoints"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_tax_explain_endpoint_success(self):
        """Test /api/tax-tools/explain returns AI explanation"""
        payload = {
            "prompt": "Freelancer earning $60,000 with $12,000 expenses. Explain my tax situation."
        }
        response = requests.post(
            f"{BASE_URL}/api/tax-tools/explain",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "explanation" in data
        assert len(data["explanation"]) > 50  # Should have meaningful content
        print(f"✓ Tax explain endpoint returned explanation ({len(data['explanation'])} chars)")
    
    def test_tax_explain_endpoint_with_detailed_prompt(self):
        """Test /api/tax-tools/explain with detailed tax scenario"""
        payload = {
            "prompt": "Income mix: W-2 $50,000, Freelance $30,000, Other $0. Deductions $14,600. State rate 5%. Federal tax $9,441, State tax $3,270, SE tax $4,239. Total tax $16,950. Effective rate 21.2%. Explain key insights."
        }
        response = requests.post(
            f"{BASE_URL}/api/tax-tools/explain",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "explanation" in data
        assert len(data["explanation"]) > 50
        print(f"✓ Detailed tax explain returned explanation ({len(data['explanation'])} chars)")
    
    def test_tax_explain_endpoint_empty_prompt(self):
        """Test /api/tax-tools/explain with empty prompt"""
        payload = {"prompt": ""}
        response = requests.post(
            f"{BASE_URL}/api/tax-tools/explain",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        # Should still return 200 but with minimal explanation
        assert response.status_code == 200
        data = response.json()
        assert "explanation" in data
        print("✓ Empty prompt handled gracefully")
    
    def test_tax_explain_endpoint_missing_prompt(self):
        """Test /api/tax-tools/explain with missing prompt field"""
        payload = {}
        response = requests.post(
            f"{BASE_URL}/api/tax-tools/explain",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        # Should return 422 for validation error
        assert response.status_code == 422
        print("✓ Missing prompt returns 422 validation error")
    
    def test_sitemap_includes_tax_tools(self):
        """Test that sitemap includes tax-tools URLs"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        assert response.status_code == 200
        content = response.text
        
        # Check for tax-tools hub
        assert "/tax-tools" in content
        
        # Check for individual tax tool pages
        tax_tool_slugs = [
            "freelancer-tax-planner",
            "income-mix-planner",
            "tax-checklist-generator",
            "1040es-prep-generator",
            "schedule-c-prep-summary",
            "tax-summary-pdf",
            "w2-1099-organizer",
            "year-end-tax-packet"
        ]
        
        found_count = 0
        for slug in tax_tool_slugs:
            if f"/tax-tools/{slug}" in content:
                found_count += 1
        
        assert found_count == len(tax_tool_slugs), f"Only found {found_count}/{len(tax_tool_slugs)} tax tool URLs in sitemap"
        print(f"✓ Sitemap includes all {len(tax_tool_slugs)} tax tool URLs")
    
    def test_sitemap_stats_endpoint(self):
        """Test sitemap stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/sitemap/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_sitemap_urls" in data
        assert data["total_sitemap_urls"] > 100  # Should have many URLs
        print(f"✓ Sitemap stats: {data['total_sitemap_urls']} total URLs")


class TestCareerToolsAPI:
    """Verify career tools API still works (regression test)"""
    
    def test_email_templates_list(self):
        """Test email templates list endpoint"""
        response = requests.get(f"{BASE_URL}/api/career-tools/email-templates")
        assert response.status_code == 200
        data = response.json()
        assert "templates" in data
        assert len(data["templates"]) >= 4
        print(f"✓ Email templates endpoint returns {len(data['templates'])} templates")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
