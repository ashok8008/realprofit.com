# RealProfits - Product Requirements Document

## Overview
RealProfits is a financial + career decision platform. Organic traffic via pSEO is the primary acquisition channel. Now includes a **free eSign tool** as part of the Productive Tools suite (DocuSign competitor).

## Architecture
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + GPT-4o-mini via emergentintegrations
- **Databases**:
  - **MongoDB** (motor async) — auth, users, invoices, resume drafts, calculator caches
  - **PostgreSQL 15** (asyncpg + SQLAlchemy 2.0) — **eSign module only** (documents, signers, signature_fields, audit_events). User chose Postgres for the eSign tool to support future Stripe subscriptions cleanly.
- **Auth**: JWT (httpOnly cookies, 15min access + 7-day refresh tokens, bcrypt, brute force protection)
- **State**: MongoDB for authenticated users, localStorage fallback for anonymous
- **SSR/SSG**: pSEO pages are server components with generateMetadata
- **Deployment**: Emergent native (Kubernetes)

## Database Schema
### MongoDB
- **users**: email (unique), password_hash, name, role, created_at
- **login_attempts**: identifier (IP:email), count, locked_until
- **password_reset_tokens**: token, user_id, expires_at, used (TTL index)
- **user_data**: user_id + tool_key (compound unique), data (any), created_at, updated_at
- **invoices**, **clients** (Invoice Generator)

### PostgreSQL (eSign — db `realprofits_esign`)
- **documents**: id (UUID), owner_id (Mongo ObjectId str), title, original_key, signed_key, status (draft/sent/partial/completed/expired/voided/declined), doc_hash (SHA-256), signing_order, page_count, expires_at, completed_at, settings (JSONB), created_at, updated_at
- **signers**: id (UUID), document_id (FK), name, email, role, order_index, color, token_hash (SHA-256 of JWT), token_used, status, signed_at, viewed_at, ip_address, user_agent, geo_country, geo_city, reminder_count, decline_reason
- **signature_fields**: id (UUID), document_id, signer_id, page, x/y/width/height (0–1 fractions), field_type (signature/initials/date/text/checkbox/stamp), required, label, filled_at, value
- **audit_events**: id (UUID), document_id, signer_id, event_type, occurred_at, ip_address, user_agent, metadata (JSONB)

## pSEO System
- **56 cities** across 4 cost tiers (very-high, high, moderate, low)
- **14 salary levels** ($30K-$300K)
- **784 location-salary pages** (56 x 14)
- **1,071 total guide pages** (salary, tax, savings, mortgage, debt, freelancer, location-salary)
- **1,215+ total sitemap URLs** (including tax tools)
- **Cost Tier Engine** (`costTier.ts`): Classifies cities by COL + rent
- **Variation Engine** (`variationEngine.ts`): Deterministic content generation
- Sitemap: Next.js `sitemap.ts` with `force-static` generation

## API Endpoints
### Auth (/api/auth/*)
- POST /register, /login, /logout, /refresh, /forgot-password, /reset-password
- GET /me

### User Data (/api/user-data/*)
- GET /, GET /{tool_key}, PUT /{tool_key}, DELETE /{tool_key}, POST /bulk

### Career Tools (/api/career-tools/*)
- POST /improve-bullet, /improve-summary, /email-template
- GET /email-templates

### Tax Tools (/api/tax-tools/*)
- POST /explain (AI explanation via GPT-4o-mini, informational only)

### Other
- GET /api/health, /api/sitemap.xml, /api/sitemap/stats

### eSign (/api/esign/*) — **NEW (2026-05-27)**
**Owner (auth required):**
- POST `/documents` (multipart PDF upload, 25MB max, magic-byte validated, **tier-gated**)
- GET `/documents` (list with signed_count + signer_count)
- GET `/documents/{id}` (detail with signers + fields)
- PATCH `/documents/{id}` (update title, signing_order, expires_at, settings, signers array, fields array; **tier-gated** for signer count + branding)
- DELETE `/documents/{id}`
- POST `/documents/{id}/send` (creates per-signer JWTs, emails E1, sets status=sent)
- POST `/documents/{id}/void` (sets status=voided, emails E10 to all signers)
- GET `/documents/{id}/original` (download original PDF)
- GET `/documents/{id}/signed` (download signed PDF with audit page)
- GET/PUT/DELETE `/signature` (saved-signature per user — for reuse across documents)

**Public (token-based, no auth):**
- GET `/sign/{token}` (records 'viewed' event, returns SignerPublicView)
- GET `/sign/{token}/pdf` (fetch PDF for in-browser PDF.js rendering)
- POST `/sign/{token}/submit` (FieldValue[], consent required, marks signed; if last → triggers finalize → completed)
- POST `/sign/{token}/decline` (reason → emails E9 to owner + signers)
- GET `/verify/{doc_id}` (public verification with masked emails + SHA-256)

### Billing (/api/billing/*) — **NEW (2026-05-27)**
- GET `/plans` (public — list Free/Pro/Business with monthly + annual pricing)
- GET `/status` (auth — current tier, usage, limits, period_end)
- POST `/checkout` (auth — creates Stripe Checkout Session for plan+interval, returns hosted URL)
- POST `/portal` (auth — Stripe Billing Portal session)
- GET `/checkout-status/{session_id}` (auth — poll after Stripe redirect)
- POST `/webhook` (Stripe webhook — checkout.session.completed, subscription.updated/deleted, invoice.payment_succeeded/failed; idempotent via subscription_events.stripe_event_id unique)
- POST `/cancel` (auth — set cancel_at_period_end=true via Stripe)

