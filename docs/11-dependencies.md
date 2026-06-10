# 11 — Dependency Documentation

## 11.1 Backend (`/app/backend/requirements.txt`)

### Critical runtime

| Package                  | Purpose                                                                                  |
|--------------------------|------------------------------------------------------------------------------------------|
| `fastapi`                | HTTP framework                                                                           |
| `uvicorn[standard]`      | ASGI server (production-grade w/ httptools, uvloop)                                      |
| `pydantic`               | Schemas, request/response validation (v2)                                                |
| `python-dotenv`          | `.env` loading                                                                           |
| `email-validator`        | Email field validation                                                                   |
| `pyjwt`                  | JWT mint/verify for auth + eSign signing tokens                                          |
| `bcrypt`                 | Password hashing                                                                         |
| `motor`                  | Async MongoDB driver                                                                     |
| `pymongo`                | Underpins motor                                                                          |
| `sqlalchemy[asyncio]`    | ORM for PostgreSQL (eSign + billing)                                                     |
| `asyncpg`                | Postgres async driver                                                                    |
| `psycopg2-binary`        | Sync Postgres driver (only used by occasional ad-hoc scripts)                            |
| `apscheduler`            | In-process cron jobs                                                                     |
| `pypdf`                  | Read PDFs (page count, page size, merge)                                                 |
| `reportlab`              | Generate audit-trail PDF page                                                            |
| `Pillow`                 | Image processing (signature PNGs, logos)                                                 |
| `qrcode[pil]`            | QR code on audit PDF + invoice                                                           |
| `httpx`                  | HTTP client (Resend, Emergent LLM)                                                       |
| `stripe`                 | Stripe SDK                                                                               |
| `emergentintegrations`   | Universal LLM client (Emergent LLM Key)                                                  |
| `python-multipart`       | Multipart parsing for file uploads                                                       |
| `pytz`                   | Timezone math                                                                            |

### Dev / tests

| Package                  | Purpose                                                                                  |
|--------------------------|------------------------------------------------------------------------------------------|
| `pytest`, `pytest-asyncio` | Unit + integration tests                                                              |
| `httpx[http2]`           | Test client                                                                              |

### Version policy

The exact pinned versions are in `requirements.txt`. **Don't hand-edit the
file**; install + freeze:

```bash
pip install <new-pkg>
pip freeze > requirements.txt
```

## 11.2 Frontend (`/app/frontend/package.json`)

### Framework

| Package                    | Purpose                                                |
|----------------------------|--------------------------------------------------------|
| `next` (16.x)              | App Router, SSG, ISR                                   |
| `react`, `react-dom` (19)  | UI runtime                                             |
| `typescript`               |                                                        |
| `tailwindcss` (v4)         | Utility CSS, inline config in `globals.css`            |

### UI components

| Package                                              | Purpose                              |
|------------------------------------------------------|--------------------------------------|
| `@radix-ui/*` (20+ packages)                         | shadcn/ui primitives                 |
| `lucide-react`                                       | Icon set                             |
| `framer-motion`                                      | Animations                           |
| `sonner`                                             | Toast notifications                  |
| `tw-animate-css`                                     | Tailwind animation plugin            |
| `class-variance-authority`, `tailwind-merge`, `clsx` | Variants + class merging helpers     |
| `vaul`                                               | Mobile drawer component              |

### Forms & validation

| Package                  | Purpose                                                                    |
|--------------------------|----------------------------------------------------------------------------|
| `react-hook-form`        | Forms (Resume Builder, Invoice editor)                                     |
| `@hookform/resolvers`    | Zod resolver                                                               |
| `zod`                    | Schema validation client + shared with TS types                            |

### Data / charts

| Package                  | Purpose                                                                    |
|--------------------------|----------------------------------------------------------------------------|
| `@tanstack/react-query`  | Server state (used sparingly — most calls are direct fetch)                |
| `recharts`               | Salary charts, calculator viz                                              |

### PDF / docs

| Package                                              | Purpose                              |
|------------------------------------------------------|--------------------------------------|
| `pdfjs-dist`                                         | Render PDFs in eSign signing flow    |
| `jspdf`                                              | Generate invoice PDFs client-side    |
| `react-signature-canvas`                             | Draw signature                       |
| `qrcode`                                             | QR codes in invoice PDFs             |

### Other notable

| Package                  | Purpose                                                                    |
|--------------------------|----------------------------------------------------------------------------|
| `embla-carousel-react`   | Carousels                                                                  |
| `date-fns`               | Date parsing/format                                                        |
| `next-themes`            | Light/dark theme (currently light-only)                                    |
| `react-helmet-async`     | Used in a couple of legacy spots; mostly App-Router metadata replaces it   |
| `tsx`                    | Run TS scripts (`scripts/post-build-ping.ts`)                              |

### Dev

| Package                  | Purpose                                                                    |
|--------------------------|----------------------------------------------------------------------------|
| `@types/*`               | Type defs                                                                  |
| `eslint`, `eslint-config-next` | Linting                                                              |
| `vite`                   | Currently present but unused for the production build (Next handles it). Candidate for removal. |

### Version policy

Use `yarn add <pkg>` (never edit `package.json` directly). For breaking
upgrades (Next major, Tailwind major), test the full pSEO build and the
eSign signing flow before promoting.

## 11.3 System / OS Packages

Required on the host (see [09 Deployment §9.3](./09-deployment.md#93-server-requirements)):

| Package          | Version | Purpose                            |
|------------------|---------|------------------------------------|
| Node.js          | 22      | Frontend runtime                   |
| yarn             | 1.22    | Package manager                    |
| Python           | 3.11    | Backend runtime                    |
| MongoDB          | 7       | Document DB                        |
| PostgreSQL       | 15      | Relational DB                      |
| nginx            | 1.24+   | Reverse proxy + TLS                |
| pm2              | latest  | Frontend process manager           |
| supervisor       | latest  | Dev-pod process manager (replaced by systemd + PM2 in prod) |
| certbot          | latest  | Let's Encrypt                      |
