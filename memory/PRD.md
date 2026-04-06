# RealProfits - Product Requirements Document

## Overview
RealProfits is a financial + career decision platform — not just a calculator site. It provides free calculators, productive money tools, career tools, practical guides, and what-if simulations for better life decisions.

## Original Problem Statement
User migrated RealProfits from Replit to Emergent, then expanded it from a calculator site into a multi-product platform with career tools, AI-powered resume enhancements, and a complete homepage redesign.

## Architecture
- **Frontend**: React + Vite + TypeScript, Tailwind CSS, shadcn/ui, wouter, Recharts, jsPDF
- **Backend**: FastAPI with AI integration via emergentintegrations
- **Fonts**: Playfair Display (headings), Inter/Manrope (body)
- **State**: localStorage for persistence, no DB for user data

## What's Been Implemented

### April 6, 2026 - Homepage Redesign (LATEST)
- Complete homepage rewrite: 12 sections in optimized hierarchy
- New hero: "Understand Your Money, Income & Career — Instantly" + platform-representative floating cards
- "Start Here" section: 6 clickable action-oriented question cards
- "What You Can Do Here": 4-pillar platform overview (Calculators, Tools, Career, Planning)
- "Popular Tools Right Now": 6 featured tools with tags
- Career Tools hero-like dark section: "Grow Your Income, Not Just Track It"
- What-If moved higher with AreaChart gradient fill
- Tightened Calculators, Tools, Articles sections with better copy
- Redesigned Trust section: "Built to Be Useful. Designed to Be Trusted."
- Updated Footer: Career Tools link added, improved CTA copy
- Sitemap updated with 11 career tool URLs
- Testing: 100% pass (all 12 sections, navigation, responsive, no errors)

### April 6, 2026 - Phase 3 Career Tools (AI + Email + Data Refactor)
- AI "Improve with AI" buttons in Resume Builder (bullet points + summaries)
- Email Templates tool (5 types: Thank You, Follow Up, Negotiation, Accept, Decline)
- Refactored SalaryComparison & AmIUnderpaid to use centralized salaryBenchmarks.ts

### Earlier Completed Work
- Full Replit migration (Jan 2026)
- 39+ financial calculators, 7 productive tools
- 9 career tools (Resume Builder, Cover Letter, Salary Comparison, Am I Underpaid, Resume Score, Job Readiness, Offer Comparison, Salary Negotiation, Interview Prep)
- 5 premium PDF resume templates
- Bug fixes (tax calc, earnings, download icons, "100% Free" badges)
- Structured salary benchmark dataset (90+ entries, 15+ job families)

## Key API Endpoints
- GET /api/health
- POST /api/career-tools/improve-bullet
- POST /api/career-tools/improve-summary
- POST /api/career-tools/email-template
- GET /api/career-tools/email-templates

## Homepage Section Order
1. Hero (platform messaging)
2. Start Here (6 action questions)
3. What You Can Do (4 pillars)
4. Popular Tools (6 featured)
5. Career Tools (dark hero-like)
6. What-If Simulator (chart)
7. Financial Calculators (6 featured + "View All 39+")
8. Productive Tools (6 tools)
9. Articles & Guides (subordinated)
10. Trust (4 pillars)
11. Email CTA (in footer)
12. Footer (with career tools link)

## Prioritized Backlog

### P0 — All Complete
- [x] Migration, all calculators/tools functional
- [x] Career Tools (10 tools with AI)
- [x] Homepage redesign
- [x] Email templates
- [x] Salary data refactor
- [x] Sitemap updated with career tools

### P1 (Next)
- [ ] Google Analytics tracking verification
- [ ] SEO meta tags audit across all pages
- [ ] Performance optimization (lazy loading images, code splitting)

### P2 (Future)
- [ ] Premium ATS resume checks
- [ ] User accounts / saved profiles (auth + DB)
- [ ] Expand article content
- [ ] A/B test hero CTAs