**Tier limits (free → pro → business):**
- MAX_DOCS_PER_MONTH: 5 / ∞ / ∞
- MAX_SIGNERS: 5 / 10 / 20
- MAX_FILE_SIZE_MB: 10 / 50 / 100
- MAX_PAGES: 20 / ∞ / ∞
- SHOW_BRANDING: true / false / false
- BULK_SEND + API_ACCESS + WHITE_LABEL: business only

### Background Jobs (APScheduler) — **NEW (2026-05-27)**
- **Hourly** (`:15`): reminder_job — re-emails E1 to pending signers at days 3, 7, 14 after send (configurable per-document)
- **Daily** (`00:01 UTC`): expire_documents_job — sets status=expired for docs past expires_at, notifies all parties
- **Daily** (`00:30 UTC`): mark_invoices_overdue_job — sets invoices with `due_date < today` and status=sent to overdue
- **Daily** (`09:00 UTC`): send_invoice_reminders_job — emails clients with overdue invoices (re-runs every 7 days max)
- **Monthly** (`day 1, 00:05 UTC`): reset_counters_job — zeroes docs_used_this_month across all subscriptions

### Analytics (/api/analytics/*) — **NEW (2026-05-27)**
- POST `/event` (public) — log A/B experiment events to MongoDB `ab_events` collection
- GET `/summary/{experiment}` (admin only) — variant counts + click_rate + conversion_rate

### Invoice extensions — **NEW (2026-05-27)**
- POST `/api/invoices/{id}/share` (auth) — generate `share_token` (idempotent), returns `public_url`
- GET `/api/invoices/public/{token}` (public) — server-rendered HTML invoice with Pay Now button
- QR code on every downloaded PDF auto-points to the public share URL
- Cross-promo modal on PDF download → "Sign this with eSign" (and reverse on eSign completion → "Try Invoice")

## Tax Tools System (Phase 16)
### Hub: /tax-tools
- Hero section with PREP ONLY badge
- Trust bar (privacy, free, not tax advice)
- 3 Popular tools quick links
- 12 tools organized by section
- Compliance "What These Tools Are (and Aren't)" section
- CTA to year-end packet

### Tax Calculators (linked to /calculators/*)
- Simple Tax Estimator
- Self-Employment Tax Calculator
- Tax Set-Aside Calculator
- Quarterly Tax Calculator

### Tax Planning (at /tax-tools/*)
- Freelancer Tax Planner (quarterly set-aside, SE tax, AI insights)
- Income Mix Tax Planner (W-2 + 1099 + other, pie chart, AI insights)
- Tax Checklist Generator (dynamic checklist by income situation, downloadable)

### IRS Prep Tools (at /tax-tools/*, all with PREP ONLY disclaimers)
- 1040-ES Prep Generator (quarterly payments, safe harbor, PDF export)
- Schedule C Prep Summary (business income/expenses, add/remove rows, PDF)
- Tax Summary PDF (comprehensive year-end summary, balance/refund, PDF)
- W-2 + 1099 Organizer (multi W-2/1099, filing checklist, PDF)
- Year-End Tax Packet (full bundled PDF with 6 sections)

### Shared Components
- TaxAIExplain: AI insight button (1 free use via localStorage, rule-based fallback)
- TaxPDFExport: jsPDF-based download with disclaimers
- taxBrackets.ts: Federal tax bracket logic (single + MFJ)
- useTaxAI.ts: Hook for AI explain + rule-based fallbacks

### Compliance
- All IRS Prep tools: "PREP ONLY" badge + AlertTriangle disclaimer
- PDF footers: "Not for IRS submission"
- Hub: "What These Tools Are (and Aren't)" transparency section
- AI: Informational only, never for calculations

## Implementation History

### Phase 1-9: Core Platform, pSEO, Resume, Deployment, Migration, Analytics, Code Quality -- DONE
### Phase 10: Deployment .gitignore Fix -- DONE
### Phase 11: Auth + DB Integration -- DONE
### Phase 12: Sensitive Data Migration -- DONE
### Phase 13: Component Splitting -- DONE
### Phase 14: CloudSyncIndicator -- DONE
### Phase 15: pSEO City Expansion (Feb 2026) -- DONE
### Phase 16: Tax Tools Product Section (Feb 2026) -- DONE
- Built 12-tool Tax Tools hub at /tax-tools
- 3 Tax Planning tools: FreelancerTaxPlanner, IncomeMixPlanner, TaxChecklistGenerator
- 5 IRS Prep tools: Form1040ESPrep, ScheduleCPrep, TaxSummaryPDFTool, W2Organizer, YearEndPacket
- 4 existing calculators linked from hub
- AI tax insights via TaxAIExplain (GPT-4o-mini, 1 free use)
- PDF export on all IRS Prep tools via jsPDF
- Compliance disclaimers throughout (PREP ONLY, not for IRS submission)
- Tax Tools added to navbar, sitemap, backend sitemap
- Testing: Backend 100% (8/8), Frontend 100% (25/25) — iteration_16

