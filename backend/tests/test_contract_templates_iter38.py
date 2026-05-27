"""Iter 38 — Phase 3 pSEO: contract templates (631 SSG pages).

Coverage:
- Backend regression: /api/health, /api/billing/plans, /api/auth/login (cookie-based).
- /contract-template hub: 30 types + 20 industries links.
- /contract-template/[type] sub-hubs (NDA): industry picker grid, CTA to esign with from=contract&type=.
- /contract-template/[type]/[industry] leaves: industry-specific considerations, FAQ schema, base template
  substitution of {INDUSTRY}, type-specific traits flowing to FAQ.
- 404 for invalid type and invalid industry.
- /tools/esign/new?from=contract banner.
- Title sanity: NO duplicated "| RealProfits | RealProfits".
- /sitemap.xml has sitemap-contract-templates.xml.
- /sitemap-contract-templates.xml has 630 url entries.
- Content differentiation between two leaves of the same type for different industries.
"""
import os
import re
import requests

BASE_URL = (
    os.environ.get("REACT_APP_BACKEND_URL")
    or os.environ.get("NEXT_PUBLIC_BACKEND_URL")
    or "https://26946d75-b144-4788-8ed6-b7fc8b535d7c.preview.emergentagent.com"
).rstrip("/")

ADMIN_EMAIL = "admin@realprofits.com"
ADMIN_PASSWORD = "RealProfits2026!"


def _get(path: str) -> requests.Response:
    return requests.get(f"{BASE_URL}{path}", timeout=30, allow_redirects=True)


# ---------- Backend regression ----------
class TestBackendSmoke:
    def test_health(self):
        r = _get("/api/health")
        assert r.status_code == 200, r.text

    def test_billing_plans(self):
        r = _get("/api/billing/plans")
        assert r.status_code == 200, r.text
        text = r.text.lower()
        for tier in ("free", "pro", "business"):
            assert tier in text, f"missing tier {tier}"

    def test_auth_login_admin(self):
        r = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        token = data.get("access_token") or data.get("token") or data.get("accessToken")
        cookie_set = any(
            "access_token" in c.name or "session" in c.name.lower() or "auth" in c.name.lower()
            for c in r.cookies
        )
        assert token or cookie_set or data.get("email") == ADMIN_EMAIL


# ---------- Top hub ----------
class TestContractTemplateHub:
    def test_hub_renders(self):
        r = _get("/contract-template")
        assert r.status_code == 200
        html = r.text
        # 30 contract types: spot-check a few
        for t in ("Non-Disclosure", "Service Agreement", "Independent Contractor", "Coaching"):
            assert t in html, f"missing {t}"
        # Link to type hub and to leaf
        assert "/contract-template/nda" in html
        # Industry tiles (real 20-industry list)
        for ind in ("Photographers", "Web Developers", "Personal Trainers", "Contractors",
                    "Graphic Designers", "Freelancers"):
            assert ind in html, f"missing industry {ind}"

    def test_hub_title_no_duplicate_realprofits(self):
        r = _get("/contract-template")
        html = r.text
        m = re.search(r"<title[^>]*>([^<]+)</title>", html)
        assert m, "no <title>"
        title = m.group(1)
        # Must contain exactly one "| RealProfits"
        assert title.count("| RealProfits") == 1, f"bad title: {title!r}"


# ---------- Type sub-hub ----------
class TestNdaSubHub:
    def test_nda_subhub_renders(self):
        r = _get("/contract-template/nda")
        assert r.status_code == 200
        html = r.text
        # H1 should include the contract type
        assert "Non-Disclosure Agreement" in html
        # Industry picker with the 20 industries — spot-check several real ones
        for ind in (
            "Photographers", "Web Developers", "Personal Trainers", "Contractors",
            "Consultants", "Freelancers", "Graphic Designers", "Agencies",
        ):
            assert ind in html, f"missing industry {ind} in NDA sub-hub"
        # Link to each leaf
        assert "/contract-template/nda/photographers" in html
        assert "/contract-template/nda/freelancers" in html
        # Edit & sign online CTA pointing to esign with from=contract&type=nda
        assert "/tools/esign/new?from=contract&amp;type=nda" in html or \
               "/tools/esign/new?from=contract&type=nda" in html, \
               "missing esign CTA with from=contract&type=nda"

    def test_nda_subhub_title_no_dupe(self):
        r = _get("/contract-template/nda")
        m = re.search(r"<title[^>]*>([^<]+)</title>", r.text)
        assert m
        assert m.group(1).count("| RealProfits") == 1, m.group(1)


