# 03 — Project Structure

A folder-by-folder walk-through. Every meaningful directory is listed with
purpose, responsibilities, and the most important files inside it.

## Root (`/app`)

| Path                       | Purpose                                                              |
|----------------------------|----------------------------------------------------------------------|
| `frontend/`                | Next.js 16 app                                                       |
| `backend/`                 | FastAPI app                                                          |
| `docs/`                    | These developer docs                                                 |
| `memory/`                  | Long-lived agent state: PRD, test credentials                        |
| `test_reports/`            | Per-iteration JSON QA reports (most recent = source of truth)        |
| `scripts/`                 | Repo-level helper scripts                                            |
| `lib/`                     | Pure JS/TS libs reused across (rarely used; most lib lives under `frontend/src/lib`) |
| `artifacts/`, `attached_assets/` | Files dropped by users during the build flow              |
| `DEPLOYMENT_GUIDE.md`      | Production-server (Hetzner) install runbook                          |
| `deploy.sh`                | One-shot remote-host deploy: `git pull && yarn install && yarn build && pm2 reload && systemctl restart backend` |
| `design_guidelines.json`   | UI tokens (colors, type ramp)                                        |
| `package.json`, `pnpm-*`, `tsconfig*.json` | Root workspace configs (Next.js is in `frontend/`)   |
| `replit.md`                | Legacy hosting notes (unused; ignore)                                |

## Frontend (`/app/frontend`)

```
frontend/
├── app/                    # Next.js App Router (every directory = route segment)
├── src/
│   ├── components/         # UI building blocks
│   ├── contexts/           # AuthContext, Toast, etc.
│   ├── data/               # Static datasets (pSEO)
│   ├── hooks/              # Custom hooks
│   └── lib/                # Pure logic (formatters, PDF brand, sitemap, storage)
├── public/                 # Static assets, PDF.js worker, robots, favicon
├── scripts/                # Build hooks (post-build IndexNow ping)
├── .env                    # PROTECTED — only NEXT_PUBLIC_BACKEND_URL
├── next.config.ts
├── package.json            # `yarn build` runs prebuild (copy worker) + next build + postbuild (ping)
└── tsconfig.json
```

### `frontend/app` (App Router pages)

Each top-level directory is a route segment. `page.tsx` = HTML; `layout.tsx` =
wrapper.

| Segment                                | Purpose                                            |
|----------------------------------------|----------------------------------------------------|
| `layout.tsx`, `globals.css`            | Root layout + Tailwind v4 entry                    |
| `login/`, `register/`, `forgot-password/` | Auth UI                                         |
| `account/`, `account/billing/`         | User profile + Stripe portal                       |
| `pricing/`                             | Plan picker (Free / Pro / Business)                |
| `tools/`                               | Tools hub                                          |
| `tools/invoice/`                       | Invoice Generator app                              |
| `tools/esign/`                         | eSign — landing                                    |
| `tools/esign/dashboard/`               | eSign — auth-only document list                    |
| `tools/esign/new/`                     | eSign — 5-step wizard                              |
| `tools/esign/edit/[id]/`               | eSign — edit a draft (loads `EsignWizard` with `initialDoc`) |
| `sign/[token]/`                        | Public signing page (no auth, uses JWT token)      |
| `verify/[docId]/`                      | Public verification page                           |
| `i/[token]/`                           | Public invoice portal (Pay Now)                    |
| `salary/`, `salary/[job]/`, `salary/[job]/[city]/`, `salary/in/[city]/` | pSEO salary leaves |
| `learn/`, `learn/[slug]/`              | pSEO career/resume guides                          |
| `guides/[slug]/`, `articles/[slug]/`   | pSEO long-form content                             |
| `invoice-template/[profession]/`       | pSEO 250 profession-specific invoice templates     |
| `contract-template/[type]/[industry]/` | pSEO contract templates (NDA, MSA, etc.)           |
| `tax-tools/`, `tax-tools/[slug]/`      | Tax planning + IRS prep                            |
| `category/[...slug]/`                  | Catch-all category browser                         |
| `calculators/`, `calculators/[slug]/`  | 30+ financial calculators                          |
| `career-tools/`, `career-tools/[slug]/` | Resume builder, cover letter, etc.                |
| `sitemap*.xml/route.ts`                | Dynamic sitemap index + 7 sub-sitemaps             |
| `655d298ff61227bda1c71de5833e8715.txt/` | IndexNow verification key file                    |

### `frontend/src/components`

| Folder                | Owns                                                          |
|-----------------------|---------------------------------------------------------------|
| `ui/`                 | shadcn/ui primitives (Button, Card, Dialog, Toast …)          |
| `esign/`              | Dashboard, Wizard, FieldPlacer, PdfRenderer, SigningPage, SignatureCreator |
| `invoice-app/`        | InvoiceApp (orchestrator), InvoiceEditor, InvoicePreviewPanel, HistoryTab, ClientsTab |
| `resume/`             | Resume Builder (wizard, parser, templates, score engine)      |
| `career-tools/`       | Salary calculators, Net Worth, Subscription analyzer, etc.    |
| `tax-tools/`          | FreelancerTaxPlanner, IncomeMixPlanner, IRS Prep tools        |
| `billing/`            | PricingPage, BillingPage                                      |
| `nav/`, `footer/`     | Navbar, Footer                                                |
| `learn/`, `salary/`, `contract-template/` | pSEO page renderers                       |

### `frontend/src/data/pseo`

