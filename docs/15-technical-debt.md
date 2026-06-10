# 15 — Technical Debt & Improvements

A prioritised view of the codebase's known weak spots and the
opportunities to turn this from a "great solo project" into a
"sustainable engineering org" codebase.

## 15.1 Code Quality Issues

### Large components / modules

| File                                             | Lines | Recommendation                                 |
|--------------------------------------------------|-------|------------------------------------------------|
| `frontend/src/components/invoice-app/InvoiceApp.tsx` | ~810 | Split into `useInvoiceState` hook + `InvoiceListView` + `InvoiceEditorView` |
| `frontend/src/components/esign/EsignWizard.tsx`  | ~640  | Extract step components (`Step1Upload.tsx`, `Step2Signers.tsx`, …) |
| `frontend/src/components/esign/SigningPage.tsx`  | ~475  | Extract the activity strip + overlays modules  |
| `backend/server.py`                              | ~850  | Move AI tool routes into `backend/career_tools/` and `backend/tax_tools/` modules |
| `backend/invoices.py`                            | ~830  | Split into `routes.py`, `pdf_html.py`, `email_dispatch.py`, `attachments.py` |

### Inconsistencies

- Some Mongo queries serialise `_id` via `str(...)`; others rely on the
  Pydantic `PyObjectId`. Standardise on `PyObjectId`.
- Frontend has both `react-helmet-async` and Next.js `metadata` exports
  living side by side. Migrate everything to App Router metadata.
- `vite` is present in `package.json` but unused (Next handles the build).
  Remove.
- Two date helpers (`date-fns` and custom code in `frontend/src/lib`). Pick one.

### Dead / unused code

- `replit.md` at repo root — legacy hosting artefact.
- `lib/` at repo root (top-level) is empty stub.
- Some unused `react-helmet-async` imports inside `frontend/app/learn/[slug]/page.tsx`.
- A handful of `// TODO` markers in `backend/esign/email_service.py` — audit before next release.

## 15.2 Performance Bottlenecks

| Surface                       | Issue                                                          | Suggestion                                       |
|-------------------------------|----------------------------------------------------------------|--------------------------------------------------|
| pSEO build                    | `yarn build` peaks at ~1.5 GB RAM, ~50 s on a 4-vCPU box       | Split sitemap regeneration off the critical path; precompute static datasets at the top level instead of regenerating per page |
| `/api/invoices/{id}/share`    | Fetches the full doc + recomputes totals on every GET          | Cache the public HTML response (ETag)            |
| eSign PDF stamping            | `pypdf` re-renders every page even when only one signer's fields changed | Cache stamped pages; only re-stamp dirty pages |
| Audit PDF                     | Pulls all `audit_events` into memory                           | Stream + paginate for docs with thousands of events |
| MongoDB                       | No projection in list queries — entire `items[]` returned per row | Add `projection` to `find()` calls on dashboards |
| Resume builder                | Heavy bundle (Lucide + Recharts + jsPDF) on initial load       | Dynamic-import the PDF generator + chart libs    |
| pSEO Salary pages             | Each page renders the full city dataset client-side             | Drop to RSC-only rendering; remove client islands where possible |

## 15.3 Scalability Concerns

- **Single-process scheduler** — APScheduler is in-process. If you ever scale to >1 backend instance, you'll fire duplicate emails. Move to Celery + Redis or a single-shot cron-only worker process.
- **Filesystem PDF storage** — works on one server but blocks multi-region. Move to S3-compatible storage; FastAPI already streams files via `StreamingResponse`.
- **No connection pooling** for outbound HTTP (Resend, Stripe). Use a shared `httpx.AsyncClient` mounted on `app.state`.
- **No DB read replicas** — All reads hit the primary. Acceptable for now.
- **No CDN in front of `/api/sitemap-*.xml`** — those XML files are SSG'd by Next but the API ones are dynamic. Cache them at the nginx layer.

## 15.4 Refactor Recommendations

### Backend layering

Today's structure mixes routes and business logic. Suggested target:

```
backend/
├── server.py          # only app factory + router mounting
├── core/              # config, db clients, common deps
├── auth/
│   ├── routes.py
│   ├── service.py     # bcrypt, JWT mint, brute-force
│   └── schemas.py
├── invoices/
│   ├── routes.py
│   ├── service.py     # totals, PDF html, share token
│   ├── email.py
│   └── attachments.py
├── esign/             # already nicely split
├── billing/
└── reports/           # future
```

### Frontend layering

Promote per-feature folders that own:
```
features/esign/
├── components/
├── hooks/
├── api.ts
└── types.ts
```
Currently we have `src/components/esign/` and `app/tools/esign/`. Co-locating hooks and API client into a `features/` slice would reduce drift.

### Migrations

- Adopt **Alembic** for Postgres now (before paying customers).
- For Mongo, write idempotent migrations as scripts under `backend/migrations/`.

### Testing

- 95% of pytest coverage today is integration-style against the live DB. Add unit tests for pure helpers (`pdf_processor.build_audit_page`, `tiers.assert_can_*`, `signer.color` assignment).
- Add frontend component tests via Vitest + Testing Library — currently only Playwright end-to-end (run by the QA agent) exists.

## 15.5 Architecture Improvements

| Idea                                                                       | Value                          |
|----------------------------------------------------------------------------|--------------------------------|
| Move signed PDFs to S3 + signed URLs                                       | Multi-region readiness         |
| Switch APScheduler → external worker (Celery / Procfile job)               | Horizontal scale, idempotency  |
| Introduce a feature-flag service (`/api/flags/{user_id}`)                  | Safe A/B rollouts, kill switches |
| Replace bespoke `_wrap` HTML email helper with MJML templates              | Email rendering consistency    |
| Generate OpenAPI client for frontend from FastAPI's auto-spec              | Eliminates hand-written `api.ts` |
| Wire structured logging (`structlog` + JSON) and ship to a log aggregator  | Production observability       |
| Add Sentry / Honeycomb tracing                                             | Catch regressions in pSEO build/runtime |
| Move pSEO content into a CMS (Sanity, Payload) once it grows past 10 contributors | Editorial workflow      |
| Split the eSign tool into its own service                                  | Independent scaling, easier sale of the product alone |

## 15.6 Documentation Gaps

- No OpenAPI export checked into the repo (FastAPI has `/docs` available, but it's gated behind your domain).
- No runbook for **rotating** secrets.
- No public **status page** wiring (e.g. Better Stack / Statuspage).
- The **Resume Builder** scoring algorithm is undocumented — devs end up reverse-engineering `resumeScoreEngine.ts`. Add an ADR.
- pSEO content generation rules are spread across multiple `variationEngine.ts` files — a single "How we generate unique pSEO copy" doc would save future contributors weeks.

## 15.7 Suggested 90-Day Engineering Plan

1. **Week 1-2**: Add Alembic + first migration. Split JWT secrets.
2. **Week 3**: Move PDFs to S3 with signed URLs.
3. **Week 4**: Adopt MJML for emails; ship visual regression tests.
4. **Week 5-6**: Extract `EsignWizard` and `InvoiceApp` into step / feature slices.
5. **Week 7**: Introduce Sentry + structured logging.
6. **Week 8**: External worker for scheduler.
7. **Week 9-10**: Auto-generate frontend API client from OpenAPI; rip out hand-written `api.ts` files.
8. **Week 11-12**: Pen-test pass, fix everything in `14-security.md`.
