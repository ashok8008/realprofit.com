# RealProfits - Product Requirements Document

## Overview
RealProfits is a financial + career decision platform with free calculators, productive money tools, career tools, guides, and what-if simulations.

## Architecture
- **Frontend**: React + Vite + TypeScript, Tailwind CSS, shadcn/ui, wouter, Recharts, jsPDF
- **Backend**: FastAPI + GPT-4o-mini via emergentintegrations (optimized short prompts)
- **State**: localStorage (data, AI usage, resume score)
- **Code Splitting**: React.lazy() + Suspense for all route pages except Home
- **Deployment**: Emergent native deployment (Kubernetes containerization)

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
- **Suggestions**: Severity-ranked (critical -> low), with +Xpts indicators
- **Fix Buttons**: Navigate to relevant tab and auto-trigger actions
- **Labels**: Getting Started -> Needs Work -> Fair -> Good -> Excellent

## pSEO System
- **Variation Engine** (`variationEngine.ts`): Prevents duplicate content across 700+ programmatic pages
- **Dynamic Sitemap**: FastAPI `/api/sitemap.xml` generates XML on the fly (842 URLs)
- **Datasets**: Salary, Tax, Savings, Mortgage, Debt, Freelancer, Location-Salary
- **City-Aware Templates**: Location-salary pages inject cityName, costTier, hasStateTax for unique content
- **Rendering**: Single `PseoPage.tsx` component handles all guide types via slug matching

## What's Been Implemented

### Phase 1: Core Platform
- Financial calculators (salary, tax, savings, mortgage, debt, freelancer)
- Career tools: Resume Builder, Email Templates, Salary Benchmarks
- Homepage with hero, features, guides hub

### Phase 2: pSEO Engine
- Built variation engine for unique text generation across all guide types
- Dynamic sitemap endpoint (842 URLs)
- 7 dataset types with city-aware location-salary guides
- Self-audit confirmed LOW duplication risk

### Phase 3: Resume Builder Refactor
- Modularized ResumeBuilder.tsx into sub-components
- ResumeScorePanel, PersonalTab, ExperienceTab, etc.

### Phase 4: Deployment Fixes (Feb 2026)
- Fixed `.gitignore` blocking `.env` files from deployment
- Created `frontend/.env` with `REACT_APP_BACKEND_URL`
- Updated `vite.config.ts` with `envPrefix` to expose `REACT_APP_*` vars
- Updated all frontend fetch calls to use `import.meta.env.REACT_APP_BACKEND_URL`

## Upcoming Tasks
- Scale pSEO location pages to 2000+ (P1)
- Premium ATS checks for Resume Builder (P2)
- Saved user profiles / Database Integration (P2)
- Stripe integration for monetization (P2)
- A/B test hero CTAs (P2)