| File              | Contents                                                      |
|-------------------|---------------------------------------------------------------|
| `cities.ts`       | 56 US metros — BLS MSA codes, COL index, market summary       |
| `jobs.ts`         | 20 jobs — BLS SOC codes, growth %, daily tasks                |
| `salary-data.ts`  | 200 (job × city) rows — median, p25/p75/p90, YoY, employed    |
| `professions.ts`  | 250 profession invoice templates (line items, hourly ranges)  |
| `contracts.ts`    | 30 contract types → base template, clauses, audience          |
| `industries.ts`   | 20 industries — trait tags, considerations, pricing           |

### `frontend/src/lib`

Selected helpers (all pure, no React):

- `pdf-brand.ts` — branded jsPDF header/footer/chart helpers for every PDF.
- `sitemap-data.ts` — single source of truth for sitemap section configs.
- `storage.ts` — localStorage helpers + Mongo sync on login.
- `career-tools/` — resume scoring, parsing, variation engines.
- `taxBrackets.ts`, `useTaxAI.ts` — tax calculator helpers.

### `frontend/src/contexts/AuthContext.tsx`

Provides `useAuth()` to the entire app. Handles:

- `checkSession()` on mount via `/api/auth/me`.
- `login`, `register`, `logout`.
- Global `window` event listener for `"auth:expired"` (fired by API
  clients on any 401) → `window.location.href = /login?redirect=…`.

### `frontend/public/pdfjs/pdf.worker.min.mjs`

Copied from `node_modules/pdfjs-dist/build/` by the `prebuild` hook in
`package.json`. Self-hosted to dodge cdnjs 404s.

## Backend (`/app/backend`)

```
backend/
├── server.py               # FastAPI app, AI endpoints, sitemap
├── auth.py                 # Auth router
├── invoices.py             # Invoice router (large — ~830 lines)
├── user_data.py            # Per-tool key-value store
├── analytics.py            # A/B event ingestion
├── db.py                   # Mongo client + index creation
├── scheduler_jobs.py       # APScheduler tasks
├── tests/                  # pytest regression suites
├── uploads/                # PDFs, logos (gitignored)
├── esign/                  # PostgreSQL eSign module
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routes.py
│   ├── email_service.py
│   ├── pdf_processor.py
│   ├── tokens.py
│   └── storage.py
├── billing/                # Stripe + tiers + saved signature
│   ├── routes.py
│   ├── service.py
│   ├── tiers.py
│   ├── models.py
│   └── saved_signature.py
├── requirements.txt
└── .env                    # PROTECTED — secrets, DB URLs
```

### Key files

| File                          | Responsibility                                            |
|-------------------------------|-----------------------------------------------------------|
| `server.py`                   | App factory; mounts routers; AI endpoints (`/api/career-tools/*`, `/api/tax-tools/*`); sitemap |
| `auth.py`                     | Register, login (with brute-force lockout), refresh, password reset; cookies set by `set_auth_cookies()` |
| `invoices.py`                 | Invoice CRUD, client address book, attachments (Mongo + disk), Resend send, public portal HTML, partial payments |
| `user_data.py`                | Per-`tool_key` localStorage→Mongo sync (resume drafts, calculator caches) |
| `db.py`                       | `motor.AsyncIOMotorClient`; `create_indexes()` called once at startup |
| `scheduler_jobs.py`           | `reminder_job` (hourly), `expire_documents_job` (daily), `mark_invoices_overdue_job`, `reset_counters_job` |
| `esign/routes.py`             | Owner CRUD + Public signing (`/sign/{token}`) + verification |
| `esign/models.py`             | 4 SQLAlchemy models                                       |
| `esign/pdf_processor.py`      | Merge signatures, build audit page (with role-aware timeline) |
| `esign/email_service.py`      | Role-aware Resend templates (signer / witness / approver / cc) |
| `esign/tokens.py`             | `create_signing_token(sid, did, email)` + `hash_token(jwt)` (SHA-256) |
| `billing/service.py`          | Stripe Checkout Session, Portal Session, webhook event handlers |
| `billing/tiers.py`            | `TIER_LIMITS` dict + `assert_can_*` tier gates             |

## Shared Utilities

There is no shared `lib/` between frontend and backend — each side keeps its
own helpers. The only cross-cutting interface is the REST API contract
documented in **[06 API](./06-api.md)**.

## Configuration Files

| File                                      | Purpose                                |
|-------------------------------------------|----------------------------------------|
| `/app/backend/.env`                       | Backend secrets (Mongo, Postgres, JWT, Resend, Stripe, Emergent) |
| `/app/frontend/.env`                      | Only `NEXT_PUBLIC_BACKEND_URL`         |
| `/app/frontend/next.config.ts`            | Next.js config (image domains)         |
| `/app/frontend/tsconfig.json`             | TS paths, strict mode                  |
| `/app/frontend/tailwind.config` (via `globals.css`) | Tailwind v4 inline config        |
| `/app/backend/requirements.txt`           | Python deps (managed via `pip freeze`) |
| `/app/frontend/package.json`              | Frontend deps (managed via `yarn add`) |
| `/etc/supervisor/conf.d/*.conf`           | Supervisor process configs (READONLY)  |

## Build & Deployment Files

| File                                              | Purpose                                  |
|---------------------------------------------------|------------------------------------------|
| `/app/deploy.sh`                                  | Manual remote deploy script              |
| `/app/.github/workflows/deploy.yml` (if present)  | CI/CD trigger to remote-server deploy    |
| `/app/frontend/scripts/post-build-ping.ts`        | IndexNow ping (auto-skips localhost)     |
| `/app/frontend/scripts/copy-pdfjs-worker.*`       | Run by `prebuild` to self-host worker    |
