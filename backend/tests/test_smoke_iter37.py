"""Iter 37 smoke tests + pSEO salary page tests.

Backend regression: health, billing plans, auth login.
Frontend SSG: /salary hub, job hub, leaf, city hub, invalid -> 404, sitemap.
"""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or "https://26946d75-b144-4788-8ed6-b7fc8b535d7c.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")

ADMIN_EMAIL = "admin@realprofits.com"
ADMIN_PASSWORD = "RealProfits2026!"


# ---------- Backend regression ----------
class TestBackendSmoke:
    def test_health(self):
        r = requests.get(f"{BASE_URL}/api/health", timeout=20)
        assert r.status_code == 200, r.text

    def test_billing_plans(self):
        r = requests.get(f"{BASE_URL}/api/billing/plans", timeout=20)
        assert r.status_code == 200, r.text
        body = r.json()
        # Accept either list or {plans: [...]} shape
        plans = body if isinstance(body, list) else body.get("plans") or body.get("data") or []
        text = str(plans).lower()
        for tier in ("free", "pro", "business"):
            assert tier in text, f"missing tier {tier} in {text[:200]}"

    def test_auth_login_admin(self):
        r = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        # Auth uses httpOnly cookies — verify either cookie set OR token in body
        token = data.get("access_token") or data.get("token") or data.get("accessToken")
        cookie_set = any(
            "access_token" in c.name or "session" in c.name.lower() or "auth" in c.name.lower()
            for c in r.cookies
        )
        assert token or cookie_set or data.get("email") == ADMIN_EMAIL, (
            f"login succeeded but no auth token/cookie/user data: {data} cookies={r.cookies.keys()}"
        )


# ---------- Frontend SSG page tests ----------
class TestSalaryPages:
    def _get(self, path):
        return requests.get(f"{BASE_URL}{path}", timeout=30, allow_redirects=True)

    def test_salary_top_hub(self):
        r = self._get("/salary")
        assert r.status_code == 200
        html = r.text
        assert "Software Engineer" in html
        assert "/salary/software-engineer" in html
        # New York city tile linking to /salary/in/new-york-ny
        assert "/salary/in/new-york-ny" in html
        assert "New York" in html
        assert "Browse by job title" in html
        assert "Browse by city" in html

    def test_job_hub_software_engineer(self):
        r = self._get("/salary/software-engineer")
        assert r.status_code == 200
        html = r.text
        assert "Software Engineer" in html
        # Cities table should link to each city leaf
        assert "/salary/software-engineer/new-york-ny" in html
        assert "/salary/software-engineer/san-francisco-ca" in html
        # San Francisco should appear before NY (sorted DESC by median)
        sf_idx = html.find("San Francisco")
        ny_idx = html.find("New York")
        assert sf_idx != -1 and ny_idx != -1
        assert sf_idx < ny_idx, f"SF should come before NY (sf={sf_idx}, ny={ny_idx})"
        # FAQ + calculator CTA
        assert "FAQ" in html
        assert "/career-tools/am-i-underpaid" in html or "paycheck-calculator" in html

    def test_leaf_software_engineer_ny(self):
        r = self._get("/salary/software-engineer/new-york-ny")
        assert r.status_code == 200
        html = r.text
        assert "New York" in html
        # ~$169,300 median expected
        assert "$169,300" in html or "169,300" in html, "median figure missing"
        # Sections
        assert "experience level" in html.lower()
        assert "How " in html and "compares" in html  # comparison bars heading
        assert "5-year salary trend" in html
        assert "Related job" in html or "related job" in html.lower()
        assert "FAQ" in html
        # JSON-LD schemas present
        assert "FAQPage" in html
        assert "BreadcrumbList" in html

    def test_leaf_rn_la_healthcare_related(self):
        r = self._get("/salary/registered-nurse/los-angeles-ca")
        assert r.status_code == 200
        html = r.text
        # Healthcare-category related jobs
        assert ("Dentist" in html) or ("Pharmacist" in html), "expected healthcare related jobs"

    def test_city_hub_austin(self):
        r = self._get("/salary/in/austin-tx")
        assert r.status_code == 200
        html = r.text
        assert "Austin" in html
        assert "Average salaries in Austin" in html
        assert "Similar cities" in html
        assert "state=texas" in html  # paycheck CTA query

    def test_city_hub_ny_state_tax_faq(self):
        r = self._get("/salary/in/new-york-ny")
        assert r.status_code == 200
        html = r.text
        # New York is not "no state income tax" — should mention state income tax
        assert "state income tax" in html.lower()

    def test_invalid_job_returns_404(self):
        r = self._get("/salary/not-a-real-job")
        assert r.status_code == 404, f"expected 404, got {r.status_code}"

    def test_invalid_city_under_job_returns_404(self):
        r = self._get("/salary/software-engineer/not-a-real-city")
        assert r.status_code == 404, f"expected 404, got {r.status_code}"

    def test_invoice_template_hub_regression(self):
        r = self._get("/invoice-template")
        assert r.status_code == 200
        # 250 templates — just spot-check a known link exists
        assert "/invoice-template/" in r.text

    def test_invoice_template_photographer_regression(self):
        r = self._get("/invoice-template/photographer")
        assert r.status_code == 200
        assert "photographer" in r.text.lower() or "Photographer" in r.text

    def test_sitemap_contains_pseo_urls(self):
        r = self._get("/sitemap.xml")
        assert r.status_code == 200
        xml = r.text
        for needle in (
            "/salary",
            "/salary/software-engineer",
            "/salary/software-engineer/new-york-ny",
            "/salary/in/austin-tx",
            "/invoice-template/photographer",
        ):
            assert needle in xml, f"sitemap missing {needle}"
        # Count loc entries
        url_count = len(re.findall(r"<loc>", xml))
        assert url_count > 1800, f"expected >1800 URLs, got {url_count}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
