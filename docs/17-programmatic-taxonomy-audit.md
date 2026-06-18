# Programmatic Taxonomy Audit — Input Spec for the Next Sprint

_Generated Feb 2026 (Phase 51). Use this as the source of truth for the pSEO + schema injection + sitemap rewrite sprint._

---

## 1. Existing route inventory (47 total `page.tsx` files)

### Static (20) — landing / utility / auth
```
/                /about            /calculators       /career-tools
/contact         /contract-template /disclaimer        /editorial-policy
/guides          /invoice-template /learn             /login
/pricing         /privacy          /register          /salary
/search          /tax-tools        /terms             /what-if
/account         /account/billing
```

### Tools (5) — first-class apps
```
/tools          /tools/[slug]
/tools/invoice  /tools/esign  /tools/esign/dashboard
/tools/esign/new  /tools/esign/edit/[id]
/track/esign  /sign/[token]  /verify  /verify/[docId]  /i/[token]
```

### Dynamic — content / pSEO (19 leaf templates already in place)
```
/articles/[slug]                       /calculators/[slug]
/career-tools/[slug]                   /category/[...slug]
/contract-template/[type]              /contract-template/[type]/[industry]
/guides/[slug]                         /invoice-template/[profession]
/learn/[slug]                          /salary/[job]
/salary/[job]/[city]                   /salary/in/[city]
/tax-tools/[slug]                      /tools/[slug]
```

---

## 2. Structured-data (JSON-LD) coverage

| Status | Route | Schema type |
|---|---|---|
| ✅ | `/` | `WebSite` + `Organization` |
| ✅ | `/tools/invoice` | `SoftwareApplication` + `FAQPage` |
| ✅ | `/tools/esign` | `SoftwareApplication` + `FAQPage` |
| ✅ | `/contract-template/[type]` | (verified via grep — pSEO template) |
| ✅ | `/contract-template/[type]/[industry]` | pSEO template |
| ✅ | `/invoice-template/[profession]` | pSEO template |
| ✅ | `/learn/[slug]` | Article / HowTo |
| ✅ | `/guides/[slug]` | Article |
| ✅ | `/salary/[job]` `/[city]` `/in/[city]` | pSEO templates |
| ❌ | `/calculators` and **all 40 `/calculators/[slug]` pages** | **MISSING** |
| ❌ | `/tools/[slug]` (8 entries) | **MISSING** |
| ❌ | `/tax-tools/[slug]` (12 entries) | **MISSING** |
| ❌ | `/career-tools/[slug]` (N entries) | **MISSING** |
| ❌ | `/articles/[slug]` | **MISSING** |
| ❌ | Static landings: `/about`, `/pricing`, `/contact`, `/calculators`, `/tax-tools`, `/tools`, `/career-tools`, `/guides`, `/invoice-template`, `/contract-template`, `/salary`, `/learn`, `/what-if` | **MISSING** |
| ❌ | `/sign/[token]`, `/verify/[docId]`, `/track/esign` | N/A (gated / transactional) — skip |

**Coverage today: ~10 routes / 47 (21%).** The biggest gap is the **60 calculator + tool + tax-tool leaf pages** — these are the highest commercial-intent surfaces and have zero schema.

---

## 3. Tool catalog (the input rows for the generator)

```
/app/frontend/src/data/calculators.ts   → 40 entries (slug, name, category, ...)
/app/frontend/src/data/tools.ts         → 8  entries
/app/frontend/src/data/tax-tools.ts     → 12 entries
                                          ─────
Total leaf tools/calculators           : 60
```

Each has a `slug`, `name`, `description`, `category` field — already the right shape to drive an automated `SoftwareApplication` schema template.

---

## 4. pSEO datasets already loaded (drive the geo & vertical permutations)

