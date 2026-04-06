"""
pSEO System Backend Tests
Tests for dynamic sitemap endpoint and sitemap stats
"""
import pytest
import requests
import xml.etree.ElementTree as ET
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://26946d75-b144-4788-8ed6-b7fc8b535d7c.preview.emergentagent.com')


class TestSitemapStats:
    """Tests for /api/sitemap/stats endpoint"""
    
    def test_sitemap_stats_returns_200(self):
        """Sitemap stats endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/sitemap/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Sitemap stats endpoint returns 200")
    
    def test_sitemap_stats_has_required_fields(self):
        """Sitemap stats should have all required count fields"""
        response = requests.get(f"{BASE_URL}/api/sitemap/stats")
        data = response.json()
        
        required_fields = [
            "salary_guides", "tax_guides", "savings_guides",
            "mortgage_guides", "debt_guides", "freelancer_guides",
            "total_guide_pages", "total_sitemap_urls"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
            assert isinstance(data[field], int), f"Field {field} should be int"
        
        print(f"✓ All required fields present: {list(data.keys())}")
    
    def test_sitemap_stats_counts_are_positive(self):
        """All guide counts should be positive"""
        response = requests.get(f"{BASE_URL}/api/sitemap/stats")
        data = response.json()
        
        assert data["salary_guides"] > 0, "Salary guides count should be > 0"
        assert data["tax_guides"] > 0, "Tax guides count should be > 0"
        assert data["savings_guides"] > 0, "Savings guides count should be > 0"
        assert data["mortgage_guides"] > 0, "Mortgage guides count should be > 0"
        assert data["debt_guides"] > 0, "Debt guides count should be > 0"
        assert data["freelancer_guides"] > 0, "Freelancer guides count should be > 0"
        
        print(f"✓ Guide counts: salary={data['salary_guides']}, tax={data['tax_guides']}, "
              f"savings={data['savings_guides']}, mortgage={data['mortgage_guides']}, "
              f"debt={data['debt_guides']}, freelancer={data['freelancer_guides']}")
    
    def test_total_guide_pages_exceeds_threshold(self):
        """Total guide pages should exceed 250 (scalable pSEO)"""
        response = requests.get(f"{BASE_URL}/api/sitemap/stats")
        data = response.json()
        
        assert data["total_guide_pages"] >= 250, f"Expected >= 250 guide pages, got {data['total_guide_pages']}"
        print(f"✓ Total guide pages: {data['total_guide_pages']} (threshold: 250)")
    
    def test_total_sitemap_urls_exceeds_400(self):
        """Total sitemap URLs should exceed 400"""
        response = requests.get(f"{BASE_URL}/api/sitemap/stats")
        data = response.json()
        
        assert data["total_sitemap_urls"] >= 400, f"Expected >= 400 URLs, got {data['total_sitemap_urls']}"
        print(f"✓ Total sitemap URLs: {data['total_sitemap_urls']} (threshold: 400)")


class TestDynamicSitemap:
    """Tests for /api/sitemap.xml endpoint"""
    
    def test_sitemap_returns_200(self):
        """Sitemap endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Sitemap endpoint returns 200")
    
    def test_sitemap_content_type_is_xml(self):
        """Sitemap should return XML content type"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        content_type = response.headers.get('content-type', '')
        assert 'xml' in content_type.lower(), f"Expected XML content type, got {content_type}"
        print(f"✓ Content-Type: {content_type}")
    
    def test_sitemap_is_valid_xml(self):
        """Sitemap should be valid XML"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        try:
            root = ET.fromstring(response.content)
            print(f"✓ Valid XML with root tag: {root.tag}")
        except ET.ParseError as e:
            pytest.fail(f"Invalid XML: {e}")
    
    def test_sitemap_has_url_elements(self):
        """Sitemap should contain <url> elements"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        root = ET.fromstring(response.content)
        
        # Handle namespace
        ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = root.findall('.//sm:url', ns)
        
        assert len(urls) > 400, f"Expected > 400 URLs, got {len(urls)}"
        print(f"✓ Sitemap contains {len(urls)} URLs")
    
    def test_sitemap_contains_guide_urls(self):
        """Sitemap should contain guide URLs for all 6 types"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        content = response.text
        
        # Check for each guide type
        guide_patterns = [
            "/guides/",  # General guides path
            "-salary",   # Salary guides
            "tax-on-",   # Tax guides
            "save-",     # Savings guides
            "mortgage-", # Mortgage guides
            "pay-off-",  # Debt payoff guides
            "credit-card-interest-",  # Debt interest guides
            "self-employment-tax-",   # Freelancer SE tax
            "how-much-tax-to-set-aside-"  # Freelancer set-aside
        ]
        
        for pattern in guide_patterns:
            assert pattern in content, f"Missing guide pattern: {pattern}"
        
        print("✓ All guide URL patterns found in sitemap")
    
    def test_sitemap_url_structure(self):
        """Each URL should have loc, lastmod, changefreq, priority"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        root = ET.fromstring(response.content)
        
        ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = root.findall('.//sm:url', ns)
        
        # Check first 5 URLs for structure
        for url in urls[:5]:
            loc = url.find('sm:loc', ns)
            lastmod = url.find('sm:lastmod', ns)
            changefreq = url.find('sm:changefreq', ns)
            priority = url.find('sm:priority', ns)
            
            assert loc is not None, "URL missing <loc>"
            assert lastmod is not None, "URL missing <lastmod>"
            assert changefreq is not None, "URL missing <changefreq>"
            assert priority is not None, "URL missing <priority>"
        
        print("✓ URL structure validated (loc, lastmod, changefreq, priority)")


class TestHealthEndpoint:
    """Tests for /api/health endpoint"""
    
    def test_health_returns_200(self):
        """Health endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Health endpoint returns 200")
    
    def test_health_returns_healthy_status(self):
        """Health endpoint should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        data = response.json()
        
        assert data.get("status") == "healthy", f"Expected healthy status, got {data.get('status')}"
        print(f"✓ Health status: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
