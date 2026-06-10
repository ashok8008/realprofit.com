# RealProfits — Technical Documentation

Comprehensive engineering documentation for **RealProfits**, a financial &
career decision platform powered by Next.js 16 + FastAPI + MongoDB + PostgreSQL.

> Audience: a developer joining this codebase cold. After reading these docs
> you should be able to run, debug, extend, and deploy the application without
> contacting the original developers.

## Table of Contents

| #  | Document                                                | Focus                                          |
|----|---------------------------------------------------------|------------------------------------------------|
| 01 | [Project Overview](./01-project-overview.md)            | Purpose, stack, integrations                   |
| 02 | [System Architecture](./02-system-architecture.md)      | Diagrams, request flow, service interactions   |
| 03 | [Project Structure](./03-project-structure.md)          | Folder-by-folder walk-through                  |
| 04 | [Database Documentation](./04-database.md)              | Mongo + Postgres schemas, ER diagrams          |
| 05 | [Module Documentation](./05-modules.md)                 | Per-module business logic                      |
| 06 | [API Documentation](./06-api.md)                        | Every endpoint, request/response, examples     |
| 07 | [Authentication & Authorization](./07-auth.md)          | JWT cookies, brute-force, roles                |
| 08 | [Environment Configuration](./08-environment.md)        | All env vars, dev + prod setup                 |
| 09 | [Deployment](./09-deployment.md)                        | Hetzner / PM2 / Nginx / CI/CD                  |
| 10 | [Troubleshooting Guide](./10-troubleshooting.md)        | Common errors and fixes                        |
| 11 | [Dependency Documentation](./11-dependencies.md)        | What each package does                         |
| 12 | [Maintenance Guide](./12-maintenance.md)                | How to add modules, APIs, tables               |
| 13 | [Developer Onboarding](./13-onboarding.md)              | Local setup, running, testing                  |
| 14 | [Security Review](./14-security.md)                     | Risks + recommendations                        |
| 15 | [Technical Debt](./15-technical-debt.md)                | Refactor backlog                               |

## Quick Map

- **Frontend**: `/app/frontend` — Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui.
- **Backend**: `/app/backend` — FastAPI on port `8001`, auto-reload via supervisor.
- **MongoDB**: auth, users, invoices, resume drafts, calculator caches, analytics.
- **PostgreSQL 15**: eSign documents/signers/fields/events + Stripe subscriptions.
- **Background jobs**: APScheduler (in-process, see `scheduler_jobs.py`).
- **AI**: Gemini / GPT-4o-mini via `emergentintegrations` (Emergent LLM Key).
- **Email**: Resend HTTP API.
- **Payments**: Stripe (Checkout, Billing Portal, Webhook).

## Living Documents Outside `/docs`

These are the authoritative day-to-day docs maintained inside the repo:

- `/app/memory/PRD.md` — Product Requirements & implementation history (changelog).
- `/app/memory/test_credentials.md` — Test admin & DB credentials.
- `/app/DEPLOYMENT_GUIDE.md` — Production-server install runbook (Hetzner).
- `/app/test_reports/iteration_NN.json` — Latest QA pass per feature batch.
