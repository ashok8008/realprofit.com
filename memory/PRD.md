# RealProfits - Product Requirements Document

## Overview
RealProfits is a financial + career decision platform with free calculators, tools, career tools, guides, and what-if simulations. Organic traffic via pSEO is the primary acquisition channel.

## Architecture
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Backend**: FastAPI + GPT-4o-mini via emergentintegrations (Emergent LLM Key)
- **State**: localStorage (data, AI usage, resume score)
- **SSR/SSG**: pSEO pages are server components with generateMetadata for SEO
- **Deployment**: Emergent native deployment (Kubernetes containerization)

## Tech Stack Migration (Feb 2026)
- **From**: React + Vite + Wouter + react-helmet-async (SPA, client-rendered)
- **To**: Next.js 16 App Router (server-rendered pSEO pages, client components for interactive tools)
- **Key Changes**:
  - `wouter` Link/useParams → `next/link` + `next/navigation`
  - `react-helmet-async` → Next.js Metadata API (`generateMetadata`)
  - Vite build → Next.js build with `@tailwindcss/postcss`
  - `src/pages/` renamed to `src/views/` (avoid Next.js Pages Router conflict)
  - Environment vars: `REACT_APP_*` → `NEXT_PUBLIC_*`

## SEO Strategy
- **Server-rendered pSEO**: 700+ guide pages with full HTML in initial response
- **Metadata**: Unique title, description, OG tags, canonical URL per page
- **JSON-LD**: HowTo, FAQPage, BreadcrumbList schemas on every guide
- **Sitemap**: Next.js built-in `app/sitemap.ts` generating all URLs
- **Robots**: `app/robots.ts` with crawler rules
- **Variation Engine**: Prevents duplicate content across programmatic pages

## pSEO System
- **Datasets**: Salary, Tax, Savings, Mortgage, Debt, Freelancer, Location-Salary
- **Variation Engine** (`variationEngine.ts`): City-aware content generation
- **Dynamic Sitemap**: Both Next.js sitemap.ts and FastAPI `/api/sitemap`
- **City-Aware Templates**: Location-salary pages inject cityName, costTier, hasStateTax

## AI Usage Strategy
- **Smart Improve** (free, unlimited): Rule-based rewriting + template generation
- **AI Improve** (limited, 3 total uses): GPT-4o-mini, shared pool across all features
- **Resume Score**: 100% deterministic, zero AI, real-time updates

## What's Been Implemented

### Phase 1: Core Platform
- Financial calculators (salary, tax, savings, mortgage, debt, freelancer)
- Career tools: Resume Builder, Email Templates, Salary Benchmarks
- Homepage with hero, features, guides hub

### Phase 2: pSEO Engine
- Built variation engine for unique text generation across all guide types
- Dynamic sitemap endpoint (842 URLs)
- 7 dataset types with city-aware location-salary guides

### Phase 3: Resume Builder Refactor
- Modularized ResumeBuilder.tsx into sub-components

### Phase 4: Deployment Fixes (Feb 2026)
- Fixed .gitignore, created frontend/.env, updated API URLs

### Phase 5: Next.js Migration (Feb 2026)
- Migrated entire frontend from React Vite SPA to Next.js 16 App Router
- All pSEO pages now server-rendered with generateMetadata
- OG tags, canonical URLs, JSON-LD schemas in initial HTML
- Built-in sitemap.ts and robots.ts
- All 18 tests passed (100% success rate)

## Upcoming Tasks
- Scale pSEO location pages to 2000+ (P1)
- Premium ATS checks for Resume Builder (P2)
- Saved user profiles / Database Integration (P2)
- Stripe integration for monetization (P2)
- A/B test hero CTAs (P2)
