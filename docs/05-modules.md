# 05 — Module Documentation

Each subsection follows: **Purpose → Business logic → Dependencies → Inputs →
Outputs → Related APIs → DB interactions**.

---

## 5.1 Authentication Module — `backend/auth.py`

- **Purpose**: register users, log them in/out, refresh tokens, password reset.
- **Business logic**:
  - Bcrypt hashing (cost 12); never returns the hash.
  - **Brute-force lockout**: after 5 failed attempts for `<ip>:<email>`, lock for 15 min (HTTP 429).
  - **Cookie tokens**: 15-minute access JWT + 7-day refresh JWT, both HttpOnly, Secure, SameSite=Lax.
  - On the **first registration ever**, the user becomes the seeded admin only if their email matches `ADMIN_EMAIL`.
- **Dependencies**: `bcrypt`, `pyjwt`, `motor`, `email-validator`.
- **Inputs**: email + password (plus name on register).
- **Outputs**: user JSON `{id, email, name, role, created_at}` + cookies.
- **APIs**: `/api/auth/register`, `/login`, `/logout`, `/me`, `/refresh`, `/forgot-password`, `/reset-password`.
- **DB**: `users`, `login_attempts`, `password_reset_tokens`.

## 5.2 User-Data Module — `backend/user_data.py`

- **Purpose**: cross-device persistence of per-tool state that previously lived only in localStorage.
- **Business logic**: namespaced by `user_id + tool_key`. PUT is upsert; DELETE removes. `POST /bulk` accepts a list of `{tool_key, data}` for one-shot sync on login.
- **APIs**: `/api/user-data`, `/api/user-data/{tool_key}` (GET/PUT/DELETE), `/api/user-data/bulk`.
- **DB**: `user_data` (unique on `user_id+tool_key`).

## 5.3 Invoice Module — `backend/invoices.py`

- **Purpose**: full invoice lifecycle for the in-app Invoice Generator.
- **Business logic**:
  - CRUD with totals recomputed server-side from items.
  - **Status auto-transitions**: paid total ≥ total → `paid`; partial → `partial`; due_date past + not paid → `overdue` (daily cron).
  - **Resend integration**: HTML email with logo, items table, totals, Pay button. CC/BCC supported. Attachments included up to 10 MB.
  - **Public share token**: idempotent — first call to `/share` mints; subsequent calls return same URL.
  - **QR on PDF**: every downloaded PDF points to the public portal.
