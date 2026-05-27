"""Tier definitions and feature limits per the RealProfits eSign Monetization Plan §9.1."""
import math
from typing import Literal, TypedDict

Tier = Literal["free", "pro", "business"]

INF = math.inf


class TierLimits(TypedDict):
    MAX_DOCS_PER_MONTH: float
    MAX_SIGNERS: int
    MAX_FILE_SIZE_MB: int
    MAX_PAGES: float
    MAX_TEMPLATES: float
    MAX_SAVED_CLIENTS: float
    MAX_TEAM_SEATS: int
    STORAGE_DAYS: float
    SHOW_BRANDING: bool
    API_ACCESS: bool
    BULK_SEND: bool
    WHITE_LABEL: bool


TIER_LIMITS: dict[str, TierLimits] = {
    "free": {
        "MAX_DOCS_PER_MONTH": 5,
        "MAX_SIGNERS": 5,
        "MAX_FILE_SIZE_MB": 10,
        "MAX_PAGES": 20,
        "MAX_TEMPLATES": 3,
        "MAX_SAVED_CLIENTS": 5,
        "MAX_TEAM_SEATS": 1,
        "STORAGE_DAYS": 90,
        "SHOW_BRANDING": True,
        "API_ACCESS": False,
        "BULK_SEND": False,
        "WHITE_LABEL": False,
    },
    "pro": {
        "MAX_DOCS_PER_MONTH": INF,
        "MAX_SIGNERS": 10,
        "MAX_FILE_SIZE_MB": 50,
        "MAX_PAGES": INF,
        "MAX_TEMPLATES": INF,
        "MAX_SAVED_CLIENTS": INF,
        "MAX_TEAM_SEATS": 1,
        "STORAGE_DAYS": 365,
        "SHOW_BRANDING": False,
        "API_ACCESS": False,
        "BULK_SEND": False,
        "WHITE_LABEL": False,
    },
    "business": {
        "MAX_DOCS_PER_MONTH": INF,
        "MAX_SIGNERS": 20,
        "MAX_FILE_SIZE_MB": 100,
        "MAX_PAGES": INF,
        "MAX_TEMPLATES": INF,
        "MAX_SAVED_CLIENTS": INF,
        "MAX_TEAM_SEATS": 5,
        "STORAGE_DAYS": INF,
        "SHOW_BRANDING": False,
        "API_ACCESS": True,
        "BULK_SEND": True,
        "WHITE_LABEL": True,
    },
}


# Public plan metadata for /api/billing/plans
PLANS = [
    {
        "id": "free",
        "name": "Free",
        "tagline": "Get started, forever free",
        "price_monthly": 0,
        "price_annual": 0,
        "features": [
            "5 documents per month",
            "Up to 5 signers per document",
            "10 MB PDF size · 20 pages max",
            "Audit trail PDF with QR code",
            "ESIGN, UETA, eIDAS compliant",
            "Powered by RealProfits footer",
        ],
        "cta": "Start free",
    },
    {
        "id": "pro",
        "name": "Pro",
        "tagline": "For freelancers & consultants",
        "price_monthly": 9,
        "price_annual": 79,
        "popular": True,
        "features": [
            "Unlimited documents",
            "Up to 10 signers per document",
            "50 MB PDF · unlimited pages",
            "Remove RealProfits branding",
            "Custom footer text",
            "1-year document storage",
            "3 automatic reminders + custom",
        ],
        "cta": "Upgrade to Pro",
    },
    {
        "id": "business",
        "name": "Business",
        "tagline": "For agencies & small teams",
        "price_monthly": 29,
        "price_annual": 249,
        "features": [
            "Everything in Pro",
            "Up to 20 signers per document",
            "100 MB PDF size",
            "5 team seats",
            "Bulk send",
            "REST API + webhooks",
            "White-label signing page",
            "Forever storage",
        ],
        "cta": "Contact sales",
    },
]