## Testing Status
- Iteration 14: Backend 95%, Frontend 100%
- Iteration 15: Frontend 100% (17/17)
- Iteration 16: Backend 100% (8/8), Frontend 100% (25/25) — Tax Tools
- Iteration 23: Backend 100% (6/6), Frontend 100% (13/13) — Resume Builder UX Overhaul v1
- Iteration 24: Backend 100% (9/9), Frontend 100% (21/21) — Resume Builder Complete Wizard Rewrite + Skill Suggestions
- Iteration 25: Backend 100% (9/9), Frontend 100% (24/24) — Entry Flow Redesign (4 screens matching competitor)
- Iteration 26: Backend 100% (9/9), Frontend 100% (23/23) — Onboarding + Template Selection Redesign (plant icons, golden underlines, full preview)
- Iteration 27: Frontend 100% (18/18) — 5 Distinct Templates + Years of Experience Screen
- Iteration 28: Backend 100% (7/7), Frontend 100% (16/16) — Premium ATS Checks
- Iteration 30: Backend 100% (2/2), Frontend 100% (14/14) — Component Splitting Regression

### Phase 17: Tax Tools SEO Schemas, Canonical URLs, Sitemap & Robots (Apr 2026) -- DONE
- Added JSON-LD structured data: BreadcrumbList, ItemList, FAQPage on hub; WebApplication, BreadcrumbList, FAQPage on detail pages
- Canonical URLs via Next.js generateMetadata on all tax-tools routes
- OpenGraph and Twitter Card meta tags on all tax tool pages
- Sitemap verified: 9 tax tool URLs in both frontend and backend sitemaps (1,216+ total URLs)
- robots.txt enhanced: explicit Allow/Disallow directives, GPTBot/CCBot blocked, auth pages blocked
- Testing: Backend 100% (4/4), Frontend 100% (21/21) — iteration_17

### Phase 18: Resume Builder Parser & Score Engine (Apr 2026) -- DONE
- DOCX/PDF/Text parsers (mammoth, pdfjs-dist) with section detection
- 100-point 7-category deterministic scoring engine
- Smart Improve (rule-based rewriting) + AI Improve (GPT-4o-mini)
- Multi-step import flow: Entry → Processing → Review → Editor
- Fix All Easy Issues bulk action
- Testing: Frontend 100% — iteration_18

### Phase 19-20: Resume Builder UI Redesign & Share Score (Apr 2026) -- SUPERSEDED by Phase 21-22

### Phase 21-22: Premium Full-Screen Resume Builder Workspace (Apr 2026) -- DONE
- Compact entry page: Upload + Create From Scratch side-by-side cards (no bloated hero)
- New template selection step: 5 templates (Clean, Professional, Minimal, Executive PRO, Modern PRO)
- 3-panel editor: light sidebar (zinc-50, collapsible 200→56px), spacious form (p-8), live preview (42% width, always visible)
- Score in toolbar: score number + ATS/Readability/Impact mini bars
- Tips & Fixes as toggleable slide-out panel (not inline bloated cards) with compact cards (~40px), +points, Fix buttons, Fix All
- Generous form fields (h-14 inputs, text-base labels, text-3xl headings)
- Step navigation: Continue (1/5) + Back buttons
- Testing: Frontend 100% (29/29) — iteration_22

### Phase 23: Resume Builder UX Overhaul — Multi-Step Wizard & Review Cards (Apr 2026) -- DONE
- **COMPLETE REWRITE** of the Resume Builder to match competitor (Resume Now) premium UX patterns
- **Entry page**: "Import Your Resume" and "Create From Scratch" dual-card layout with gradient background
- **Create From Scratch flow**: Entry → Experience Level → Industry Selection → Template Selection → Guided Wizard Editor
- **Import flow**: Entry → Processing → Welcome ("Nice to meet you, {name}") → Analysis (strengths/fixes) → Template Selection → Guided Wizard Editor
- **Guided Wizard Editor**: Dark navy sidebar with 7 steps (Header, Experience, Education, Skills, Summary, Additional Details, Finalize) + score completion ring + resume preview on right
- **Review Card Pattern**: Experience & Education entries show as collapsed cards with Edit/Delete/Move buttons, expanding inline for editing
- **AI Summary Generation**: "Generate My Summary" button with 3 AI-written options labeled "Refined for clarity", "Optimized for impact", "Focused on expertise"
- **Job-Title Skill Suggestions**: "Get Suggestions" button in Skills step calls POST /api/career-tools/suggest-skills for AI-powered skill recommendations
- **Full-screen Tips & Fixes**: Dark overlay with categorized issues, Fix All button, and Fix individual buttons
- **New backend endpoints**: POST /api/career-tools/generate-summaries, POST /api/career-tools/suggest-skills
- Testing: Backend 100% (9/9), Frontend 100% (21/21) — iteration_24

