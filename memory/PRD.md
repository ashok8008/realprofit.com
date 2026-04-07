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

## pSEO System
- **Cost Tier Engine** (`costTier.ts`): Classifies cities by COL + rent into low/moderate/high/very-high
- **Variation Engine** (`variationEngine.ts`): 72 unique intros x 72 explanations x 12 comparisons x 12 PP summaries x varied FAQs
- **Template Keys**: 3 salary buckets x 4 cost tiers x 2 tax profiles = 24 keys x 3 variants each
- **Content Blocks**: intro, explanation, purchasing power summary, city comparison, 6 city-aware FAQs
- **Dynamic Sitemap**: Next.js `sitemap.ts` (842+ URLs)

## Database Schema
- **users**: email (unique), password_hash, name, role, created_at
- **login_attempts**: identifier (IP:email), count, locked_until
- **password_reset_tokens**: token, user_id, expires_at, used (TTL index)
- **user_data**: user_id + tool_key (compound unique), data (any), created_at, updated_at

## API Endpoints
### Auth (/api/auth/*)
- POST /register - Create account
- POST /login - Sign in (returns cookies)
- POST /logout - Clear session
- GET /me - Get current user
- POST /refresh - Refresh access token
- POST /forgot-password - Request reset
- POST /reset-password - Reset password

### User Data (/api/user-data/*)
- GET / - List all saved tool data
- GET /{tool_key} - Get specific tool data
- PUT /{tool_key} - Save/update tool data
- DELETE /{tool_key} - Delete tool data
- POST /bulk - Bulk save multiple items

### Existing
- GET /api/health
- GET /api/sitemap
- GET /api/sitemap-stats
- POST /api/career/* (AI-powered career tools)

## What's Been Implemented

### Phase 1-9: Core Platform, pSEO, Resume, Deployment, Migration, Analytics, Code Quality -- DONE

### Phase 10: Deployment .gitignore Fix (Feb 2026) -- DONE
- Fixed .gitignore blocking .env files from deployment

### Phase 11: Auth + DB Integration (Feb 2026) -- DONE
- JWT auth (register, login, logout, refresh, forgot/reset password, brute force protection)
- MongoDB user storage with motor async driver
- Admin seed on startup
- httpOnly cookie-based sessions (15min access, 7-day refresh)
- User data CRUD API (save/load/delete per tool, bulk save)
- AuthContext provider + Login/Register/Account pages
- Navbar shows Sign In for anonymous, user name for authenticated
- localStorage-to-server sync on login/register

### Phase 12: Sensitive Data Migration (Feb 2026) -- DONE
- All 16+ tool components migrated from direct localStorage to centralized storage.ts
- storage.ts now syncs to server API for authenticated users (fire-and-forget)
- Anonymous users still get localStorage (no regression)
- Tools migrated: NetWorthCalculator, PaycheckCalculator, ExpenseTracker, BillSplitTool, FreelanceInvoiceGenerator, IncomeTracker, SubscriptionCostAnalyzer, Footer newsletter, AI usage tracking

### Phase 13: Component Splitting (Feb 2026) -- DONE
- Home.tsx: 629 → 31 lines (extracted HeroSection, QuickSalaryCheck, StartHereSection, PillarCardsSection, PopularToolsSection, CareerHighlightSection, WhatIfPreviewSection, CalculatorsShowcaseSection, ProductiveToolsSection, ArticlesSection, TrustSection)
- WhatIfSimulator.tsx: 548 → ~200 lines (extracted RpSlider, WhatIfHero, ProgressCards)
- FreelanceInvoiceGenerator.tsx: 486 → ~390 lines (extracted InvoicePreview)

## Testing Status
- Backend: 95% (19/20 passed, 1 skipped due to K8s load balancing)
- Frontend: 100% (11/11 features verified via Playwright)
- Test report: /app/test_reports/iteration_14.json

## Upcoming Tasks
- Expand city dataset to 50+ cities for 600+ new pSEO pages (P1)
- Premium ATS checks for Resume Builder (P2)
- Stripe integration for monetization (P2)
- A/B test hero CTAs (P2)
- InterviewPrep splitting (P2 - 480 lines, lower priority)
- SubscriptionCostAnalyzer splitting (P2 - 401 lines, lower priority)
