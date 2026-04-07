# RealProfits - Product Requirements Document

## Overview
RealProfits is a financial + career decision platform. Organic traffic via pSEO is the primary acquisition channel.

## Architecture
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + GPT-4o-mini via emergentintegrations + MongoDB (motor async)
- **Auth**: JWT (httpOnly cookies, 15min access + 7-day refresh tokens, bcrypt, brute force protection)
- **State**: MongoDB for authenticated users, localStorage fallback for anonymous
- **SSR/SSG**: pSEO pages are server components with generateMetadata
- **Deployment**: Emergent native (Kubernetes)

## Database Schema
- **users**: email (unique), password_hash, name, role, created_at
- **login_attempts**: identifier (IP:email), count, locked_until
- **password_reset_tokens**: token, user_id, expires_at, used (TTL index)
- **user_data**: user_id + tool_key (compound unique), data (any), created_at, updated_at

## API Endpoints
### Auth (/api/auth/*)
- POST /register, /login, /logout, /refresh, /forgot-password, /reset-password
- GET /me

### User Data (/api/user-data/*)
- GET /, GET /{tool_key}, PUT /{tool_key}, DELETE /{tool_key}, POST /bulk

### Existing
- GET /api/health, /api/sitemap, /api/sitemap-stats
- POST /api/career/* (AI-powered career tools)

## What's Been Implemented

### Phase 1-9: Core Platform, pSEO, Resume, Deployment, Migration, Analytics, Code Quality -- DONE
### Phase 10: Deployment .gitignore Fix -- DONE
### Phase 11: Auth + DB Integration -- DONE
### Phase 12: Sensitive Data Migration -- DONE

### Phase 13: Component Splitting -- DONE
- Home.tsx: 630 → 30 lines (10 sub-components)
- WhatIfSimulator: 548 → 221 lines (extracted RpSlider, WhatIfHero, ProgressCards)
- FreelanceInvoiceGenerator: 486 → 396 lines (extracted InvoicePreview)
- InterviewPrep: 481 → 209 lines (extracted QuestionCard, InterviewCard)
- SubscriptionCostAnalyzer: 395 → 341 lines (extracted SubscriptionSummary with pie chart)

### Phase 14: CloudSyncIndicator -- DONE
- Reusable component showing "Synced to cloud" (authenticated) or "Sign in to sync" (anonymous)
- Added to ToolDetail, CareerToolDetail, CalculatorDetail (covers all tool/calculator/career-tool pages)
- Updated FAQ text to reflect new cloud sync capability

## Testing Status
- Iteration 14: Backend 95%, Frontend 100% (auth + data + pages)
- Iteration 15: Frontend 100% (17/17 - component splitting + CloudSyncIndicator)

## Upcoming Tasks
- Expand city dataset to 50+ cities for 600+ new pSEO pages (P1)
- Premium ATS checks for Resume Builder (P2)
- Stripe integration for monetization (P2)
- A/B test hero CTAs (P2)
