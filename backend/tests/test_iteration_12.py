"""
Iteration 12 Tests: Next.js Migration Verification
Tests pSEO pages server-rendering, meta tags, OG tags, JSON-LD, canonical URLs
"""
import pytest
import requests
import os
import re

BASE_URL = os.environ.get('NEXT_PUBLIC_BACKEND_URL', 'https://26946d75-b144-4788-8ed6-b7fc8b535d7c.preview.emergentagent.com').rstrip('/')


class TestBackendHealth:
    """Backend API health check"""
    
    def test_health_endpoint(self):
        """Test /api/health returns 200 with healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ Backend health check passed: {data}")


class TestPseoSalaryGuide:
    """Test pSEO salary guide pages for server-rendering and SEO elements"""
    
    def test_salary_guide_50000_renders(self):
        """Test /guides/50000-salary has server-rendered content"""
        response = requests.get(f"{BASE_URL}/guides/50000-salary")
        assert response.status_code == 200
        html = response.text
        
        # Check title is server-rendered
        assert '<title>Is $50,000 a Good Salary?' in html
        print("✓ Title server-rendered")
        
        # Check OG tags
        assert 'og:title' in html
        assert 'og:description' in html
        assert 'og:url' in html
        print("✓ OG tags present")
        
        # Check canonical URL
        assert 'rel="canonical"' in html
        assert 'realprofits.com/guides/50000-salary' in html
        print("✓ Canonical URL present")
        
        # Check JSON-LD schemas
        assert 'application/ld+json' in html
        assert 'HowTo' in html
        assert 'FAQPage' in html
        assert 'BreadcrumbList' in html
        print("✓ JSON-LD schemas present (HowTo, FAQPage, BreadcrumbList)")
        
        # Check content is server-rendered
        assert 'data-testid="salary-guide-page"' in html
        assert 'data-testid="pseo-direct-answer"' in html
        assert 'data-testid="pseo-breadcrumb"' in html
        print("✓ Content server-rendered with data-testid attributes")


class TestPseoTaxGuide:
    """Test pSEO tax guide pages"""
    
    def test_tax_guide_100000_renders(self):
        """Test /guides/tax-on-100000-income has server-rendered content"""
        response = requests.get(f"{BASE_URL}/guides/tax-on-100000-income")
        assert response.status_code == 200
        html = response.text
        
        # Check title
        assert '<title>' in html
        assert 'Tax' in html or 'tax' in html
        print("✓ Tax guide title present")
        
        # Check OG tags
        assert 'og:title' in html
        print("✓ OG tags present")
        
        # Check canonical
        assert 'rel="canonical"' in html
        print("✓ Canonical URL present")
        
        # Check JSON-LD
        assert 'application/ld+json' in html
        print("✓ JSON-LD present")
        
        # Check content
        assert 'data-testid="tax-guide-page"' in html
        print("✓ Tax guide content server-rendered")


class TestPseoLocationSalary:
    """Test pSEO location-based salary guide pages"""
    
    def test_location_salary_sf_renders(self):
        """Test /guides/80000-salary-in-san-francisco renders city-specific content"""
        response = requests.get(f"{BASE_URL}/guides/80000-salary-in-san-francisco")
        assert response.status_code == 200
        html = response.text
        
        # Check title contains city
        assert 'San Francisco' in html
        print("✓ San Francisco mentioned in content")
        
        # Check OG tags
        assert 'og:title' in html
        print("✓ OG tags present")
        
        # Check canonical
        assert 'rel="canonical"' in html
        print("✓ Canonical URL present")
        
        # Check JSON-LD
        assert 'application/ld+json' in html
        print("✓ JSON-LD present")
        
        # Check location-specific content
        assert 'data-testid="location-salary-guide-page"' in html
        print("✓ Location salary guide content server-rendered")


class TestPseoSavingsGuide:
    """Test pSEO savings guide pages"""
    
    def test_savings_guide_10000_renders(self):
        """Test /guides/save-10000 renders correctly"""
        response = requests.get(f"{BASE_URL}/guides/save-10000")
        assert response.status_code == 200
        html = response.text
        
        # Check title
        assert '<title>' in html
        print("✓ Savings guide title present")
        
        # Check content
        assert 'data-testid="savings-guide-page"' in html
        print("✓ Savings guide content server-rendered")
        
        # Check JSON-LD
        assert 'application/ld+json' in html
        print("✓ JSON-LD present")


class TestPseoMortgageGuide:
    """Test pSEO mortgage guide pages"""
    
    def test_mortgage_guide_150000_renders(self):
        """Test /guides/mortgage-150000 renders correctly"""
        response = requests.get(f"{BASE_URL}/guides/mortgage-150000")
        assert response.status_code == 200
        html = response.text
        
        # Check title
        assert '<title>' in html
        print("✓ Mortgage guide title present")
        
        # Check content
        assert 'data-testid="mortgage-guide-page"' in html
        print("✓ Mortgage guide content server-rendered")
        
        # Check JSON-LD
        assert 'application/ld+json' in html
        print("✓ JSON-LD present")


class TestPseoDebtGuide:
    """Test pSEO debt guide pages"""
    
    def test_debt_guide_5000_renders(self):
        """Test /guides/pay-off-5000-debt renders correctly"""
        response = requests.get(f"{BASE_URL}/guides/pay-off-5000-debt")
        assert response.status_code == 200
        html = response.text
        
        # Check title
        assert '<title>' in html
        print("✓ Debt guide title present")
        
        # Check content
        assert 'data-testid="debt-guide-page"' in html
        print("✓ Debt guide content server-rendered")
        
        # Check JSON-LD
        assert 'application/ld+json' in html
        print("✓ JSON-LD present")


class TestPseoFreelancerGuide:
    """Test pSEO freelancer guide pages"""
    
    def test_freelancer_guide_50000_renders(self):
        """Test /guides/self-employment-tax-50000 renders correctly"""
        response = requests.get(f"{BASE_URL}/guides/self-employment-tax-50000")
        assert response.status_code == 200
        html = response.text
        
        # Check title
        assert '<title>' in html
        print("✓ Freelancer guide title present")
        
        # Check content
        assert 'data-testid="freelancer-guide-page"' in html
        print("✓ Freelancer guide content server-rendered")
        
        # Check JSON-LD
        assert 'application/ld+json' in html
        print("✓ JSON-LD present")


class TestStaticPages:
    """Test static pages load correctly"""
    
    def test_homepage_loads(self):
        """Test homepage / loads"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        html = response.text
        assert 'RealProfits' in html
        print("✓ Homepage loads")
    
    def test_guides_hub_loads(self):
        """Test /guides loads"""
        response = requests.get(f"{BASE_URL}/guides")
        assert response.status_code == 200
        html = response.text
        assert 'Guides' in html or 'guides' in html
        print("✓ Guides hub loads")
    
    def test_calculators_loads(self):
        """Test /calculators loads"""
        response = requests.get(f"{BASE_URL}/calculators")
        assert response.status_code == 200
        print("✓ Calculators page loads")
    
    def test_tools_loads(self):
        """Test /tools loads"""
        response = requests.get(f"{BASE_URL}/tools")
        assert response.status_code == 200
        print("✓ Tools page loads")
    
    def test_career_tools_loads(self):
        """Test /career-tools loads"""
        response = requests.get(f"{BASE_URL}/career-tools")
        assert response.status_code == 200
        print("✓ Career tools page loads")
    
    def test_what_if_loads(self):
        """Test /what-if loads"""
        response = requests.get(f"{BASE_URL}/what-if")
        assert response.status_code == 200
        print("✓ What-If page loads")
    
    def test_search_loads(self):
        """Test /search loads"""
        response = requests.get(f"{BASE_URL}/search")
        assert response.status_code == 200
        print("✓ Search page loads")
    
    def test_about_loads(self):
        """Test /about loads"""
        response = requests.get(f"{BASE_URL}/about")
        assert response.status_code == 200
        print("✓ About page loads")


class TestCalculatorDetailPage:
    """Test calculator detail pages"""
    
    def test_salary_reality_calculator_loads(self):
        """Test /calculators/salary-reality-calculator loads"""
        response = requests.get(f"{BASE_URL}/calculators/salary-reality-calculator")
        assert response.status_code == 200
        print("✓ Salary Reality Calculator page loads")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
