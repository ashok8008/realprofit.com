# RealProfits - Product Requirements Document

## Overview
RealProfits is a production-ready SEO-first personal finance content website providing free calculators, expert insights, and powerful simulations for financial planning.

## Original Problem Statement
User requested migration of RealProfits site from Replit to Emergent platform.

## Architecture
- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: wouter
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **SEO**: react-helmet-async
- **Backend**: Minimal FastAPI (health check only - frontend-only app)

## User Personas
- Individuals seeking financial literacy
- Freelancers managing taxes and income
- People planning savings, investments, debt payoff
- First-time home buyers
- USA-only audience

## Core Requirements (Static)
1. Financial Calculators (39+)
2. Interactive Tools (7)
3. Educational Articles (55)
4. pSEO Guide Pages (129+)
5. What-If Simulator
6. Mobile-responsive design
7. SEO optimization

## What's Been Implemented

### January 6, 2026 - Career Tools Platform
- ✅ Built new top-level "Career Tools" section with 6 fully functional tools
- ✅ Added Career Tools navigation link between Productive Tools and Guides
- ✅ Created Career Tools Hub page at /career-tools with hero, popular tools, how it works sections
- ✅ Resume Builder: Multi-tab form, 3 templates, live preview, PDF export, localStorage persistence
- ✅ Cover Letter Generator: Template-based generation, tone/length options, copy/PDF export
- ✅ Salary Comparison Tool: Market benchmarks for 25+ roles, location multipliers, charts
- ✅ Am I Underpaid?: Gauge visualization, market range assessment, action suggestions
- ✅ Resume Score: Analyze builder data or pasted text, category breakdowns, improvement checklist
- ✅ Job Readiness Score: Comprehensive checklist, progress visualization, tool recommendations
- ✅ Added Career Tools section to homepage with dark theme design
- ✅ All tools work without login, data saved in localStorage
- ✅ Internal linking between related tools and existing calculators/guides

### January 6, 2026 - Update 2
- ✅ Added "100% FREE - No signup required" badge to Calculators hub hero
- ✅ Added "100% FREE - No signup required" badge to Tools hub hero  
- ✅ Fixed Side Hustle Earnings calculator to show Weekly, Monthly, AND Annual values
- ✅ Added download arrow icon to PDF export buttons
- ✅ Verified tax calculators working correctly

### January 6, 2026 - Initial Migration
- ✅ Successfully migrated RealProfits from Replit to Emergent platform
- ✅ Converted pnpm monorepo structure to standalone yarn project
- ✅ Removed Replit-specific plugins and dependencies
- ✅ Updated vite.config.ts for Emergent environment
- ✅ Fixed tsconfig.json to remove monorepo references
- ✅ All 39+ calculators working (Mortgage, Debt Payoff, Compound Interest, etc.)
- ✅ All 7 tools working (Invoice Generator, Subscription Analyzer, etc.)
- ✅ What-If Simulator functional with interactive sliders and charts
- ✅ Search functionality working
- ✅ 129+ pSEO guide pages accessible
- ✅ Navigation and routing working correctly

## Features by Category

### Career Tools (NEW)
1. Resume Builder (PDF export, ATS-friendly templates)
2. Cover Letter Generator (template-based)
3. Salary Comparison Tool (25+ role benchmarks)
4. Am I Underpaid? (market assessment)
5. Resume Score (completeness analysis)
6. Job Readiness Score (checklist assessment)
7. Offer Comparison Tool (coming soon)
8. Salary Negotiation Helper (coming soon)

### Financial Calculators
- Mortgage Calculator
- Debt Snowball/Avalanche Calculator
- Compound Interest Calculator
- Savings Goal Calculator
- Tax Estimators
- Investment Growth Calculator
- And 30+ more

### Interactive Tools
1. Freelance Invoice Generator (PDF export)
2. Subscription Cost Analyzer
3. Bill Split Tool
4. Net Worth Calculator
5. Paycheck Calculator
6. Income Tracker
7. Expense Tracker

### Content
- 55 articles across 8 categories
- 129+ pSEO guide pages (salary, tax, savings guides)
- Trust pages (About, Contact, Privacy, Terms, Editorial Policy, Disclaimer)

## Prioritized Backlog

### P0 (Critical) - Completed
- [x] Migration from Replit to Emergent
- [x] All calculators functional
- [x] All tools functional
- [x] Navigation working

### P1 (High Priority)
- [ ] Add Google Analytics tracking (GTM configured but needs verification)
- [ ] Verify all SEO meta tags are rendering correctly
- [ ] Test PDF export functionality in tools

### P2 (Medium Priority)
- [ ] Add more calculators as needed
- [ ] Expand article content
- [ ] Performance optimization

## Technical Notes
- Frontend runs on port 3000
- Backend (minimal) runs on port 8001
- Data stored in TypeScript files (no database needed)
- localStorage used for tool data persistence

## Next Tasks
1. Consider adding more financial calculators based on user demand
2. Expand article library for SEO
3. Add user accounts for saving calculator results (optional future feature)
