# RealProfits - Product Requirements Document

## Overview
RealProfits is a financial + career decision platform — not just a calculator site. It provides free calculators, productive money tools, career tools, practical guides, and what-if simulations for better life decisions.

## Architecture
- **Frontend**: React + Vite + TypeScript, Tailwind CSS, shadcn/ui, wouter, Recharts, jsPDF
- **Backend**: FastAPI with AI integration via emergentintegrations
- **Fonts**: Playfair Display (headings), Inter/Manrope (body)
- **State**: localStorage for persistence
- **Code Splitting**: React.lazy() + Suspense for all route pages except Home
- **Lazy Charts**: Recharts loaded on-demand (HeroCharts, WhatIfChart components)

## What's Been Implemented

### April 6, 2026 - Performance Optimization & Quick Salary Check (LATEST)
- Quick Salary Check interactive widget in hero section (job title + salary → instant market badge)
- React.lazy() code splitting for all 18 route pages (only Home stays eager)
- Suspense fallback with PageLoader spinner
- Lazy-loaded Recharts components (HeroCharts.tsx, WhatIfChart.tsx) for faster initial load
- Testing: 100% pass (widget, code splitting, lazy charts, all routes, no console errors)

### April 6, 2026 - Homepage Redesign
- 12-section platform-positioning homepage
- Hero: "Understand Your Money, Income & Career — Instantly"
- Start Here (6 action questions), What You Can Do (4 pillars), Popular Tools, Career Tools dark section
- What-If simulator, Calculators, Tools, Articles, Trust, Footer sections
- Sitemap updated with 11 career tool URLs

### April 6, 2026 - Phase 3 Career Tools (AI + Email + Data Refactor)
- AI "Improve with AI" buttons in Resume Builder
- Email Templates tool (5 types)
- Refactored salary tools to use centralized salaryBenchmarks.ts

### Earlier
- Full Replit migration, 39+ calculators, 7 tools, 10 career tools
- 5 premium PDF resume templates, bug fixes, structured salary benchmarks

## Key API Endpoints
- GET /api/health
- POST /api/career-tools/improve-bullet
- POST /api/career-tools/improve-summary
- POST /api/career-tools/email-template
- GET /api/career-tools/email-templates

## Homepage Section Order
1. Hero (platform messaging + Quick Salary Check widget)
2. Start Here (6 action questions)
3. What You Can Do (4 pillars)
4. Popular Tools (6 featured)
5. Career Tools (dark hero-like)
6. What-If Simulator (lazy chart)
7. Financial Calculators (6 featured + "View All 39+")
8. Productive Tools (6 tools)
9. Articles & Guides
10. Trust (4 pillars)
11. Email CTA (footer)
12. Footer (with career tools link)

## Code Splitting Architecture
- Home.tsx: Eager loaded (always first page)
- All other pages: React.lazy() with Suspense boundary
- Heavy components: HeroCharts.tsx, WhatIfChart.tsx lazy-loaded within Home
- Suspense fallback: PageLoader spinner component

## Prioritized Backlog

### P0 — All Complete
- [x] Migration, all calculators/tools functional
- [x] Career Tools (10 tools with AI)
- [x] Homepage redesign (12 sections)
- [x] Quick Salary Check hero widget
- [x] Performance optimization (code splitting + lazy charts)

### P1 (Next)
- [ ] Google Analytics tracking verification
- [ ] SEO meta tags audit across all pages

### P2 (Future)
- [ ] Premium ATS resume checks
- [ ] User accounts / saved profiles (auth + DB)
- [ ] Expand article content
- [ ] A/B test hero CTAs