# ---------- Leaf pages ----------
class TestLeafPages:
    def test_nda_photographers(self):
        r = _get("/contract-template/nda/photographers")
        assert r.status_code == 200
        html = r.text
        # H1 expectation
        assert "Free Non-Disclosure Agreement Template for Photographers" in html or \
               "Non-Disclosure Agreement Template for Photographers" in html, \
               "missing H1 text"
        # {INDUSTRY} substitution -> "photographers" (case-insensitive search)
        assert "photographers" in html.lower()
        # No unsubstituted placeholder
        assert "{INDUSTRY}" not in html, "unsubstituted {INDUSTRY} placeholder leaked into HTML"
        # Industry considerations
        assert "Print release" in html or "print release" in html.lower()
        # Force majeure could appear under industry considerations
        assert "force majeure" in html.lower() or "Force majeure" in html
        # FAQ schema (JSON-LD FAQPage)
        assert "FAQPage" in html, "missing FAQPage JSON-LD"

    def test_nda_photographers_title_no_dupe(self):
        r = _get("/contract-template/nda/photographers")
        m = re.search(r"<title[^>]*>([^<]+)</title>", r.text)
        assert m
        title = m.group(1)
        assert title.count("| RealProfits") == 1, title

    def test_service_agreement_web_developers(self):
        r = _get("/contract-template/service-agreement/web-developers")
        assert r.status_code == 200
        html = r.text
        assert "Source code ownership" in html or "source code ownership" in html.lower()
        assert "Third-party plugin" in html or "third-party plugin" in html.lower() or "third party plugin" in html.lower()
        # CTA href has from=contract&type=service-agreement&industry=web-developers
        cta = "from=contract&amp;type=service-agreement&amp;industry=web-developers"
        cta_unencoded = "from=contract&type=service-agreement&industry=web-developers"
        assert cta in html or cta_unencoded in html, "esign CTA query missing on leaf"

    def test_independent_contractor_contractors(self):
        r = _get("/contract-template/independent-contractor-agreement/contractors")
        assert r.status_code == 200
        html = r.text.lower()
        # Workers' comp considerations
        assert "workers' comp" in html or "workers comp" in html or "worker's comp" in html
        # Liability stakes phrasing flowing from traits (high-risk, trades, regulated)
        assert "liability stakes are high" in html, \
            "FAQ wording from high-risk/trades/regulated traits missing"

    def test_coaching_personal_trainers(self):
        r = _get("/contract-template/coaching-agreement/personal-trainers")
        assert r.status_code == 200
        html = r.text
        assert "Liability waiver" in html or "liability waiver" in r.text.lower()
        assert "PAR-Q" in html, "PAR-Q consideration missing for personal-trainers"

    def test_invalid_type_404(self):
        r = _get("/contract-template/not-a-real-type")
        assert r.status_code == 404, f"expected 404, got {r.status_code}"

    def test_invalid_industry_under_type_404(self):
        r = _get("/contract-template/nda/not-real-industry")
        assert r.status_code == 404, f"expected 404, got {r.status_code}"


# ---------- Content differentiation ----------
class TestContentDifferentiation:
    def _extract_considerations(self, html: str) -> str:
        # Best-effort: lowercase, strip tags, only inspect a window after the word "considerations"
        text = re.sub(r"<[^>]+>", " ", html).lower()
        idx = text.find("consideration")
        return text[idx: idx + 4000] if idx != -1 else text[:4000]

    def test_nda_photographers_vs_web_developers_differ(self):
        r1 = _get("/contract-template/nda/photographers")
        r2 = _get("/contract-template/nda/web-developers")
        assert r1.status_code == 200 and r2.status_code == 200
        a = self._extract_considerations(r1.text)
        b = self._extract_considerations(r2.text)
        # Specific bullets that should only appear in one
        assert "print release" in a, "photographers page missing 'print release'"
        assert "source code" in b, "web-developers page missing 'source code'"
        assert "print release" not in b, "web-developers should NOT have 'print release'"
        # Pages should not be byte-identical apart from type
        assert a != b, "considerations content identical between photographers and web-developers"


# ---------- eSign banner ----------
class TestEsignContractBanner:
    def test_page_loads_with_contract_query(self):
        """Banner is client-rendered (Suspense + useSearchParams). SSR only ships a fallback
        placeholder; full banner content is verified via Playwright separately. Here we just
        ensure the page does not 500 with the contract query string."""
        r = _get("/tools/esign/new?from=contract&type=nda&industry=photographers")
        assert r.status_code == 200

    def test_banner_absent_without_query(self):
        r = _get("/tools/esign/new")
        assert r.status_code == 200
        html = r.text
        # No personalised banner copy should ship on initial HTML when no params
        assert "Using our Non-Disclosure Agreement template" not in html
        assert "View the template again" not in html


# ---------- Sitemaps ----------
class TestSitemaps:
    def test_index_includes_contract_templates(self):
        r = _get("/sitemap.xml")
        assert r.status_code == 200
        xml = r.text
        assert "sitemap-contract-templates.xml" in xml, "sub-sitemap not listed in index"
        # Count sitemap entries — expect at least 7 sub-sitemaps
        count = len(re.findall(r"<sitemap>", xml))
        assert count >= 7, f"expected >=7 sub-sitemaps, got {count}"

    def test_contract_templates_sub_sitemap_count(self):
        r = _get("/sitemap-contract-templates.xml")
        assert r.status_code == 200
        xml = r.text
        url_count = len(re.findall(r"<url>", xml))
        # 30 type hubs + 600 leaves = 630
        assert url_count == 630, f"expected 630 <url> entries, got {url_count}"
        # Spot-check entries
        assert "/contract-template/nda/photographers" in xml
        assert "/contract-template/service-agreement/web-developers" in xml


if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v", "--tb=short"])
