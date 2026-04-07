# RealProfits - Product Requirements Document

## Overview
RealProfits is a financial + career decision platform. Organic traffic via pSEO is the primary acquisition channel.

## Architecture
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + GPT-4o-mini via emergentintegrations + MongoDB (motor async)
- **Auth**: JWT (httpOnly cookies, 15min access + 7-day refresh tokens, bcrypt, brute force protection)
- **State**: MongoDB for authenticated users, localStorage fallback for anonymous
- **SSR/SSG**: pSEO pages are server components with generateMetadata
- **Deployment**: Emergent native (Kubernetes)

## Database Schema
- **users**: email (unique), password_hash, name, role, created_at
- **login_attempts**: identifier (IP:email), count, locked_until
- **password_reset_tokens**: token, user_id, expires_at, used (TTL index)
- **user_data**: user_id + tool_key (compound unique), data (any), created_at, updated_at

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

### Phase 19: Resume Builder Premium UI Redesign (Apr 2026) -- DONE
- Restructured editor into 2-column desktop layout (xl breakpoint):
  - Left: Template picker (dark selected state) → Icon tab navigation → Form editor
  - Right (sticky): Score panel → Quick Fixes → Live Preview → Export
- Score panel redesigned: 3 conceptual groups (ATS Readiness, Recruiter Readability, Impact Strength) from 7 flat bars
- Quick Fix cards with severity-colored borders, +point badges, and inline Fix buttons
- CareerToolDetail wrapper cleaned up: removed amber alert, simpler header, max-w-7xl
- Below-the-fold sections (How It Works, FAQs, Related Tools) refined with cleaner cards
- Premium aesthetic: monochrome palette, generous whitespace, subtle borders, refined typography
- Testing: Frontend 100% (31/31) — iteration_19

## Upcoming Tasks
- Premium ATS checks for Resume Builder (P2)
- Stripe integration for monetization (P2)
- A/B test hero CTAs (P2)
- "Share Your Score" feature for organic growth (Backlog)
