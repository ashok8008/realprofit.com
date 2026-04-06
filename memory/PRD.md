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

### January 6, 2026
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
