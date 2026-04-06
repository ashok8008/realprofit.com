# RealProfits - Product Requirements Document

## Overview
RealProfits is a financial + career decision platform with free calculators, productive money tools, career tools, guides, and what-if simulations.

## Architecture
- **Frontend**: React + Vite + TypeScript, Tailwind CSS, shadcn/ui, wouter, Recharts, jsPDF
- **Backend**: FastAPI + GPT-4o-mini via emergentintegrations (optimized short prompts)
- **Fonts**: Playfair Display (headings), Inter/Manrope (body)
- **State**: localStorage (data persistence + AI usage tracking)
- **Code Splitting**: React.lazy() + Suspense for all route pages except Home

## AI Usage Strategy (Hybrid)
- **Smart Improve** (free, unlimited): Rule-based engine rewrites weak verbs, removes generic phrases, fixes passive voice, capitalizes bullets
- **AI Improve** (limited, 3 total uses): GPT-4o-mini for advanced rewriting, shared pool across all features
- **Smart suggestions**: Grammarly-style inline analysis (always visible, always free)
- **Tracking**: localStorage key `rp_ai_uses_v2` → `{totalUsed: number}`
- **Backend**: Optimized single API call per endpoint, short prompts, GPT-4o-mini (~33x cheaper than GPT-4o)

## What's Been Implemented

### April 6, 2026 - Hybrid AI Strategy (LATEST)
- Dual-button system: "Smart Improve" (teal, free) + "AI Improve" (violet, limited)
- 3 total free AI uses shared across resume + email features
- Rule-based rewriting: weak verbs → strong verbs, generic phrases → specific alternatives
- Static email templates as always-free fallback
- AI remaining counter (X/3) on all buttons
- "AI limit reached" message directing to Smart Improve
- Backend optimized: short prompts, single API call per endpoint, GPT-4o-mini
- Testing: 100% pass (10/10 backend, all frontend flows)

### April 6, 2026 - Performance + Quick Salary Check
- Quick Salary Check hero widget (instant market badge, zero API cost)
- React.lazy() code splitting for all 18 route pages
- Lazy-loaded Recharts (HeroCharts, WhatIfChart)

### April 6, 2026 - Homepage Redesign
- 12-section platform-positioning homepage
- Hero → Start Here → Pillars → Popular Tools → Career Tools → What-If → Calculators → Tools → Articles → Trust

### Earlier
- Full Replit migration, 39+ calculators, 7 tools, 10 career tools
- AI resume/email generation, 5 PDF templates, salary benchmarks, sitemap update

## Key API Endpoints
- GET /api/health
- POST /api/career-tools/improve-bullet (GPT-4o-mini, optimized)
- POST /api/career-tools/improve-summary (GPT-4o-mini, optimized)
- POST /api/career-tools/email-template (GPT-4o-mini, optimized)
- GET /api/career-tools/email-templates

## Prioritized Backlog

### P0 — All Complete
- [x] Full platform migration and all tools
- [x] Homepage redesign (12 sections)
- [x] Quick Salary Check + code splitting
- [x] Hybrid AI strategy (Smart + AI dual buttons, 3 free AI uses)

### P1 (Next)
- [ ] Google Analytics tracking verification
- [ ] SEO meta tags audit
- [ ] Sitemap career tools URLs

### P2 (Future)
- [ ] Premium ATS resume checks
- [ ] User accounts / saved profiles
- [ ] A/B test hero CTAs