```
/app/frontend/src/data/pseo/professions.ts        → ~421 professions  ← biggest pSEO surface
/app/frontend/src/data/pseo/contract-templates.ts → ~83 templates
/app/frontend/src/data/pseo/contracts.ts          → ~63 contract types
/app/frontend/src/data/pseo/industries.ts         → ~43 industries
/app/frontend/src/data/pseo/jobs.ts               → ~42 job titles
/app/frontend/src/data/pseo/cities.ts             → ~23 cities  ← only 23, not 1000 yet
/app/frontend/src/data/pseo/salary-levels.ts      → 11 salary levels
/app/frontend/src/data/pseo/savings-targets.ts    → 2 targets
```

**Note**: no `us-states.ts` or `tax-jurisdictions.ts` exists yet. The brief asks for `/tools/state/[state]-income-tax-calculator` — that's a **new dataset** the generator will need.

---

## 5. Sitemap architecture today

8 split sitemaps + 1 index:
```
/sitemap.xml                       ← index, links to all sub-sitemaps below
/sitemap-core.xml                  ← static + main tool pages
/sitemap-articles.xml
/sitemap-guides.xml
/sitemap-salary.xml
/sitemap-tax.xml
/sitemap-contract-templates.xml
/sitemap-invoice-templates.xml
```

All thin (13 lines each) — they delegate to `getSitemapIndexEntries()` + per-section helpers in `/app/frontend/src/lib/sitemap-data.ts`. **Good architecture**, just needs new entries appended:
- `/sitemap-calculators.xml` for the 40 calculators
- `/sitemap-state-tools.xml` for the new state × tool permutations

---

## 6. Sprint plan that drops out of this audit

### Phase A — Schema-injection backfill (high impact, low risk, ~2 hours)
Build a `<ToolSchema slug={...} />` server component that reads the slug from `calculators.ts | tools.ts | tax-tools.ts` and emits `SoftwareApplication` + `FAQPage`. Mount it in the existing `/calculators/[slug]`, `/tools/[slug]`, `/tax-tools/[slug]` pages — one line each. **+60 routes get schema in one sweep.**

### Phase B — State × tax-tool grid (the geo brief, ~4 hours)
1. Create `/app/frontend/src/data/pseo/us-states.ts` (50 entries with name, abbrev, tax rate, brackets).
2. Create new dynamic route `/tools/state/[state]-[tool-slug]/page.tsx` driven by `generateStaticParams` over `STATES × TAX_TOOLS` (50 × 12 = **600 new leaf pages**).
3. Each emits `SoftwareApplication` + `Place` + city/state breadcrumb schema.
4. Append `/sitemap-state-tools.xml`.

### Phase C — pSEO scaling (still in scope from earlier phases)
- Expand `cities.ts` 23 → 1,000 (use top US Census MSAs)
- Expand `jobs.ts` 42 → 500
- That uplifts `/salary/[job]/[city]` from current footprint to **500 × 1,000 = 500K** combinations. Need a 200-OK cap per crawl budget (so probably top 50K).

### Phase D — Sitemap loop (~30 min)
- Add 2 new sitemap chunks (calculators, state-tools).
- Cap each at 50K URLs (Google limit) — auto-paginate via `sitemap-data.ts`.

---

## 7. Quick wins available outside the sprint

These can ship in 15 min each, independently:
1. **Add `SoftwareApplication` schema to `/calculators/[slug]`** — single template wrap, +40 routes.
2. **Add `WebPage` + `BreadcrumbList` schema to the 13 missing static landings** — boilerplate, ~10 lines each.
3. **Strip "Hide / hide" from sitemap-data.ts** — verify all 8 sub-sitemaps return HTTP 200 (currently I haven't smoke-tested them).

---

## 8. Open questions for you before the sprint kicks off

1. **State-tax tools** — should they live at `/tools/state/[slug]` (your spec) or at `/tax-tools/[state]/[tool]` (matches existing taxonomy)? The latter is canonical-cleaner.
2. **Geo expansion budget** — Google's per-domain crawl-budget caps around 50K URLs/day. We can ship 500K salary leaf pages but it'll take ~10 days to fully index. Confirm you want full scale, or a curated 50K first?
3. **Cloudflare AI-block** — still needs disabling on prod or all this AI-schema work is half-blocked.

---

_End of audit. Ready to start Phase A on your green light._