- **Dependencies**: Resend, `qrcode`, `jspdf` (frontend) / WeasyPrint not used.
- **Inputs**: invoice JSON, attachments (multipart), payment amounts.
- **Outputs**: invoice JSON / PDF / public HTML.
- **APIs**: see [`06 API §3`](./06-api.md#3-invoices).
- **DB**: `invoices`, `invoice_clients`, `invoice_settings`, `invoice_email_logs`. Disk: `uploads/invoice_attachments/<invoice_id>/*`.

## 5.4 eSign Module — `backend/esign/`

- **Purpose**: free DocuSign-class signing flow with audit trail.
- **Business logic**:
  - Owner uploads PDF (max 25 MB free; tier-gated to 50/100 for Pro/Business). Magic-byte PDF validation.
  - Owner adds **signers** (1–5/10/20 by tier) with roles `signer / approver / cc / witness`. Order is `sequential` or `parallel`.
  - Owner places **fields** by clicking on rendered PDF (PDF.js). Coords are fractional (0–1).
  - `/documents/{id}/send` mints a per-signer JWT, hashes it (SHA-256) to `signers.token_hash`, sets `status=sent`, and emails each notified signer (parallel: all; sequential: just first). **Email subject + CTA are role-aware** (see `email_service.send_signature_request`).
  - Public `/sign/{token}`: decode JWT → match `token_hash` → return `SignerPublicView` (fields owned by signer + `other_filled_fields` already signed by previous signers + `signers[]` summary for the progress strip).
  - `/submit`: validate consent + required fields, flag `signer.status=signed`, advance sequential chain or finalize if everyone is done.
  - **Finalize** = stamp signatures onto every page → append **branded audit page** (with chronological activity timeline) → SHA-256 the result → save → email everyone with signed PDF + audit PDF.
- **Dependencies**: SQLAlchemy 2 async, asyncpg, `pypdf`, `reportlab`, Pillow, qrcode, pyjwt, Resend.
- **APIs**: see [`06 API §5`](./06-api.md#5-esign).
- **DB**: Postgres tables `documents`, `signers`, `signature_fields`, `audit_events`. Disk: `uploads/esign/<doc_id>.pdf` + `..._signed.pdf`.

### Sub-module: `pdf_processor.py`

- `parse_pdf(bytes)` → page sizes, page count.
- `merge_signatures(pdf, fields_by_page, uuid_enabled, brand_enabled)` → stamped PDF.
- `build_audit_page(doc, signers, hash, verify_url, audit_events=...)` → branded audit PDF (Signers table + role-aware status + **Activity timeline** + QR + legal footer).
- `append_audit_page(merged, audit)` → final concatenated PDF.

### Sub-module: `email_service.py`

Role-aware Resend templates:

| Role        | Subject verb                       | CTA                          |
|-------------|------------------------------------|------------------------------|
| signer      | "requested your signature on …"    | Review & Sign Document       |
| witness     | "asked you to witness …"           | Review & Witness Document    |
| approver    | "asked for your approval on …"     | Review & Approve Document    |
| cc          | "shared a document with you"       | Open Document                |

Other templates: `send_completion`, `send_voided`, `send_declined`.

### Sub-module: `tokens.py`

- `create_signing_token(sid, did, email, expires_at)` — HS256 JWT.
- `decode_signing_token(token)` — strict expiry/signature checks.
- `hash_token(token)` — SHA-256 hex; stored in `signers.token_hash` for one-shot revocation.

## 5.5 Billing Module — `backend/billing/`

- **Purpose**: Stripe-backed subscription tiers gating eSign limits.
- **Business logic**:
  - 3 tiers: `free / pro / business` (see `tiers.py`).
  - `/checkout` creates a Stripe Checkout Session for `(plan, interval)`.
  - `/portal` returns a Stripe Billing Portal URL.
  - `/webhook` is idempotent via `subscription_events.stripe_event_id UNIQUE`.
  - `assert_can_create_doc / assert_can_set_signers` are called inside eSign routes to enforce tier caps.
- **Tier caps** (see `tiers.py`):
  - Docs/month: 5 · ∞ · ∞
  - Max signers/doc: 5 · 10 · 20
  - Max file size: 10 MB · 50 MB · 100 MB
  - Max pages: 20 · ∞ · ∞
  - Show "Powered by" branding: true · false · false
- **APIs**: see [`06 API §6`](./06-api.md#6-billing).
- **DB**: `subscriptions`, `subscription_events`.

### Sub-module: `saved_signature.py`

- Per-user reusable signature stored as base64 PNG. Used by the public signing page to offer 1-click "Apply saved signature".
- APIs: `GET/PUT/DELETE /api/esign/signature`.

## 5.6 Career Tools Module — `backend/server.py` (inline)

- **Purpose**: AI-powered resume helpers + email writer.
- **Endpoints**: `/improve-bullet`, `/improve-summary`, `/generate-summaries`, `/suggest-skills`, `/ats-check`, `/resume-draft`, `/email-template`, `/email-templates`.
- **Business logic**: All call Gemini (or GPT-4o-mini fallback) via the Emergent LLM Key. ATS results are cached in `ats_checks` (1-hour TTL by `created_at`).
- **DB**: `resume_drafts`, `ats_checks`.

## 5.7 Tax Tools Module — `backend/server.py` (inline) + `frontend/src/components/tax-tools/`

- **Purpose**: educational tax prep tools + 1-free-use AI insights.
- **Compliance**: PREP ONLY badges; PDF footers say "Not for IRS submission".
- **AI**: `POST /api/tax-tools/explain` — informational only, never used for calculations.
- **Frontend tools**: 12 (Freelancer Tax Planner, Income Mix, Tax Checklist, 1040-ES, Schedule C Prep, Tax Summary PDF, W-2/1099 Organizer, Year-End Packet, plus 4 linked calculators).

## 5.8 Analytics Module — `backend/analytics.py`

- **Purpose**: A/B and conversion event ingestion.
- **Endpoints**: `POST /api/analytics/event` (public), `GET /api/analytics/summary/{experiment}` (admin-only).
- **DB**: `ab_events`.

## 5.9 Scheduler Module — `backend/scheduler_jobs.py`

In-process APScheduler (no Celery / Redis required).

| Job                         | Cron                  | What it does                                      |
|-----------------------------|-----------------------|---------------------------------------------------|
| `reminder_job`              | hourly at :15         | E1 re-email to pending signers at days 3/7/14 (per-doc configurable) |
| `expire_documents_job`      | daily 00:01 UTC       | `status=expired` for docs past `expires_at`; notify |
| `mark_invoices_overdue_job` | daily 00:30 UTC       | Mongo invoices with `due_date < today` and `status=sent` → `overdue` |
| `send_invoice_reminders_job`| daily 09:00 UTC       | Resend reminder email for overdue invoices (≥7-day cooldown) |
| `reset_counters_job`        | monthly day 1 00:05 UTC | Zero `subscriptions.docs_used_this_month` across all rows |

## 5.10 pSEO Module — Frontend only

- **Purpose**: 2,400+ SSG pages for organic discovery.
- **Implementation**:
  - Static datasets in `frontend/src/data/pseo/*.ts` (jobs, cities, professions, contracts, industries).
  - Variation engines (`resumeVariationEngine.ts`, `variationEngine.ts`, `costTier.ts`) produce unique copy per page.
  - Route folders use `generateStaticParams` to enumerate all combinations.
  - **7 sitemaps** referenced from a sitemap index (see `frontend/src/lib/sitemap-data.ts`).
  - Post-build script pings IndexNow (Bing/Yandex) + Google ping.

## 5.11 Frontend Auth Module — `frontend/src/contexts/AuthContext.tsx`

- **Purpose**: single React Context for `user`, `loading`, `login`, `register`, `logout`.
- **Key feature**: global `window` event `"auth:expired"` dispatched by the eSign and Invoice API clients on any 401 → redirects to `/login?redirect=<currentPath>`.

## 5.12 Frontend eSign Components — `frontend/src/components/esign/`

| Component             | Role                                                       |
|-----------------------|------------------------------------------------------------|
| `EsignLanding.tsx`    | Marketing landing                                          |
| `EsignDashboard.tsx`  | Auth-only document list + filters (All/Draft/Sent/In Progress/Completed) + Home link |
| `EsignWizard.tsx`     | 5-step wizard; accepts `initialDoc` prop to support draft editing; HTML5 drag-and-drop signer reorder |
| `FieldPlacer.tsx`     | Click-to-place fields on rendered PDF (sticky sidebar)     |
| `PdfRenderer.tsx`     | PDF.js wrapper — self-hosted worker                        |
| `SigningPage.tsx`     | Public signing page — read-only overlays for previous signers + sticky Finish-signing card + signing progress strip |
| `SignatureCreator.tsx`| Draw / type / upload signature                             |
| `VerifySearchLanding.tsx` | Public verification by ID                              |
| `api.ts`              | Type-safe REST client; dispatches `"auth:expired"` on 401 |
