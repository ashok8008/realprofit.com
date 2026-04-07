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

## pSEO System
- **56 cities** across 4 cost tiers (very-high, high, moderate, low)
- **14 salary levels** ($30K-$300K)
- **784 location-salary pages** (56 × 14)
- **1,071 total guide pages** (salary, tax, savings, mortgage, debt, freelancer, location-salary)
- **1,207 total sitemap URLs**
- **Cost Tier Engine** (`costTier.ts`): Classifies cities by COL + rent
- **Variation Engine** (`variationEngine.ts`): Deterministic content generation
- Sitemap: Next.js `sitemap.ts` with `force-static` generation

## API Endpoints
### Auth (/api/auth/*)
- POST /register, /login, /logout, /refresh, /forgot-password, /reset-password
- GET /me

### User Data (/api/user-data/*)
- GET /, GET /{tool_key}, PUT /{tool_key}, DELETE /{tool_key}, POST /bulk

### Existing
- GET /api/health, /api/sitemap.xml, /api/sitemap/stats
- POST /api/career/* (AI-powered career tools)

## Implementation History

### Phase 1-9: Core Platform, pSEO, Resume, Deployment, Migration, Analytics, Code Quality -- DONE
### Phase 10: Deployment .gitignore Fix -- DONE
### Phase 11: Auth + DB Integration -- DONE
### Phase 12: Sensitive Data Migration -- DONE
### Phase 13: Component Splitting -- DONE
### Phase 14: CloudSyncIndicator -- DONE

### Phase 15: pSEO City Expansion (Feb 2026) -- DONE
- Expanded from 30 → 56 cities across all US cost tiers
- Location-salary pages: 420 → 784 (87% increase)
- Total guide pages: ~500 → 1,071
- Total sitemap URLs: 265 → 1,207
- New cities: Honolulu, Orange County, Hartford, Sacramento, Stamford, Baltimore, Orlando, Jacksonville, New Orleans, Richmond, Milwaukee, Boise, Cleveland, Cincinnati, Indianapolis, St. Louis, Memphis, Louisville, Oklahoma City, Tucson, El Paso, Omaha, Albuquerque, Birmingham, Buffalo, Des Moines
- Fixed stale `public/sitemap.xml` override that was masking the dynamic sitemap
- Removed incompatible `output: standalone` from next.config.ts
- Backend CITY_SLUGS updated to match frontend (56 cities)

## Testing Status
- Iteration 14: Backend 95%, Frontend 100%
- Iteration 15: Frontend 100% (17/17)
- pSEO expansion: 26/26 new city pages verified (200 OK)

## Upcoming Tasks
- Premium ATS checks for Resume Builder (P2)
- Stripe integration for monetization (P2)
- A/B test hero CTAs (P2)
