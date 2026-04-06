# RealProfits - Product Requirements Document

## Overview
RealProfits is a production-ready SEO-first personal finance content website providing free calculators, expert insights, and powerful simulations for financial planning. It also includes a comprehensive Career Tools suite.

## Original Problem Statement
User requested migration of RealProfits site from Replit to Emergent platform, followed by building out a robust Career Tools section with 9+ tools, AI-powered resume enhancements, structured salary benchmarks, and email templates.

## Architecture
- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: wouter
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **SEO**: react-helmet-async
- **Backend**: FastAPI with AI integration via emergentintegrations
- **AI**: Emergent LLM Key (EMERGENT_LLM_KEY) for resume improvements and email generation

## User Personas
- Individuals seeking financial literacy
- Freelancers managing taxes and income
- Job seekers building resumes, comparing salaries, preparing for interviews
- People planning savings, investments, debt payoff
- First-time home buyers
- USA-only audience

## Core Requirements
1. Financial Calculators (39+)
2. Interactive Tools (7)
3. Educational Articles (55)
4. pSEO Guide Pages (129+)
5. What-If Simulator
6. Career Tools (10 tools)
7. AI-powered resume enhancement
8. Structured salary benchmark dataset
9. Mobile-responsive design
10. SEO optimization

## What's Been Implemented

### February 6, 2026 - Phase 3 Career Tools (AI + Email + Data Refactor)
- AI-powered "Improve with AI" buttons in Resume Builder for bullet points and summaries
- AI calls backend POST /api/career-tools/improve-bullet and /api/career-tools/improve-summary
- Accept/Dismiss workflow for AI suggestions with visual feedback
- Email Templates tool: 5 types (Thank You, Follow Up, Negotiation, Accept, Decline)
- AI-generated emails via POST /api/career-tools/email-template
- Refactored SalaryComparison and AmIUnderpaid to use centralized salaryBenchmarks.ts
- salaryBenchmarks.ts: 90+ entries, 15+ job families, location-aware with utility functions
- All features tested: 100% backend (11/11), 100% frontend

### January 6, 2026 - Phase 2 Career Tools
- Added 3 Phase 2 tools: Offer Comparison, Salary Negotiation Helper, Interview Prep
- Expanded salary benchmark data from 25 to 80+ roles across 8 categories
- Added cost of living data for all 40+ states
- Added 2 premium PDF templates (Executive, Modern)
- All 9 Career Tools fully functional

### January 6, 2026 - Career Tools Platform
- Built Career Tools section with 6 tools
- Resume Builder, Cover Letter Generator, Salary Comparison, Am I Underpaid, Resume Score, Job Readiness Score
- PDF export, localStorage persistence, internal linking

### January 6, 2026 - Bug Fixes & Enhancements
- "100% FREE" badges, download arrows, tax calculation fixes, side hustle earnings fix

### January 6, 2026 - Initial Migration
- Migrated from Replit to Emergent platform
- All 39+ calculators, 7 tools, What-If Simulator working

## Features by Category

### Career Tools (10 Tools)
1. Resume Builder (5 PDF templates, AI-powered improvement)
2. Cover Letter Generator (template-based)
3. Salary Comparison Tool (centralized benchmark dataset)
4. Am I Underpaid? (market assessment with gauge, centralized data)
5. Resume Score (completeness analysis)
6. Job Readiness Score (checklist assessment)
7. Offer Comparison Tool (compare up to 5 offers)
8. Salary Negotiation Helper (script generator)
9. Interview Prep Tool (STAR method, tracker)
10. Email Templates (AI-generated: thank you, follow up, negotiation, accept, decline)

### Financial Calculators (39+)
- Mortgage, Debt Snowball/Avalanche, Compound Interest, Tax Estimators, etc.

### Interactive Tools (7)
- Freelance Invoice Generator, Subscription Analyzer, Bill Split, Net Worth, Paycheck, Income/Expense Tracker

### Content
- 55 articles, 129+ pSEO guides, trust pages

## Key API Endpoints
- GET /api/health
- POST /api/career-tools/improve-bullet
- POST /api/career-tools/improve-summary
- POST /api/career-tools/email-template
- GET /api/career-tools/email-templates

## Prioritized Backlog

### P0 (Critical) — All Complete
- [x] Migration from Replit
- [x] All calculators & tools functional
- [x] Career Tools (10 tools)
- [x] AI resume enhancement
- [x] Email templates
- [x] Salary data refactor

### P1 (High Priority)
- [ ] Google Analytics tracking verification
- [ ] SEO meta tags verification
- [ ] Performance optimization

### P2 (Medium Priority)
- [ ] Premium ATS resume checks
- [ ] User accounts / saved profiles (auth + DB)
- [ ] Expand article content

## Technical Notes
- Frontend: port 3000, Backend: port 8001
- Data stored in TypeScript files + localStorage
- AI uses EMERGENT_LLM_KEY via emergentintegrations library
- Salary benchmarks centralized in /app/frontend/src/lib/career-tools/salaryBenchmarks.ts
