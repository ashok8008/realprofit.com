# 13 — Developer Onboarding

This page is the fast path from zero to a running local dev environment.

## 13.1 Prerequisites

- macOS, Linux, or WSL2.
- **Node.js 22**, **Python 3.11**, **Yarn 1.22**, **MongoDB 7**, **PostgreSQL 15**.
- Git.

## 13.2 Clone & Install

```bash
git clone <repo-url> realprofits
cd realprofits

# Backend
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..

# Frontend
cd frontend
yarn install
cd ..
```

## 13.3 Configure Environment

### Backend `.env`
```bash
cat > backend/.env <<'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=realprofits
DATABASE_URL=postgresql+asyncpg://realprofits:realprofits_dev@localhost:5432/realprofits_esign
JWT_SECRET=replace-with-32-random-chars
JWT_ACCESS_EXPIRES_MIN=15
JWT_REFRESH_EXPIRES_DAYS=7
ADMIN_EMAIL=admin@realprofits.com
RESEND_API_KEY=re_test_xxx
SENDER_EMAIL=dev@example.com
EMERGENT_LLM_KEY=sk-emergent-xxx
STRIPE_API_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxx
STRIPE_PRICE_PRO_MONTH=price_xxx
STRIPE_PRICE_PRO_YEAR=price_xxx
STRIPE_PRICE_BUSINESS_MONTH=price_xxx
STRIPE_PRICE_BUSINESS_YEAR=price_xxx
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
EOF
```

### Frontend `.env`
```bash
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8001" > frontend/.env
```

## 13.4 Start the Databases

```bash
# MongoDB
sudo systemctl start mongod      # macOS: brew services start mongodb-community

# PostgreSQL
sudo systemctl start postgresql  # macOS: brew services start postgresql@15
sudo -u postgres psql <<SQL
CREATE USER realprofits WITH PASSWORD 'realprofits_dev';
CREATE DATABASE realprofits_esign OWNER realprofits;
GRANT ALL PRIVILEGES ON DATABASE realprofits_esign TO realprofits;
SQL
```

## 13.5 Run the Apps

```bash
# Terminal 1 — Backend
cd backend
source .venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Terminal 2 — Frontend
cd frontend
yarn dev    # serves http://localhost:3000
```

Visit http://localhost:3000.

> If you prefer the Emergent pod workflow, `sudo supervisorctl start all`
> brings up backend and frontend at once with hot reload.

## 13.6 Seed an Admin User

```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@realprofits.com","password":"RealProfits2026!","name":"Admin"}'
```

The first registration matching `ADMIN_EMAIL` is auto-elevated to `admin`.
Store the credentials in `/app/memory/test_credentials.md` so the QA agent
can use them.

## 13.7 Run Tests

```bash
# Backend
cd backend
/root/.venv/bin/pytest tests/ -v

# Lint
ruff check backend/
cd ../frontend && yarn lint && yarn tsc --noEmit
```

QA reports from previous iterations live in `/app/test_reports/iteration_NN.json`. The most recent is authoritative.

## 13.8 Useful Dev Commands

```bash
# Tail backend logs
tail -f /var/log/supervisor/backend.err.log

# Mongo shell
mongosh realprofits

# Postgres shell
psql -U realprofits -d realprofits_esign

# Restart a single service
sudo supervisorctl restart backend
sudo supervisorctl restart frontend

# Rebuild frontend in background
cd /app/frontend && nohup yarn build > /tmp/build.log 2>&1 &
```

## 13.9 Coding Workflow

1. Create a branch.
2. Implement; **don't hand-edit** `package.json` / `requirements.txt` (use `yarn add` / `pip install + pip freeze`).
3. Add a pytest under `backend/tests/` for any non-trivial backend logic.
4. Self-test with curl/screenshot OR call the testing agent (Emergent pod only).
5. Update `/app/memory/PRD.md` with a one-line changelog under the latest phase.
6. Open a PR / push to `main` to trigger the deploy workflow.

## 13.10 Conventions Recap

- `data-testid` on every interactive UI element.
- Async/await everywhere on the backend.
- `datetime.now(timezone.utc)` not `utcnow()`.
- HttpOnly cookies for auth (do not store tokens in localStorage).
- Return Pydantic models, not raw dicts.
- One JSON shape per endpoint; document it in [`06 API`](./06-api.md).
