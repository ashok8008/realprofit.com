"""
Test iteration 11: Location Salary Guides (420 pages) and Resume Builder refactoring
Tests:
1. Sitemap stats endpoint returns correct counts (707 total guides, 420 location salary)
2. Location salary guide pages render correctly
3. Sitemap XML contains location salary URLs
4. Old guides still work (salary, mortgage, debt, freelancer)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://26946d75-b144-4788-8ed6-b7fc8b535d7c.preview.emergentagent.com').rstrip('/')


class TestSitemapStats:
    """Test sitemap stats endpoint for new location salary guides"""
    
    def test_sitemap_stats_total_guides(self):
        """Verify total guide pages is 707 (287 original + 420 location salary)"""
        response = requests.get(f"{BASE_URL}/api/sitemap/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total_guide_pages"] == 707, f"Expected 707 total guides, got {data['total_guide_pages']}"
        print(f"✓ Total guide pages: {data['total_guide_pages']}")
    
    def test_sitemap_stats_location_salary_count(self):
        """Verify location salary guides count is 420 (14 amounts × 30 cities)"""
        response = requests.get(f"{BASE_URL}/api/sitemap/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["location_salary_guides"] == 420, f"Expected 420 location salary guides, got {data['location_salary_guides']}"
        print(f"✓ Location salary guides: {data['location_salary_guides']}")
    
    def test_sitemap_stats_all_clusters(self):
        """Verify all 7 guide clusters are present"""
        response = requests.get(f"{BASE_URL}/api/sitemap/stats")
        assert response.status_code == 200
        data = response.json()
        
        expected_clusters = ["salary_guides", "tax_guides", "savings_guides", 
                           "mortgage_guides", "debt_guides", "freelancer_guides", 
                           "location_salary_guides"]
        
        for cluster in expected_clusters:
            assert cluster in data, f"Missing cluster: {cluster}"
            assert data[cluster] > 0, f"Cluster {cluster} has 0 guides"
            print(f"✓ {cluster}: {data[cluster]}")


class TestSitemapXML:
    """Test dynamic sitemap XML contains location salary URLs"""
    
    def test_sitemap_contains_location_salary_urls(self):
        """Verify sitemap XML contains location salary guide URLs"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        assert response.status_code == 200
        assert "application/xml" in response.headers.get("content-type", "")
        
        xml_content = response.text
        
        # Check for sample location salary URLs
        test_urls = [
            "/guides/80000-salary-in-san-francisco",
            "/guides/100000-salary-in-austin",
            "/guides/50000-salary-in-new-york",
            "/guides/150000-salary-in-seattle",
        ]
        
        for url in test_urls:
            assert url in xml_content, f"Missing URL in sitemap: {url}"
            print(f"✓ Found in sitemap: {url}")
    
    def test_sitemap_url_count(self):
        """Verify sitemap has expected number of URLs (842 total)"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        assert response.status_code == 200
        
        xml_content = response.text
        url_count = xml_content.count("<url>")
        
        # Should be around 842 based on stats endpoint
        assert url_count >= 800, f"Expected ~842 URLs, got {url_count}"
        print(f"✓ Sitemap URL count: {url_count}")


class TestLocationSalaryPages:
    """Test location salary guide pages render correctly via frontend"""
    
    def test_san_francisco_80k_page(self):
        """Test $80,000 salary in San Francisco page"""
        response = requests.get(f"{BASE_URL}/guides/80000-salary-in-san-francisco", allow_redirects=True)
        # Frontend routes - should return 200 (SPA routing)
        assert response.status_code == 200
        print("✓ San Francisco $80k page accessible")
    
    def test_austin_100k_page(self):
        """Test $100,000 salary in Austin (no state tax)"""
        response = requests.get(f"{BASE_URL}/guides/100000-salary-in-austin", allow_redirects=True)
        assert response.status_code == 200
        print("✓ Austin $100k page accessible")
    
    def test_new_york_50k_page(self):
        """Test $50,000 salary in New York (high COL)"""
        response = requests.get(f"{BASE_URL}/guides/50000-salary-in-new-york", allow_redirects=True)
        assert response.status_code == 200
        print("✓ New York $50k page accessible")


class TestOldGuidesStillWork:
    """Verify existing guide types still work after adding location salary"""
    
    def test_old_salary_guide(self):
        """Test original salary guide still works"""
        response = requests.get(f"{BASE_URL}/guides/50000-salary", allow_redirects=True)
        assert response.status_code == 200
        print("✓ Old salary guide (/guides/50000-salary) works")
    
    def test_mortgage_guide(self):
        """Test mortgage guide still works"""
        response = requests.get(f"{BASE_URL}/guides/mortgage-300000", allow_redirects=True)
        assert response.status_code == 200
        print("✓ Mortgage guide (/guides/mortgage-300000) works")
    
    def test_debt_guide(self):
        """Test debt guide still works"""
        response = requests.get(f"{BASE_URL}/guides/pay-off-10000-debt", allow_redirects=True)
        assert response.status_code == 200
        print("✓ Debt guide (/guides/pay-off-10000-debt) works")
    
    def test_freelancer_guide(self):
        """Test freelancer guide still works"""
        response = requests.get(f"{BASE_URL}/guides/self-employment-tax-100000", allow_redirects=True)
        assert response.status_code == 200
        print("✓ Freelancer guide (/guides/self-employment-tax-100000) works")


class TestHealthEndpoint:
    """Basic health check"""
    
    def test_api_health(self):
        """Verify API is healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ API health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
