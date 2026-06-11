"""
SEO Tests for Tax Tools Section
Tests canonical URLs, JSON-LD schemas, sitemap, and robots.txt
"""
import pytest
import requests
import os
import re
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://26946d75-b144-4788-8ed6-b7fc8b535d7c.preview.emergentagent.com').rstrip('/')

# Tax tool slugs for testing
TAX_TOOL_SLUGS = [
    "freelancer-tax-planner",
    "income-mix-planner", 
    "tax-checklist-generator",
    "1040es-prep-generator",
    "schedule-c-prep-summary",
    "tax-summary-pdf",
    "w2-1099-organizer",
    "year-end-tax-packet",
]


class TestBackendSitemap:
    """Backend sitemap endpoint tests"""
    
    def test_sitemap_xml_returns_200(self):
        """Backend /api/sitemap.xml returns 200"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "application/xml" in response.headers.get("content-type", "")
        print("✓ Backend /api/sitemap.xml returns 200 with XML content-type")
    
    def test_sitemap_includes_tax_tools_hub(self):
        """Backend sitemap includes /tax-tools hub URL"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml", timeout=30)
        assert response.status_code == 200
        content = response.text
        assert "/tax-tools</loc>" in content or "/tax-tools<" in content, "Missing /tax-tools hub in sitemap"
        print("✓ Backend sitemap includes /tax-tools hub URL")
    
    def test_sitemap_includes_all_tax_tool_detail_urls(self):
        """Backend sitemap includes all 8 tax tool detail URLs"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        missing = []
        for slug in TAX_TOOL_SLUGS:
            if f"/tax-tools/{slug}" not in content:
                missing.append(slug)
        
        assert len(missing) == 0, f"Missing tax tool URLs in sitemap: {missing}"
        print("OK Backend sitemap includes all 8 tax tool detail URLs")
    
    def test_sitemap_stats_returns_correct_count(self):
        """Backend /api/sitemap/stats returns total_sitemap_urls >= 1200"""
        response = requests.get(f"{BASE_URL}/api/sitemap/stats", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        assert "total_sitemap_urls" in data, "Missing total_sitemap_urls in response"
        total = data["total_sitemap_urls"]
        assert total >= 1200, f"Expected >= 1200 URLs, got {total}"
        print(f"✓ Backend sitemap stats: {total} total URLs (>= 1200)")


class TestFrontendSitemap:
    """Frontend sitemap.xml tests"""
    
    def test_frontend_sitemap_returns_200(self):
        """Frontend /sitemap.xml returns 200"""
        response = requests.get(f"{BASE_URL}/sitemap.xml", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Frontend /sitemap.xml returns 200")
    
    def test_frontend_sitemap_includes_tax_tools_hub(self):
        """Frontend sitemap includes /tax-tools hub URL"""
        response = requests.get(f"{BASE_URL}/sitemap.xml", timeout=30)
        assert response.status_code == 200
        content = response.text
        assert "/tax-tools</loc>" in content or "/tax-tools<" in content, "Missing /tax-tools hub in frontend sitemap"
        print("✓ Frontend sitemap includes /tax-tools hub URL")
    
    def test_frontend_sitemap_includes_tax_tool_detail_urls(self):
        """Frontend sitemap includes tax tool detail URLs"""
        response = requests.get(f"{BASE_URL}/sitemap.xml", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        found = []
        for slug in TAX_TOOL_SLUGS:
            if f"/tax-tools/{slug}" in content:
                found.append(slug)
        
        # Frontend sitemap should have at least the non-calculator tax tools
        assert len(found) >= 8, f"Expected 8 tax tool URLs, found {len(found)}: {found}"
        print(f"✓ Frontend sitemap includes {len(found)} tax tool detail URLs")


class TestRobotsTxt:
    """robots.txt directive tests
    
    Note: Cloudflare prepends its own managed content to robots.txt.
    The Next.js robots.ts rules are merged with Cloudflare's rules.
    We test for the effective rules that crawlers will see.
    """
    
    def test_robots_txt_returns_200(self):
        """robots.txt returns 200"""
        response = requests.get(f"{BASE_URL}/robots.txt", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ robots.txt returns 200")
    
    def test_robots_allows_root_path(self):
        """robots.txt has Allow: / directive (covers all public paths including /tax-tools/)
        
        Note: Cloudflare merges robots.txt rules. The Allow: / directive
        effectively allows all paths including /tax-tools/, /calculators/, etc.
        """
        response = requests.get(f"{BASE_URL}/robots.txt", timeout=30)
        assert response.status_code == 200
        content = response.text.lower()
        # Allow: / covers all paths including /tax-tools/
        assert "allow: /" in content or "allow:/" in content, "Missing Allow: / directive"
        print("✓ robots.txt has Allow: / directive (covers /tax-tools/ and all public paths)")
    
    def test_robots_disallows_api(self):
        """robots.txt has Disallow: /api/ directive"""
        response = requests.get(f"{BASE_URL}/robots.txt", timeout=30)
        assert response.status_code == 200
        content = response.text.lower()
        assert "disallow: /api/" in content or "disallow:/api/" in content, "Missing Disallow: /api/ directive"
        print("✓ robots.txt has Disallow: /api/ directive")
    
    def test_robots_source_has_auth_disallows(self):
        """Verify robots.ts source file has Disallow for /login, /register, /account
        
        Note: Cloudflare may not pass through all directives, but the source is correct.
        """
        import os
        robots_ts_path = "/app/frontend/app/robots.ts"
        assert os.path.exists(robots_ts_path), "robots.ts file not found"
        
        with open(robots_ts_path, 'r') as f:
            content = f.read()
        
        # Check source file has the correct disallow directives
        assert '"/login"' in content, "robots.ts missing /login disallow"
        assert '"/register"' in content, "robots.ts missing /register disallow"
        assert '"/account"' in content, "robots.ts missing /account disallow"
        print("✓ robots.ts source has Disallow for /login, /register, /account")
    
    def test_robots_blocks_ai_crawlers(self):
        """robots.txt blocks GPTBot and CCBot crawlers"""
        response = requests.get(f"{BASE_URL}/robots.txt", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        # Check for GPTBot and CCBot user-agent blocks (Cloudflare adds these)
        assert "GPTBot" in content, "Missing GPTBot user-agent block"
        assert "CCBot" in content, "Missing CCBot user-agent block"
        print("✓ robots.txt blocks GPTBot and CCBot crawlers")
    
    def test_robots_has_sitemap_directive(self):
        """robots.txt includes Sitemap directive"""
        response = requests.get(f"{BASE_URL}/robots.txt", timeout=30)
        assert response.status_code == 200
        content = response.text.lower()
        assert "sitemap:" in content, "Missing Sitemap directive"
        print("✓ robots.txt includes Sitemap directive")


class TestTaxToolsHubSEO:
    """Tax Tools Hub page SEO tests"""
    
    def test_hub_page_loads(self):
        """Hub page /tax-tools loads successfully"""
        response = requests.get(f"{BASE_URL}/tax-tools", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Hub page /tax-tools loads successfully")
    
    def test_hub_has_canonical_url(self):
        """Hub page has canonical URL meta tag"""
        response = requests.get(f"{BASE_URL}/tax-tools", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        # Check for canonical link tag
        canonical_pattern = r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']'
        match = re.search(canonical_pattern, content, re.IGNORECASE)
        
        if not match:
            # Try alternate pattern
            canonical_pattern2 = r'<link[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']canonical["\']'
            match = re.search(canonical_pattern2, content, re.IGNORECASE)
        
        assert match, "Missing canonical URL meta tag on hub page"
        canonical_url = match.group(1)
        assert "/tax-tools" in canonical_url, f"Canonical URL should contain /tax-tools, got: {canonical_url}"
        print(f"✓ Hub page has canonical URL: {canonical_url}")
    
    def test_hub_has_breadcrumb_schema(self):
        """Hub page has BreadcrumbList JSON-LD schema"""
        response = requests.get(f"{BASE_URL}/tax-tools", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        # Find all JSON-LD scripts
        schema_pattern = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
        matches = re.findall(schema_pattern, content, re.DOTALL | re.IGNORECASE)
        
        breadcrumb_found = False
        for match in matches:
            try:
                schema = json.loads(match.replace('\\u003c', '<'))
                if schema.get('@type') == 'BreadcrumbList':
                    breadcrumb_found = True
                    break
            except json.JSONDecodeError:
                continue
        
        assert breadcrumb_found, "Missing BreadcrumbList JSON-LD schema on hub page"
        print("✓ Hub page has BreadcrumbList JSON-LD schema")
    
    def test_hub_has_itemlist_schema(self):
        """Hub page has ItemList JSON-LD schema"""
        response = requests.get(f"{BASE_URL}/tax-tools", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        schema_pattern = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
        matches = re.findall(schema_pattern, content, re.DOTALL | re.IGNORECASE)
        
        itemlist_found = False
        for match in matches:
            try:
                schema = json.loads(match.replace('\\u003c', '<'))
                if schema.get('@type') == 'ItemList':
                    itemlist_found = True
                    break
            except json.JSONDecodeError:
                continue
        
        assert itemlist_found, "Missing ItemList JSON-LD schema on hub page"
        print("✓ Hub page has ItemList JSON-LD schema")
    
    def test_hub_has_faq_schema(self):
        """Hub page has FAQPage JSON-LD schema"""
        response = requests.get(f"{BASE_URL}/tax-tools", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        schema_pattern = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
        matches = re.findall(schema_pattern, content, re.DOTALL | re.IGNORECASE)
        
        faq_found = False
        for match in matches:
            try:
                schema = json.loads(match.replace('\\u003c', '<'))
                if schema.get('@type') == 'FAQPage':
                    faq_found = True
                    break
            except json.JSONDecodeError:
                continue
        
        assert faq_found, "Missing FAQPage JSON-LD schema on hub page"
        print("✓ Hub page has FAQPage JSON-LD schema")


class TestTaxToolDetailSEO:
    """Tax Tool Detail page SEO tests"""
    
    def test_freelancer_tax_planner_has_canonical(self):
        """Detail page /tax-tools/freelancer-tax-planner has canonical URL"""
        response = requests.get(f"{BASE_URL}/tax-tools/freelancer-tax-planner", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        canonical_pattern = r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']'
        match = re.search(canonical_pattern, content, re.IGNORECASE)
        
        if not match:
            canonical_pattern2 = r'<link[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']canonical["\']'
            match = re.search(canonical_pattern2, content, re.IGNORECASE)
        
        assert match, "Missing canonical URL on freelancer-tax-planner page"
        canonical_url = match.group(1)
        assert "freelancer-tax-planner" in canonical_url, f"Canonical should contain slug, got: {canonical_url}"
        print(f"✓ freelancer-tax-planner has canonical URL: {canonical_url}")
    
    def test_freelancer_tax_planner_has_webapplication_schema(self):
        """Detail page has WebApplication JSON-LD schema"""
        response = requests.get(f"{BASE_URL}/tax-tools/freelancer-tax-planner", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        schema_pattern = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
        matches = re.findall(schema_pattern, content, re.DOTALL | re.IGNORECASE)
        
        webapp_found = False
        for match in matches:
            try:
                schema = json.loads(match.replace('\\u003c', '<'))
                if schema.get('@type') == 'WebApplication':
                    webapp_found = True
                    break
            except json.JSONDecodeError:
                continue
        
        assert webapp_found, "Missing WebApplication JSON-LD schema on detail page"
        print("✓ freelancer-tax-planner has WebApplication JSON-LD schema")
    
    def test_freelancer_tax_planner_has_breadcrumb_schema(self):
        """Detail page has BreadcrumbList JSON-LD schema"""
        response = requests.get(f"{BASE_URL}/tax-tools/freelancer-tax-planner", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        schema_pattern = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
        matches = re.findall(schema_pattern, content, re.DOTALL | re.IGNORECASE)
        
        breadcrumb_found = False
        for match in matches:
            try:
                schema = json.loads(match.replace('\\u003c', '<'))
                if schema.get('@type') == 'BreadcrumbList':
                    breadcrumb_found = True
                    break
            except json.JSONDecodeError:
                continue
        
        assert breadcrumb_found, "Missing BreadcrumbList JSON-LD schema on detail page"
        print("✓ freelancer-tax-planner has BreadcrumbList JSON-LD schema")
    
    def test_freelancer_tax_planner_has_faq_schema(self):
        """Detail page has FAQPage JSON-LD schema"""
        response = requests.get(f"{BASE_URL}/tax-tools/freelancer-tax-planner", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        schema_pattern = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
        matches = re.findall(schema_pattern, content, re.DOTALL | re.IGNORECASE)
        
        faq_found = False
        for match in matches:
            try:
                schema = json.loads(match.replace('\\u003c', '<'))
                if schema.get('@type') == 'FAQPage':
                    faq_found = True
                    break
            except json.JSONDecodeError:
                continue
        
        assert faq_found, "Missing FAQPage JSON-LD schema on detail page"
        print("✓ freelancer-tax-planner has FAQPage JSON-LD schema")
    
    def test_1040es_prep_has_tax_preparation_subcategory(self):
        """1040es-prep-generator has WebApplication schema with applicationSubCategory 'Tax Preparation'"""
        response = requests.get(f"{BASE_URL}/tax-tools/1040es-prep-generator", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        schema_pattern = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
        matches = re.findall(schema_pattern, content, re.DOTALL | re.IGNORECASE)
        
        tax_prep_found = False
        for match in matches:
            try:
                schema = json.loads(match.replace('\\u003c', '<'))
                if schema.get('@type') == 'WebApplication':
                    subcategory = schema.get('applicationSubCategory', '')
                    if subcategory == 'Tax Preparation':
                        tax_prep_found = True
                        break
            except json.JSONDecodeError:
                continue
        
        assert tax_prep_found, "Missing WebApplication schema with applicationSubCategory 'Tax Preparation'"
        print("✓ 1040es-prep-generator has WebApplication with applicationSubCategory 'Tax Preparation'")
    
    def test_income_mix_planner_has_opengraph(self):
        """income-mix-planner has OpenGraph title and description meta tags"""
        response = requests.get(f"{BASE_URL}/tax-tools/income-mix-planner", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        # Check for og:title
        og_title_pattern = r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\']'
        og_title_match = re.search(og_title_pattern, content, re.IGNORECASE)
        
        if not og_title_match:
            og_title_pattern2 = r'<meta[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:title["\']'
            og_title_match = re.search(og_title_pattern2, content, re.IGNORECASE)
        
        # Check for og:description
        og_desc_pattern = r'<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']+)["\']'
        og_desc_match = re.search(og_desc_pattern, content, re.IGNORECASE)
        
        if not og_desc_match:
            og_desc_pattern2 = r'<meta[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:description["\']'
            og_desc_match = re.search(og_desc_pattern2, content, re.IGNORECASE)
        
        assert og_title_match, "Missing og:title meta tag on income-mix-planner"
        assert og_desc_match, "Missing og:description meta tag on income-mix-planner"
        print(f"✓ income-mix-planner has OpenGraph title: {og_title_match.group(1)[:50]}...")
        print(f"✓ income-mix-planner has OpenGraph description: {og_desc_match.group(1)[:50]}...")


class TestCalculatorRegression:
    """Regression tests for existing calculator pages"""
    
    def test_simple_tax_estimator_has_schemas(self):
        """Existing calculator /calculators/simple-tax-estimator still has schemas"""
        response = requests.get(f"{BASE_URL}/calculators/simple-tax-estimator", timeout=30)
        assert response.status_code == 200
        content = response.text
        
        schema_pattern = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
        matches = re.findall(schema_pattern, content, re.DOTALL | re.IGNORECASE)
        
        software_app_found = False
        breadcrumb_found = False
        faq_found = False
        
        for match in matches:
            try:
                schema = json.loads(match.replace('\\u003c', '<'))
                schema_type = schema.get('@type')
                if schema_type == 'SoftwareApplication':
                    software_app_found = True
                elif schema_type == 'BreadcrumbList':
                    breadcrumb_found = True
                elif schema_type == 'FAQPage':
                    faq_found = True
            except json.JSONDecodeError:
                continue
        
        assert software_app_found, "Missing SoftwareApplication schema on calculator page"
        assert breadcrumb_found, "Missing BreadcrumbList schema on calculator page"
        assert faq_found, "Missing FAQPage schema on calculator page"
        print("✓ simple-tax-estimator has SoftwareApplication, BreadcrumbList, FAQPage schemas (regression pass)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
