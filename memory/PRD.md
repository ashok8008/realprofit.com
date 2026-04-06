# RealProfits - Product Requirements Document

## Overview
RealProfits is a financial + career decision platform with free calculators, productive money tools, career tools, guides, and what-if simulations.

## Architecture
- **Frontend**: React + Vite + TypeScript, Tailwind CSS, shadcn/ui, wouter, Recharts, jsPDF
- **Backend**: FastAPI + GPT-4o-mini via emergentintegrations (optimized short prompts)
- **State**: localStorage (data, AI usage, resume score)
- **Code Splitting**: React.lazy() + Suspense for all route pages except Home

## AI Usage Strategy (Hybrid)
- **Smart Improve** (free, unlimited): Rule-based rewriting + template generation
- **AI Improve** (limited, 3 total uses): GPT-4o-mini, shared pool across all features
- **Smart Suggestions**: Grammarly-style inline analysis (always visible, always free)
- **Resume Score**: 100% deterministic, zero AI, real-time updates

## Resume Score System
- **Total**: 100 points across 5 categories
  - Completeness (30): name, email, summary, experience, education, skills
  - Content Quality (25): action verbs, bullet length
  - Impact (25): numbers/metrics in bullets
  - Structure & Readability (10): bullet count, summary length
  - ATS Safety (10): format, special chars, email validity
- **Suggestions**: Severity-ranked (critical → low), with +Xpts indicators
- **Fix Buttons**: Navigate to relevant tab and auto-trigger actions
- **Labels**: Getting Started → Needs Work → Fair → Good → Excellent

## What's Been Implemented

### April 6, 2026 - pSEO Engine Upgrade (LATEST)
- Variation engine with value-bucket-based content differentiation (3 buckets x 3 variants x 6 types)
- 3 new guide clusters: mortgage (65 pages), debt (30 pages), freelancer (38 pages)
- Expanded existing clusters: salary (60), tax (60), savings (34)
- Dynamic sitemap endpoint: GET /api/sitemap.xml (422+ URLs, auto-generated)
- Sitemap stats API: GET /api/sitemap/stats
- Updated Guides Hub with all 6 sections + collapsible variant sections
- Testing: 100% pass (18/18 tests)

### April 6, 2026 - Resume Score System
- Deterministic scoring engine (resumeScore.ts) — 5 categories, 100 points
- Real-time score circle with animated progress ring
- Category breakdown bars (color-coded)
- Up to 8 actionable suggestions with severity ranking
- "Fix" buttons that navigate to correct tab + trigger actions
- Points-to-gain indicators (+Xpts)
- Testing: 100% pass (14/14 tests)

### April 6, 2026 - Hybrid AI Strategy
- Dual buttons: Smart Improve (free) + AI Improve (3 uses)
- Rule-based rewriting engine (weak verbs, generic phrases, passive voice)
- Static email templates fallback
- Shared AI counter, GPT-4o-mini (33x cheaper)

### April 6, 2026 - Performance + Quick Salary Check
- Quick Salary Check hero widget
- React.lazy() code splitting

### April 6, 2026 - Homepage Redesign
- 12-section platform homepage

### Earlier
- Full migration, 39+ calculators, 7 tools, 10 career tools
- AI resume/email, 5 PDF templates, salary benchmarks

## pSEO System (Scalable, 1000+ page ready)
- **Variation Engine** (`variationEngine.ts`): value-bucket-based (low/mid/high) intro, explanation, FAQ generators. 3 variants per bucket per type = unique content across pages.
- **6 Guide Clusters**: salary (60), tax (60), savings (34), mortgage (65), debt (30), freelancer (38) = **287 guide pages**
- **Dynamic Sitemap**: `GET /api/sitemap.xml` generates 422+ URLs dynamically from all datasets, calculators, tools, articles. No manual updates needed.
- **Datasets**: `/lib/pseo/datasets/` — algorithmic generation from amount ranges, preserving all legacy slugs
- **Anti-duplication**: Bucket-varied intros + modulo-rotated variants within same bucket

## Key API Endpoints
- GET /api/health
- POST /api/career-tools/improve-bullet (GPT-4o-mini)
- POST /api/career-tools/improve-summary (GPT-4o-mini)
- POST /api/career-tools/email-template (GPT-4o-mini)
- GET /api/sitemap.xml (dynamic sitemap)
- GET /api/sitemap/stats (page count stats)

## Prioritized Backlog

### P0 — All Complete
- [x] Full platform migration
- [x] Homepage redesign
- [x] Quick Salary Check + code splitting
- [x] Hybrid AI (Smart + AI, 3 free uses)
- [x] Resume Score system (100pt, 5 categories, real-time)
- [x] pSEO engine upgrade (variation engine, 6 clusters, dynamic sitemap, 287+ pages)

### P1 (Next)
- [ ] Refactor ResumeBuilder.tsx into sub-components
- [ ] Google Analytics tracking verification
- [ ] SEO meta tags audit

### P2 (Future)
- [ ] Premium ATS resume checks
- [ ] User accounts / saved profiles
- [ ] A/B test hero CTAs
- [ ] Expand pSEO to 1000+ pages (add more amounts to dataset arrays)
