# RealProfits - Product Requirements Document

## Overview
RealProfits is a financial + career decision platform. Organic traffic via pSEO is the primary acquisition channel.

## Architecture
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + GPT-4o-mini via emergentintegrations
- **State**: localStorage
- **SSR/SSG**: pSEO pages are server components with generateMetadata
- **Deployment**: Emergent native (Kubernetes)

## pSEO System
- **Cost Tier Engine** (`costTier.ts`): Classifies cities by COL + rent into low/moderate/high/very-high
- **Variation Engine** (`variationEngine.ts`): 72 unique intros × 72 explanations × 12 comparisons × 12 PP summaries × varied FAQs
- **Template Keys**: 3 salary buckets × 4 cost tiers × 2 tax profiles = 24 keys × 3 variants each
- **Content Blocks**: intro, explanation, purchasing power summary, city comparison, 6 city-aware FAQs
- **Dynamic Sitemap**: Next.js `sitemap.ts` (842+ URLs)
- **Datasets**: Salary, Tax, Savings, Mortgage, Debt, Freelancer, Location-Salary

## What's Been Implemented

### Phase 1: Core Platform — DONE
### Phase 2: pSEO Engine — DONE
### Phase 3: Resume Builder Refactor — DONE
### Phase 4: Deployment Fixes — DONE
### Phase 5: Next.js Migration (Feb 2026) — DONE
### Phase 6: Cost Tier Classification Engine (Feb 2026) — DONE
- Created `src/lib/pseo/costTier.ts` with: getCostTier (COL + rent), getTaxProfile, getCostTierLabel, getPurchasingPowerBand, getContrastCity, getRentBurdenLevel
- Expanded variationEngine: 72+ unique intros, 72+ explanations (from ~7 generic), 12 comparison variants with contrasting city refs, 12 purchasing power summaries, 6 city-aware FAQs with 3 question phrasings each
- Added new page sections: "Your Purchasing Power in [City]" and enhanced "vs National Average" with contrasting cities
- Deduplication: from ~7 generic variants → 5,184+ unique intro×explanation pairs
- All 14 tests passed (100% success rate)

### Phase 7: Deployment Build Fix (Feb 2026) — DONE
- Deleted obsolete `src/views/PseoPage.tsx` (imported removed `wouter` package)
- Fixed TypeScript strict error in `src/components/tools/IncomeTracker.tsx` (invalid `textTransform` SVG prop on Recharts `YAxis`)
- Fixed TypeScript strict error in `src/lib/career-tools/storage.ts` (`useRef` missing initial argument)
- `yarn build` now passes cleanly — 700+ pSEO pages generated successfully

### Phase 8: Analytics Migration (Feb 2026) — DONE
- Migrated GTM (GTM-KQ9BHG4B) and GA4 (G-7PX07P6BKF) from old Vite `index.html` to Next.js `layout.tsx`
- Used `next/script` with `beforeInteractive` (GTM) and `afterInteractive` (GA4) strategies
- Added GTM noscript iframe fallback in `<body>`
- Added missing SEO meta tags: geo.region, geo.placename, rating, distribution, enhanced robots directive
- Deleted dead Vite `index.html` artifact

### Phase 9: Code Quality Fixes (Feb 2026) — DONE
- Fixed XSS: sanitized JSON-LD `dangerouslySetInnerHTML` with `\\u003c` escaping in Seo.tsx and guides/[slug]/page.tsx
- Fixed 7 empty catch blocks across tool components + smartSuggestions (added console.error)
- Fixed stale closure in use-toast.ts (dependency `[state]` → `[]`)
- Replaced array-index-as-key with stable keys (slug/href/title) across Home.tsx, CareerToolsHub.tsx, CalculatorHub.tsx, ToolsHub.tsx
- Refactored server.py `dynamic_sitemap()` from 206-line monolith → extracted constants, `_build_sitemap_url()`, `_build_guide_urls()` helpers
- Fixed Python lint: ambiguous variable names, unnecessary f-string

## Upcoming Tasks
- Scale pSEO location pages to 2000+ cities (P1)
- Premium ATS checks for Resume Builder (P2)
- Saved user profiles / Database Integration (P2)
- Stripe integration for monetization (P2)
- A/B test hero CTAs (P2)
