# 08 — Environment Configuration

All secrets/config come from `.env` files. **Never commit `.env`.** A
sanitised template lives at the root as `.env.example` (recommended — create
if missing).

## 8.1 Backend — `/app/backend/.env`

| Variable                | Purpose                                                       | Example / Required value                                                |
|-------------------------|---------------------------------------------------------------|-------------------------------------------------------------------------|
| `MONGO_URL`             | MongoDB connection string                                     | `mongodb://localhost:27017` (dev) / managed URI (prod)                  |
| `DB_NAME`               | MongoDB database name — **do not change in deployed envs**    | `realprofits`                                                           |
| `DATABASE_URL`          | PostgreSQL async URL                                          | `postgresql+asyncpg://realprofits:realprofits_dev@localhost:5432/realprofits_esign` |
| `JWT_SECRET`            | HS256 key for auth + eSign signing tokens                     | ≥ 32 random chars                                                       |
| `JWT_ACCESS_EXPIRES_MIN`| Access-token TTL in minutes (optional, default 15)            | `15`                                                                    |
| `JWT_REFRESH_EXPIRES_DAYS` | Refresh TTL in days (optional, default 7)                  | `7`                                                                     |
| `ADMIN_EMAIL`           | The single email that becomes admin at first register         | `admin@realprofits.com`                                                 |
| `RESEND_API_KEY`        | Resend HTTP API key                                           | `re_xxx`                                                                |
| `SENDER_EMAIL`          | From: address for emails (must be a verified sender in Resend)| `RealProfits <hello@realprofits.com>` or just `hello@realprofits.com`   |
| `EMERGENT_LLM_KEY`      | Universal LLM key (Emergent integrations)                     | `sk-emergent-...`                                                       |
| `STRIPE_API_KEY`        | Stripe secret key                                             | `sk_test_…` / `sk_live_…`                                               |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret                                 | `whsec_…`                                                               |
| `STRIPE_PRICE_PRO_MONTH`, `STRIPE_PRICE_PRO_YEAR`, `STRIPE_PRICE_BUSINESS_MONTH`, `STRIPE_PRICE_BUSINESS_YEAR` | Stripe price IDs | `price_…` |
| `APP_URL`               | Public base URL of the app (used in emails & verify links)    | `https://realprofits.com` (prod) / preview URL (dev)                    |
| `FRONTEND_URL`          | CORS origin                                                   | Same as `APP_URL`                                                       |
| `MAX_UPLOAD_BYTES`      | Optional invoice attachment cap override                      | `10485760` (10 MB)                                                      |

> Do **not** add explanatory comments to `.env`. Some env loaders treat
> `#` differently across platforms. Keep it pure `KEY=VALUE`.

### Protected variables (do **not** rename or remove)

- `MONGO_URL`, `DB_NAME` — set by the Emergent platform; renaming breaks the pod.

## 8.2 Frontend — `/app/frontend/.env`

| Variable                      | Purpose                                              |
|-------------------------------|------------------------------------------------------|
| `NEXT_PUBLIC_BACKEND_URL`     | The external base URL the browser uses to call `/api`. **Do not rename.** |

> Note: legacy code may reference `REACT_APP_BACKEND_URL`. The codebase has
> standardized on `NEXT_PUBLIC_BACKEND_URL`. If you see `REACT_APP_BACKEND_URL`
> in older docs or scripts, treat it as a synonym.

## 8.3 Development Setup

```bash
# 1. clone the repo
git clone <repo-url> /app && cd /app

# 2. backend env
cat > backend/.env <<EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=realprofits
DATABASE_URL=postgresql+asyncpg://realprofits:realprofits_dev@localhost:5432/realprofits_esign
JWT_SECRET=$(openssl rand -hex 32)
ADMIN_EMAIL=admin@example.com
RESEND_API_KEY=re_test_xxx
SENDER_EMAIL=dev@example.com
EMERGENT_LLM_KEY=sk-emergent-dev
STRIPE_API_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxx
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
EOF

# 3. frontend env
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8001" > frontend/.env

# 4. install
pip install -r backend/requirements.txt
cd frontend && yarn install
```

See [13 Onboarding](./13-onboarding.md) for the rest of the bootstrap.

## 8.4 Production Setup

The production server (Hetzner, single-node) runs:

- **PM2** for the Next.js process (`pm2 start "yarn start" --name rp-frontend`).
- **systemd** for the FastAPI process (`/etc/systemd/system/rp-backend.service`).
- **Nginx** as reverse proxy + TLS termination (`/etc/nginx/sites-available/realprofits`).
- **MongoDB** managed by systemd.
- **PostgreSQL 15** managed by systemd; `realprofits` user owns `realprofits_esign`.

Set env vars in:
- `/app/backend/.env` (read by the FastAPI service).
- `/app/frontend/.env.production` (read by `yarn build`).

Detailed steps in **[09 Deployment](./09-deployment.md)** and the runbook
`/app/DEPLOYMENT_GUIDE.md`.
