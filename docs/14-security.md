# 14 — Security Review

> Honest threat-modelling pass over the current code. Not exhaustive — every
> bullet should be triaged before opening RealProfits to paying customers.

## 14.1 Risks (Identified & Ranked)

### 🔴 P0 — must fix before scaling

| # | Risk                                          | Where                                          | Fix |
|---|-----------------------------------------------|------------------------------------------------|-----|
| 1 | Shared `JWT_SECRET` for auth **and** eSign tokens | `auth.py`, `esign/tokens.py`               | Use two different keys (`JWT_SECRET_AUTH`, `JWT_SECRET_ESIGN`). A leaked auth secret currently also lets attackers mint signing tokens. |
| 2 | No CSRF protection beyond SameSite=Lax        | All cookie-authenticated routes                | Add a CSRF double-submit token for mutating routes if/when SameSite=Lax is loosened, or accept the cross-origin risk consciously. |
| 3 | eSign signing tokens default to 30-day expiry | `tokens.create_signing_token`                  | Make expiry per-document (mirror `documents.expires_at`) and reject signing if doc voided/expired. (Some of this exists; verify the check is on the **decode** path, not just on the email send path.) |
| 4 | No rate limit on `POST /api/auth/register` or password reset | `auth.py`                       | Add a simple per-IP rate limit (e.g. `slowapi`) — currently lockouts only cover login. |

### 🟠 P1 — should fix soon

| # | Risk                                          | Where                                          | Fix |
|---|-----------------------------------------------|------------------------------------------------|-----|
| 5 | File uploads stored on local disk; no antivirus | `uploads/esign/`, `uploads/invoice_attachments/` | Scan with ClamAV or push to S3 + Lambda scanner; serve via signed URLs. |
| 6 | No PII redaction on backend logs              | `email_service._send`, `invoices.py`           | Redact full emails in logs (mask middle).      |
| 7 | Stripe test/live key mix                      | `.env` (no separate `.env.test` / `.env.prod`) | Use distinct env files; CI enforces `STRIPE_API_KEY` prefix matches expected environment.|
| 8 | `Base.metadata.create_all()` at startup       | `esign/database.py`                            | Replace with Alembic migrations — `create_all` won't alter existing columns. Already a tech-debt item. |
| 9 | No password complexity requirement            | `auth.py` register                             | Enforce min 10 chars, 1 number, 1 symbol (Pydantic validator).|
| 10 | Public verification page exposes all signer names + masked emails | `/api/esign/verify/{doc_id}` | Consider gating verification with an OTP (audit page already has a QR — fine to require entering a code printed near the QR). |

### 🟡 P2 — risk-aware enhancements

| # | Risk                                          | Where                                          | Fix |
|---|-----------------------------------------------|------------------------------------------------|-----|
| 11 | No 2FA option                                 | Auth module                                    | Optional TOTP for owners; required for `business` tier. |
| 12 | Resume uploads parsed without isolation       | `career-tools/resume-parser`                   | Run parser in a worker / process sandbox.       |
| 13 | Inline AI prompts include user-supplied text  | `career-tools` / `tax-tools`                   | Add prompt-injection guard tokens; never echo back model output directly into HTML without escape.|
| 14 | No HSTS / CSP enforced                        | Nginx config                                   | Add `Strict-Transport-Security` and a tight CSP. |
| 15 | Long-lived refresh tokens (7d) without rotation | `auth.py refresh`                            | Rotate refresh tokens on each use (issue new refresh on `/refresh`). |

## 14.2 Hardcoded Secrets Check

```bash
grep -rEn "sk_test|sk_live|whsec_|AKIA|BEGIN PRIVATE" /app --include='*.{py,ts,tsx,js,jsx}' | grep -v node_modules
```

Today this returns nothing in source — all secrets are in `.env`. If you
ever see a hit, rotate immediately.

## 14.3 Missing Validations (Inventory)

| Surface                                  | Missing validation                              |
|------------------------------------------|--------------------------------------------------|
| Resume draft `POST /api/career-tools/resume-draft` | No size cap on the JSON payload      |
| Invoice attachments                      | MIME sniff: currently trusts `Content-Type` header — add magic-byte check |
| eSign field placement                    | `x, y, width, height ∈ [0, 1]` not enforced server-side (frontend clips, but a hostile API caller could bypass) |
| Stripe webhook                           | Tolerance window not configured — defaults to Stripe SDK default 300s. OK but make explicit. |
| Password reset                           | No re-use check: an old `password_hash` can be set again |

## 14.4 Vulnerable Dependencies

Run periodically:
```bash
# Frontend
cd frontend && yarn audit --groups=dependencies
# Backend
pip-audit -r backend/requirements.txt
```

Common findings on this stack:
- `next` minor bumps may include security fixes — stay within 16.x latest patch.
- `pypdf` has historically had ReDoS issues — pin to the latest.

## 14.5 Recommended Quick Wins

1. **Split JWT secrets** (P0 #1) — 30 min change.
2. **Add `helmet`-style headers** in Nginx (P2 #14):
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   add_header X-Content-Type-Options nosniff;
   add_header X-Frame-Options DENY;
   add_header Referrer-Policy strict-origin-when-cross-origin;
   ```
3. **Magic-byte sniff** invoice attachments (P1 #5 partial) — uses `python-magic` or a small lookup table.
4. **Rotate refresh tokens** on each `/refresh` (P2 #15) — 20-line change.
5. **Wire `slowapi`** for `register` + `forgot-password` (P0 #4):
   ```python
   from slowapi import Limiter
   limiter = Limiter(key_func=get_remote_address, default_limits=["20/hour"])
   ```