### Phase 23b: Resume Builder Entry Flow Redesign — Matching Competitor Screenshots (Apr 2026) -- DONE
- **Screen 1 (Entry)**: Bold "AI Resume Builder (Fast, Easy, & Free to Use)" heading with teal accent, amber "Import your resume" + blue "Create my resume" pill buttons
- **Screen 2 (Upload)**: Dedicated upload page with drag-and-drop zone, SVG document icon, amber "Browse your computer" button, file type notice (DOCX, PDF), paste text option, "Create a new resume" blue link, back button
- **Screen 3 (Processing)**: Animated loading screen with spinning teal/gold rings, rotating tips carousel (6 financial/career tips), progress bar while parsing resumes
- **Screen 4 (Welcome)**: Two-column layout with SVG illustration on left, "Nice to meet you, {Name}" personalized text with bold highlights of role, company, certifications
- **Screen 5 (Analysis)**: Two-column with SVG illustration, "You're off to a great start!" heading, "You got it right" card with green checks, "How we'll help you improve" card with gold stars
- **All using RealProfits brand colors**: teal (#0d9488), gold (#f5c542), blue (#3b82f6)
- Testing: Backend 100% (9/9), Frontend 100% (24/24) — iteration_25

### Phase 23c: Resume Builder — 5 Distinct Templates & Years of Experience (Apr 2026) -- DONE
- **5 Visually Distinct Template Renderers** (new `TemplateRenderer.tsx`):
  - **Clean**: Centered header, serif font (Georgia), thin rule separators, classic ATS layout
  - **Professional**: Double-rule header border, bold section headings, italic company names, Cambria font
  - **Minimal**: Left-aligned, ultra-lightweight section headers (tracking-[0.25em]), generous whitespace, system-ui font
  - **Executive**: Dark slate-800 header banner, gold accent line, timeline left-borders on experience, skill pills in slate-100 badges
  - **Modern**: Two-column layout with dark slate-800 sidebar (contact + skills + certifications), teal accent headings, main content area
- **Years of Experience onboarding step**: New screen between Experience Level and Industry with 5 options (Less than 1 year, 1-3, 3-5, 5-10, 10+), clock SVG icons, blue accent underline
- **Template Selection page**: Shows sample data (Sarah Johnson) when user has no data, distinct thumbnails for each template with scale="thumb" rendering
- **Wizard editor preview**: Right panel now renders using the selected template (not a generic preview)
- **Create flow updated**: Entry → Experience Level → Years of Experience (NEW) → Industry → Template Selection → Wizard Editor
- Testing: Frontend 100% (18/18) — iteration_27

### Phase 23d: Restore Score Toolbar (Apr 2026) -- DONE
- Restored ATS/Readability/Impact score mini-bars in the wizard editor toolbar
- Toolbar shows: score number (color-coded), ATS bar (teal), Readability bar (rose), Impact bar (sky), Tips button with count badge, PDF download button
- Responsive: bars hidden on small screens, all visible on sm+

### Phase 24: Premium ATS Checks (Apr 2026) -- DONE
- **Backend**: New POST `/api/career-tools/ats-check` endpoint using GPT-4o-mini for AI-powered ATS analysis
- **5 ATS Categories**: Keyword Match, Format Safety, Section Completeness, Contact Info, Date Consistency (each 0-20, total 100)
- **MongoDB Caching**: Results cached in `ats_checks` collection with hash-based lookup and 1-hour TTL
- **Keyword Analysis**: Found keywords (green pills), missing keywords (red clickable pills that add to skills)
- **Job Description Matching**: Optional textarea to paste a JD for targeted keyword comparison
- **Frontend Panel**: Full-screen dark overlay with circular score ring, category breakdown cards with progress bars/issues/fixes, keyword analysis section
- **Score Toolbar Integration**: New "ATS Check" button between progress bars and Tips button
- Testing: Backend 100% (7/7), Frontend 100% (16/16) — iteration_28

### Phase 25: Premium PDF Export Redesign (Apr 2026) -- DONE
- **Shared Branding Utility** (`/app/frontend/src/lib/pdf-brand.ts`): Dark header bar with teal accent stripe, RealProfits branding, drawHeader/drawFooter/drawStatCard/drawTable/drawBarChart/drawSectionHeading/drawKVRow/drawRule helpers
- **Freelance Invoice**: Professional layout with From/To columns, styled items table with alternating rows, teal total bar, notes/payment terms sections
- **Net Worth Calculator**: 3 stat cards (Assets/Liabilities/Net Worth), colored bar charts for asset/liability breakdown, summary section
- **Subscription Cost Analyzer**: 3 stat cards (Monthly/Annual/Count), styled subscription table, category bar chart with alternating colors
- **Tax PDF Export**: Branded header, disclaimer bar, accent-bordered section headings, bold totals in teal
- **Year-End Tax Packet**: 4 stat cards (Gross/Federal/SE/Balance), 6 branded sections, balance highlight bar (red=owed, green=refund), quarterly schedule
- **Resume PDF**: Subtle footer branding + page numbers on all templates
- **Cover Letter**: Branded header with applicant name, clean letterhead formatting
- **Dead code removed**: `createCareerPDF`, `addSection`, `addText`, `addKeyValue`, `downloadPDF` (all unused)
- Testing: Frontend 100% (18/18) — iteration_29

### Phase 24a: Database Stitching & Draft Persistence (Apr 2026) -- DONE
- Added `resume_drafts` collection index (`draft_id`, unique) in `db.py`
- Frontend now loads drafts from MongoDB as fallback when localStorage is empty (cross-device persistence)
- Template selection, experience level, years of experience, and industry choices now saved to `resume_meta` localStorage key and persisted across sessions
- Reset/clear now properly wipes both resume data and meta preferences
- Auto-save now includes template and onboarding choices in the save cycle

### Phase 26: Code Quality Report — Component Splitting & Cleanup (Apr 2026) -- DONE
- **ResumeBuilder.tsx split** from 1458 → 381 lines (orchestrator) + 6 focused sub-components
- **FreelanceInvoiceGenerator.tsx** reduced from 447 → 285 lines by extracting `invoice/InvoicePDFExport.ts`
- **AmIUnderpaid.tsx** reduced from 366 → 183 lines by extracting `underpaid/UnderpaidResults.tsx`
- **Earlier code quality fixes**: Hardcoded secrets removed, MD5 → SHA-256, `ats_check()` backend refactored
- Testing: Backend 100% (2/2), Frontend 100% (14/14) — iteration_30

### Phase 27: Calculator PDF Branding Fix (Apr 2026) -- DONE
- Fixed `ExportToPDFButton` (used by all 30+ calculators) to use premium `pdf-brand.ts` branding
- PDFs now have: dark header bar, teal accent stripe, RealProfits gold branding, page numbers, branded footer
- Fixed TypeScript build errors: `FlowState` type mismatches across 6 sub-components
- Fixed stale `.next` build cache causing CSS loading failure (updated deployment guide)

### Phase 28: Full-Site pSEO System — Resume & Career Guides (Apr 2026) -- DONE
- **122 new pSEO pages** at `/learn/[slug]` route, all SSG pre-rendered
- **6 content categories**:
  - Resume by Job Role: 50 roles with CTR-optimized titles
  - Resume Score: 13 score pages ("Is 70 Good? 70 vs 90 Explained")
  - Resume by Experience: 9 levels ("No Experience", "Career Change", etc.)
  - Resume for Companies: 20 companies (Google, Amazon, Apple, etc.)
  - Resume Problems & Fixes: 18 issues ("Not Getting Interviews? Fix in 10 Min")
  - Career Decisions: 12 frameworks ("Should I Change Jobs?", "Pay Cut?")
- **CTR-Optimized Titles** across ALL pSEO pages (salary, tax, learn) with emotional hooks, clarity, curiosity
- **Variation Engine** (`resumeVariationEngine.ts`): Unique content per page
- **GEO/AI Optimization**: Direct-answer paragraphs, Key Takeaways, FAQ schema
- **Cross-category internal linking**: Every page links to 3-5 related tools
- **Hub Page** at `/learn` with categorized index
- **Sitemap**: 1,325 total URLs, all crawlable
- **Quality-first approach**: Deep, unique content per page (not thin/repetitive)

### Phase 29: CTR Title Optimization & Homepage Internal Links (Apr 2026) -- DONE
- **CTR-optimized titles** for ALL guide categories:
  - Salary: "Is $80,000 a Good Salary? (Full Breakdown)"
  - Tax: "$100,000 Income — Tax Breakdown & Take-Home Pay"
  - Savings: "How to Save $10,000 Fast (Realistic Plan)"
  - Mortgage: "$300,000 Mortgage — What You'll Actually Pay Monthly"
  - Debt: "How to Pay Off $10,000 in Debt (Fastest Strategy)"
  - Freelancer: "Self-Employment Tax on $100,000 — The Full Picture"
  - Location: "$80,000 in New York City — What You Actually Take Home"
- **Homepage Trending Guides section** with 16 high-priority internal links across salary, tax, resume, savings, career, city, and debt categories
- Links to `/guides` and `/learn` hub pages for crawl discovery

### Phase 30: Invoice Generator Pro (May 2026) -- DONE
- **Backend API** (`/api/invoices`, `/api/invoices/clients`) — Full CRUD with auth, partial payments, stats
- **3-column layout**: Dark teal sidebar + Editor tabs + Live Preview
- **Editor tab**: Invoice details, business info, bill-to with saved client loader, line items with units, discount/tax/totals, notes & terms, payment link, partial payments, recurring billing
- **Clients tab**: Address book with add/edit/delete, load into invoice
- **History tab**: Invoice list with stats cards, status filters (draft/sent/paid/overdue/partial), CSV export
- **Preview panel**: Live invoice preview with accent color, template picker, Print/PDF
- **Auth required**: Redirects to login, supports redirect-back after login
- **Chromeless mode**: No navbar/footer for full-screen workspace
- **Login redirect fix**: Login page now reads `?redirect=` query param
- Testing: Backend 100% (15/15), Frontend 97% → 100% after redirect fix

### Phase 31: QA Audit Bug Fixes (May 2026) -- DONE
- **Paycheck Calculator**: Blocked negative values for all fields, added Reset button
- **Net Worth Calculator**: Blocked negative values for assets/liabilities
- **Offer Comparison**: Fixed unique IDs so Offer 1 doesn't auto-fill Offer 2, blocked negative values
- **Email Templates**: Generated email now clears when switching template tabs
- **Resume Builder**: Phone field limits to 15 chars with phone-only characters, "Add Industry" button now functional (shows custom input)
- **Invoice Redirect**: Old `/tools/freelance-invoice-generator` redirects to new `/tools/invoice`
- Testing: Backend 100%, Frontend 100% (18/18) — iteration_32

### Phase 32: QA Bug Fixes Round 2 (May 2026) -- DONE
- **Salary Calculator 404**: Created new `SalaryCalculator` component with annual/monthly/bi-weekly/hourly breakdown + deduction chart
- **Rent vs Buy Calculator**: Added empty state when values are 0, added full "If You Buy vs If You Rent + Invest" analysis with wealth comparison
- **Retirement Growth Calculator**: Age fields now clearable (allows empty → retype new value)
- **Bill Split Tool**: Fixed multiplier=0 when subtotal=0 (was causing wrong calculations), tip now shows dollar amount + percentage
- **Freelancer Tax Planner**: Fixed stat card overflow with break-all + reduced font sizes
- **Year-End Tax Packet**: Added Download PDF button at top (next to disclaimer) so users don't have to scroll
- Testing: Frontend 100% (27/27) — iteration_33

### Phase 33: Send Invoice by Email (May 2026) -- DONE
- **Resend integration**: Professional HTML invoice emails with branding, item table, totals, payment link button
- **Backend**: `POST /api/invoices/send-email` — sends HTML email via Resend, auto-updates invoice status to "sent"
- **Frontend**: "Send by Email" button in sidebar, modal with recipient, subject, custom message
- **Note**: Resend in test mode — can only send to verified email (ashok8008@gmail.com). To send to any email, verify a domain at resend.com/domains

### Phase 34: Login Security Fix + Logo Upload (May 2026) -- DONE
- **Login form security**: Changed `<form>` from default GET to `method="post"` on login + register pages. Added `autoComplete` attributes (email, current-password, new-password). Credentials no longer exposed in URL query string.
- **Logo upload**: `POST /api/invoices/upload-logo` accepts PNG/JPEG/WebP/SVG (max 2MB), stores as base64 data URL in MongoDB `invoice_settings`. Logo persists across sessions, displays in editor and preview panel.
- **Route ordering fix**: Moved static routes (`/stats/summary`, `/settings`, `/upload-logo`, `/clients/list`, `/send-email`) before parameterized `/{invoice_id}` to prevent 500 errors.

## Upcoming Tasks
- Stripe integration for monetization (P2)
- A/B test hero CTAs (P2)

### Phase 35: pSEO Master Plan — Phase 1 (Feb 2026) -- DONE
- **481 new pSEO pages** built per `RealProfits_pSEO_Plan.docx` Phase 1 (1a + 2a + 3a)
- **1a Invoice Templates** (already DONE in prior session): 250 profession-specific landing pages at `/invoice-template/[profession]` — hand-curated line items for top 30, auto-generated for 220 more. Hub at `/invoice-template`.
- **2a Salary Pages** (this session): 200 deep leaf pages at `/salary/[job]/[city]` (20 BLS-mapped jobs × 10 priority metros). Each page includes:
  - Answer card with median + p25/p75/p90 + YoY change
  - Salary by experience (Entry/Mid/Senior/Lead)
  - Comparison bars (city vs national vs COL-adjusted purchasing power)
  - 5-year salary trend visualization
  - Market context paragraph + estimated employed count
  - 5 cross-linked related jobs + 5 cross-linked other cities
  - FAQ schema (5 Q&A) + BreadcrumbList schema
  - Internal links to paycheck calculator + "Am I underpaid" tool
- **3a Hub Pages** (this session):
  - Top hub `/salary` with browse-by-job (sorted by national median), browse-by-city, browse-by-industry sections
  - Job hubs `/salary/[job]` (20 pages) — H1 answer, 4-stat hero, cities table sorted DESC by median, career outlook sidebar, related-jobs grid, FAQ
  - City hubs `/salary/in/[city]` (10 pages) — quick stats grid (population/COL/avg/MSA code), 20-row job salary table, similar-cities grid, city-specific FAQ (state income tax logic)
  - Static segment `in` used to avoid collision with `[job]` dynamic
- **Sitemap.ts** updated: now serves **1,812 URLs** (up from ~1,325). Includes `/invoice-template/*`, `/salary`, `/salary/[job]`, `/salary/[job]/[city]`, `/salary/in/[city]`.
- All pages SSG-prerendered via `generateStaticParams` — full Next.js build completes in 42.9s.
- Data foundations:
  - `/app/frontend/src/data/pseo/jobs.ts` — 20 JOBS (BLS SOC codes, 10-yr growth %, daily tasks, entry path)
  - `/app/frontend/src/data/pseo/cities.ts` — 10 CITIES (BLS MSA codes, COL index, market summary)
  - `/app/frontend/src/data/pseo/salary-data.ts` — 200-row map (median, p25/p75/p90, entry/senior, YoY, employed)
  - `/app/frontend/src/data/pseo/professions.ts` — 250 PROFESSIONS (line items, hourly rate ranges, tax tips)
- Testing: Backend 100% (3/3 regression — health, billing plans, auth login), Frontend 100% (11/11 SSG page checks) — iteration_37

### Phase 36: Sitemap Index + IndexNow Auto-Ping (Feb 2026) -- DONE
- **Split `/sitemap.xml` into a sitemap index** with 6 sub-sitemaps:
  - `/sitemap-core.xml` — homepage, hubs, calculators, tools (77 URLs, daily, p1.0)
  - `/sitemap-salary.xml` — `/salary/*` (230 URLs, monthly, p0.8)
  - `/sitemap-invoice-templates.xml` — `/invoice-template/*` (250 URLs, monthly, p0.8)
  - `/sitemap-guides.xml` — `/guides/*` + `/learn/*` (1,189 URLs, weekly, p0.7)
  - `/sitemap-articles.xml` — `/articles/*` (59 URLs, weekly, p0.6)
  - `/sitemap-tax.xml` — `/tax-tools/*` (8 URLs, monthly, p0.7)
  - **Total: 1,813 URLs** indexed via the new index
- **IndexNow integration** — verification key file at `/655d298ff61227bda1c71de5833e8715.txt`, post-build script pings 3 endpoints (`api.indexnow.org`, `bing.com/IndexNow`, `yandex.com/indexnow`) with all URLs in chunks of 10,000
- **Google ping** — script also hits `google.com/ping?sitemap=…` (endpoint deprecated June 2023, logs softly when 404 returned)
- **Post-build hook** — `package.json` postbuild runs `tsx --env-file=.env scripts/post-build-ping.ts`; auto-skips on localhost/preview/emergent URLs to avoid noise during dev
- **robots.txt** — deleted static `/public/robots.txt` (was pointing to outdated `/api/sitemap.xml`); now generated by `app/robots.ts` which references the new sitemap index
- **Centralised data layer** at `/app/frontend/src/lib/sitemap-data.ts` — single source of truth for section configs, URL gathering, XML rendering
- **Production deploy notes**: user will manually add `https://www.realprofits.com/sitemap.xml` to Google Search Console once. Bing + Yandex auto-discover via IndexNow on every build.

### Phase 37: pSEO Phase 3 — Contract Templates (Feb 2026) -- DONE
- **631 new SSG pages** at `/contract-template/[type]/[industry]` per `RealProfits_pSEO_Plan.docx` §3
- Final pSEO inventory: 250 invoice + 231 salary + 631 contract = **1,112 deep SSG pages**
- **12 hand-crafted base templates** (NDA, MSA, Service Agreement, Independent Contractor, Photography, Web Design, Consulting, Non-Compete, License, Employment Offer, Partnership, Sales) — all written as plain-English starting points with `{{INDUSTRY}}` substitution
- **30 contract types** (`/app/frontend/src/data/pseo/contracts.ts`) — each mapped to one of the 12 base templates, ranked by search volume, with key clauses array, default term, audience (b2b/b2c/either)
- **20 industries** (`/app/frontend/src/data/pseo/industries.ts`) — each with trait tags ("regulated", "high-risk", "creative", etc.), industry-specific considerations, and pricing examples
- **Top hub** `/contract-template` — browse by type (30 cards) + browse by industry (20 tiles)
- **Type sub-hubs** `/contract-template/[type]` (30 pages) — explainer + 20-industry picker + related contracts
- **Leaf pages** `/contract-template/[type]/[industry]` (600 pages) — each contains:
  - Hero with industry-tailored H1 and intro
  - **Template preview** (full base template with `{{INDUSTRY}}` substituted)
  - Industry-specific considerations (genuinely unique per industry — verified)
  - Pricing example for that industry
  - 3-step "How to use" (Customize → Add fields → Send for signature)
  - Customization tips with regulated-industry callout
  - FAQ schema (5–6 questions, trait-driven copy)
  - 5 related contracts (same industry)
  - Legal disclaimer
  - Final CTA: deep-linked `/tools/esign/new?from=contract&type=X&industry=Y`
- **eSign banner integration** (option 2b — no backend changes): `/tools/esign/new` now reads `?from=contract&type=&industry=` via `useSearchParams` (inside Suspense) and shows a contextual banner with link back to the template. Dismissible via X. Banner is client-rendered only — no SSR cost.
- **Sitemap** — new `/sitemap-contract-templates.xml` sub-sitemap (630 URLs); sitemap index now lists **7 sub-sitemaps**, total **2,443+ indexable URLs**
- Testing: Backend 100% (3/3 regression), Frontend 100% (16/16 + Playwright banner e2e) — iteration_38
- Fixed pre-existing bug: invoice-template page titles previously rendered "| RealProfits | RealProfits" (root layout template `%s | RealProfits` was being doubled by metadata that already included it). All 5 affected pages cleaned up.

## Upcoming Tasks
- pSEO Master Plan Phase 1b+: salary comparisons (e.g., "$70K vs $90K"), more cities (target: 50 cities → 1,000 leaf pages), more jobs (target: 500 → 25,000 leaf pages) toward the 75K goal (P1)
- pSEO Master Plan Phase 3: eSign contract templates `/contract-template/[type]/[industry]` (50 contracts × 30 industries = 1,500 pages) (P1)
- Resend domain switch (`sign@realprofits.com`) — needs user DNS verification first (P1)
- Stripe live keys (P2)
- A/B test hero CTAs visibility analytics (P2)

### Phase 38: UX & Logic Polish — eSign + Invoice (Feb 2026) -- DONE
- **Issue 1 (P0) — Global auth-expiry redirect**: Both `invoice-app/api.ts` and `esign/api.ts` now dispatch a `window` event `auth:expired` on any 401 response. `AuthContext.tsx` listens globally and redirects to `/login?redirect=<currentPath>` (skips when already on `/login` etc.). Local checks in `EsignDashboard`, `EsignWizard`, and `InvoiceApp` continue to redirect on initial load.
- **Issue 2 (P0) — Open drafts from dashboard**: New route `/tools/esign/edit/[id]/page.tsx` fetches the draft and renders `EsignWizard` in "edit mode". `EsignWizard` now accepts an `initialDoc` prop, preloads title/signers/fields/settings/expiry, and starts at step 2. The Back button cannot go below step 2 in edit mode. When signers are PATCHed (which wipes server-side IDs), existing field `signer_id`s are remapped via email lookup so users don't lose their placements. Drafts now show an `Edit` button + clickable title (`data-testid="edit-draft-<id>"`, `"open-draft-<id>"`) in `EsignDashboard`.
- **Issue 3 (P1) — In Progress tab**: `EsignDashboard` filter bar now has 5 buttons: All / Draft / Sent / In Progress / Completed. The Sent tab counts only `sent` status; In Progress (`data-testid="filter-in_progress"`) shows the `partial` status docs (still labeled "In Progress" via STATUS_META).
- **Issue 4 (P1) — Drag-and-drop signer reorder**: When signing_order is "sequential", each signer row gets a `GripVertical` drag handle. HTML5 native drag-and-drop (no extra library) reorders the local `signers` array; the `order_index` is written on PATCH at step-2 commit. Helper text shows when sequential mode is active.
- **Issue 5 (P1) — Sticky field-type sidebar**: `FieldPlacer` aside now has `lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto` so the Signer/Field-type/Checkbox controls stay visible while scrolling multi-page PDFs.
- **Issue 6 (P1) — Invoice qty/description formatting**: Removed the `|| "Item"` fallback on empty descriptions in `InvoicePreviewPanel.tsx`, `InvoiceApp.tsx` PDF generator, and backend `_portal_html` in `invoices.py`. Qty now formats via a helper (`_fmt_qty` Python / inline JS) that drops `.0` from integer values (e.g., `1.0` → `1`, `2.5` → `2.5`). Unit ("hr", "item", etc.) removed from the qty column in preview, PDF, email HTML, and public portal HTML.
- **Issue 7 (P2) — Back-to-Home on dashboard**: New `Home` link with house icon at top-left of `EsignDashboard` header (`data-testid="esign-back-home"`).
- **Issue 8 (P2) — Removed usage progress bar**: The thin progress strip under "X / Y documents used" in the usage banner is gone; the banner now just shows the count and the Upgrade CTA.
- **PostgreSQL bootstrapped**: Local pod re-installed `postgresql-15` and created the `realprofits_esign` DB + `realprofits` user so the eSign module works in this fork.
- Testing: Backend 100% (8/8 pytest), Frontend 100% (8/8 Playwright UI verifications) — iteration_39

### Phase 39: eSign Signing-Time Polish (Feb 2026) -- DONE
- **Issue A — Dashboard Void button is now icon-only**: `EsignDashboard.tsx` replaces the prominent red "Void" text button on Sent/In-Progress rows with a discreet `XCircle` icon button (still `data-testid="void-<id>"`, with `title` + `aria-label` for a11y).
- **Issue B — Finish-signing card stays in view**: The `SigningPage` right-side `<aside>` is now sticky as a whole (`lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto`). Both the Active-field card and the Finish-signing/consent card remain visible while the user scrolls through multi-page PDFs.
- **Issues C + D — Read-only preview of earlier signers' signatures**: `GET /api/esign/sign/{token}` now returns two new fields:
  - `other_filled_fields[]` — every field on the document whose `signer_id != current_signer.id` AND `value IS NOT NULL` (signatures, dates, text already filled by previous signers).
  - `signers[]` — lightweight summary list (id, name, role, order_index, color, status, signed_at) for labelling.
  The `SigningPage` overlays these as non-interactive boxes (`pointer-events-none`, owner-colored border, `data-testid="other-signed-field-<fieldId>"`) so witnesses and later signers see signatures already applied by previous signers (instead of an apparently-blank document).
- New `SignerSummary` schema in `/app/backend/esign/schemas.py`.
- Testing: Backend 100% (25/25 pytest — 3 new for Issue C+D + 22 regression), Frontend 100% (all 4 issues live-verified) — iteration_40.

### Phase 39b: Signing Progress Strip (Feb 2026) -- DONE
- Added a slim **"Signing order" strip** to the top of the public `/sign/{token}` page (below the document header, above the PDF). Renders one chip per signer (sorted by `order_index`) with avatar initials in their assigned color, a check-circle for `signed`, an X-circle for `declined`, and a gold ring for the current viewer ("You're next"). CC + Witness roles get a tiny role label next to the name.
- Pure UI addition — uses the already-returned `signers[]` summary from `GET /api/esign/sign/{token}`. No backend changes.
- `data-testid="signing-progress-strip"` + `data-testid="progress-signer-<id>"` per chip. Conditional on `signers.length > 1` so single-signer flows stay clean.
- Live-verified in preview with a 4-party doc (3 signers + 1 witness): strip rendered correctly with all four chips and correct statuses.

### Phase 39c: Role-Aware Emails + Audit Trail (Feb 2026) -- DONE
- **Witness/approver/CC emails no longer say "Review & Sign Document"**: `email_service.send_signature_request` now takes a `role` argument and renders role-specific subject, preheader, body, header title and CTA label:
  - `signer` → "requested your signature on …" / "Review & Sign Document"
  - `witness` → "asked you to witness …" / "Review & Witness Document"
  - `approver` → "asked for your approval on …" / "Review & Approve Document"
  - `cc` → "shared a document with you" / "Open Document"
  Called from `/api/esign/documents/{id}/send`, the sequential-next-signer trigger in `submit`, and the `reminder_job` scheduler — all pass `s.role`.
- **Audit trail PDF (`pdf_processor.build_audit_page`) no longer prints "Status: signed" for witnesses**: when a row's `status == "signed"`, the label is mapped via role: `witness → witnessed`, `approver → approved`, `cc → received`. Non-signer roles also get a `Role: <role>` suffix for clarity.
- Verified via direct script runs: 4-role email scan and 4-role audit-PDF text extraction both PASS.

## Upcoming Tasks
- pSEO Master Plan Phase 1b+: salary comparisons, more cities (50 → 1,000 leaf pages), more jobs (500 → 25,000 leaf pages) toward the 75K goal (P1)
- pSEO Master Plan Phase 3 expansion: more contract types × industries (P1)
- Resend domain switch (`sign@realprofits.com`) — needs user DNS verification first (P1)
- Stripe live keys (P2)
- Component splitting: `EsignWizard.tsx` (637 lines) and `InvoiceApp.tsx` (810 lines) are approaching/over the 700-line guideline (P2)
- A/B test hero CTAs visibility analytics (P2)
