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
- **Variation Engine** (`variationEngine.ts`): 72 unique intros x 72 explanations x 12 comparisons x 12 PP summaries x varied FAQs
- **Template Keys**: 3 salary buckets x 4 cost tiers x 2 tax profiles = 24 keys x 3 variants each
- **Content Blocks**: intro, explanation, purchasing power summary, city comparison, 6 city-aware FAQs
- **Dynamic Sitemap**: Next.js `sitemap.ts` (842+ URLs)
- **Datasets**: Salary, Tax, Savings, Mortgage, Debt, Freelancer, Location-Salary

## What's Been Implemented

### Phase 1: Core Platform -- DONE
### Phase 2: pSEO Engine -- DONE
### Phase 3: Resume Builder Refactor -- DONE
### Phase 4: Deployment Fixes -- DONE
### Phase 5: Next.js Migration (Feb 2026) -- DONE
### Phase 6: Cost Tier Classification Engine (Feb 2026) -- DONE
### Phase 7: Deployment Build Fix (Feb 2026) -- DONE
### Phase 8: Analytics Migration (Feb 2026) -- DONE
### Phase 9: Code Quality Fixes (Feb 2026) -- DONE

### Phase 10: Deployment .gitignore Fix (Feb 2026) -- DONE
- Fixed critical deployment blocker: `.gitignore` contained 5 repeated `*.env` / `*.env.*` ignore patterns (lines 52-71) that prevented `.env` files from being committed
- This caused production deployments to lack environment variables (`NEXT_PUBLIC_BACKEND_URL`, `EMERGENT_LLM_KEY`), resulting in "Not Found" on custom domain
- Both `frontend/.env` and `backend/.env` are now tracked by git and will deploy correctly

## Upcoming Tasks
- Sensitive Data in localStorage (P1) - Move financial state from localStorage to secure handling
- Large Components to Split (P2) - Refactor FreelanceInvoiceGenerator, Home, WhatIfSimulator
- Scale pSEO location pages to 50+ cities (P1)
- Premium ATS checks for Resume Builder (P2)
- Saved user profiles / Database Integration (P2)
- Stripe integration for monetization (P2)
- A/B test hero CTAs (P2)
