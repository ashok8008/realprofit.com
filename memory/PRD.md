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
- **ResumeBuilder.tsx split** from 1458 → 381 lines (orchestrator) + 6 focused sub-components:
  - `resume/EntryScreens.tsx` (312 lines): Entry, Upload, Processing, Welcome, Analysis screens
  - `resume/OnboardingScreens.tsx` (131 lines): Experience Level, Years, Industry screens
  - `resume/TemplateSelection.tsx` (98 lines): Template selection with previews
  - `resume/ATSCheckPanel.tsx` (169 lines): ATS compatibility check overlay
  - `resume/TipsPanel.tsx` (70 lines): Tips & fixes overlay
  - `resume/WizardStepContent.tsx` (362 lines): All 7 wizard form step renderers
  - `resume/constants.ts` (58 lines): Shared constants, types, sample data
- **FreelanceInvoiceGenerator.tsx** reduced from 447 → 285 lines by extracting `invoice/InvoicePDFExport.ts` (185 lines)
- **AmIUnderpaid.tsx** reduced from 366 → 183 lines by extracting `underpaid/UnderpaidResults.tsx` (145 lines)
- **Earlier code quality fixes** (from previous session): Hardcoded secrets removed, MD5 → SHA-256, `ats_check()` backend refactored into helper functions
- Testing: Backend 100% (2/2), Frontend 100% (14/14) — iteration_30

## Upcoming Tasks
- Stripe integration for monetization (P2)
- A/B test hero CTAs (P2)
