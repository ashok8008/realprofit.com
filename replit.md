# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `artifacts/real-profits` (`@workspace/real-profits`)

Frontend-only React + Vite personal finance content site (RealProfits.com). No backend — all content is in TypeScript data files.

- **Stack**: React, Vite, wouter (routing), Recharts (charts), jsPDF (PDF export), react-helmet-async (SEO), Tailwind CSS, shadcn/ui
- **Sections**:
  - **Articles**: 55 editorial articles across 8 categories (money-basics, income-side-hustles, taxes, saving-vs-investing, debt-credit, life-decisions, real-stories). Markdown content rendered with custom parser supporting ##/### headings, bold, bullet/numbered lists.
  - **Calculators**: 39+ financial calculators at /calculators and /calculators/:slug (savings, mortgage, auto loan, retirement, debt, tax, investment, etc.)
  - **Tools**: 7 interactive utility tools at /tools and /tools/:slug:
    - Freelance Invoice Generator (full invoice creation with PDF export)
    - Subscription Cost Analyzer (track subscriptions with charts)
    - Bill Split Tool (equal/custom split with settlement)
    - Net Worth Calculator (assets vs liabilities with charts)
    - Paycheck Calculator (take-home pay estimate)
    - Income Tracker (log income entries with trends)
    - Expense Tracker (log expenses with category breakdown)
  - **What If Simulator**: 3-step financial planning wizard at /what-if with sliders, scenario modeling, and net worth projection chart (Recharts AreaChart)
  - **pSEO Engine**: 129 programmatic SEO pages at /guides/:slug with 3 page types:
    - Salary guides (53): `/guides/[amount]-salary` - "Is $X a Good Salary?" with tax breakdowns, 50/30/20 budgets
    - Tax guides (49): `/guides/tax-on-[amount]-income` - "How Much Tax Do You Pay on $X?" with progressive bracket calculations
    - Savings guides (27): `/guides/save-[amount]` - "How to Save $X" with monthly savings plans for 6mo/1yr/2yr/5yr timelines
    - Each page includes: Direct Answer (ai-summary) block, data tables, Compare With Others sidebar (5 random links), You Might Also Need widget, full JSON-LD (HowTo + FAQPage + BreadcrumbList)
    - Data files: `src/data/pseo/salary-levels.ts`, `src/data/pseo/savings-targets.ts`
  - **Trust pages**: About, Contact, Privacy, Terms, Editorial Policy, Disclaimer
- **SEO Systems**:
  - **JSON-LD Schema**: `Seo.tsx` supports jsonLd prop (single or array). Helpers: `buildArticleSchema`, `buildFAQSchema`, `buildSoftwareAppSchema`, `buildHowToSchema`, `buildBreadcrumbSchema`
  - **GEO Optimization**: Every article, calculator, and guide page has a `div#ai-summary` with TL;DR/Direct Answer/Quick Summary blocks for AI citation
  - **Internal Linking**: `autoLinkContent()` scans text for calculator/tool keywords and auto-links them. `YouMightAlsoNeed` widget shows 3 related tools based on category mapping
  - **National Benchmarks**: Data tables on calculator pages showing U.S. averages by age/category (savings, debt, tax, income, budget, investment, loan)
  - **Shareable Insights**: `ShareableInsight` component with html2canvas PNG export. Calculator toolbar has PDF, PNG, and Share buttons
- **Data files**: `src/data/calculators.ts`, `src/data/categories.ts`, `src/data/articles.ts`, `src/data/tools.ts`
- **Calculator pattern**: Named export in `src/components/calculators/[Name].tsx`, lazy-loaded in CalculatorDetail.tsx
- **Tool pattern**: Named export in `src/components/tools/[Name].tsx`, lazy-loaded in ToolDetail.tsx, localStorage persistence for all tools
- **Export utilities**: `src/components/export/ExportButtons.tsx` (PDF with html2canvas, PNG, CSV, Print, Share). SVG-to-canvas conversion uses Promise-based img.onload awaiting (no setTimeout race condition).
- **Input validation**: All 39+ calculator inputs have `min="0"` HTML attribute + `Math.max(0, ...)` in onChange handlers. Year/time inputs are bounded (e.g., `min="1" max="50"`). Percentage inputs capped with `max`. Age inputs bounded to sensible ranges.
- **Tool input validation**: Subscription Analyzer and Expense Tracker reject empty/space-only names and negative/zero amounts with toast messages. Add/Log buttons are disabled until valid input is provided. Required fields marked with red asterisks.
- **String-based numeric inputs**: FreelanceInvoiceGenerator and PaycheckCalculator use string state for numeric inputs (quantity, rate, discount, tax, grossPay, etc.) to allow clearing the leading "0". Values are parsed with `parseFloat() || 0` only during computation.
- **Income Tracker edit**: Inline row editing with pencil icon, check/cancel buttons, and inline inputs for date, source, category, amount.
- **Net Worth Calculator PDF**: Custom jsPDF-based PDF export (replaced html2canvas approach) with proper formatting — lists all asset/liability categories with labels, summary section, colored net worth display.
- **Net Worth charts**: Pie chart uses hardcoded hex colors (#22c55e green for assets, #ef4444 red for liabilities) with a visible legend below showing "Assets ($X)" and "Liabilities ($X)". Bar chart also has color legend. Charts section no longer uses `no-print` class.
- **Search**: Real-time client-side search across articles, calculators, and tools data files. Instant filtering as user types, clickable suggestion chips, categorized results with links.
- **Contact page**: Functional form with mailto-based submission (opens email client pre-filled), required field validation, success confirmation state.
- **Subscribe (Footer)**: localStorage-based email capture with confirmation "Thank you for subscribing!" message replacing the form.
- **Overflow protection**: Large currency output containers use `break-words` class to prevent horizontal overflow on big numbers.
- **SEO meta keywords**: Seo component supports optional `keywords` prop. Every page has page-specific keywords. index.html has global meta tags: `robots` (index/follow), `author`, `language` (en-US), `geo.region` (US), `rating`, `distribution`. Dynamic pages (calculators, tools, articles, pSEO guides) generate keywords from page data.
- **GTM**: Google Tag Manager (GTM-KQ9BHG4B) is in index.html. No separate Google Analytics script needed — GA4 can be configured through GTM.
- **No emojis** in UI (explicit requirement)
- **USA-only** audience

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
