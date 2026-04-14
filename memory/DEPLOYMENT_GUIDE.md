# RealProfits — Self-Hosted Deployment Guide

> Hand this to your DevOps team. Covers everything needed to deploy on your own infrastructure.

---

## 1. System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS** | Ubuntu 22.04+ / Debian 12+ | Ubuntu 24.04 LTS |
| **Python** | 3.11+ | 3.11.x |
| **Node.js** | 20.x LTS | 20.20+ |
| **MongoDB** | 6.0+ | 7.0+ (Atlas or self-hosted) |
| **RAM** | 2 GB | 4 GB |
| **Disk** | 10 GB | 20 GB |
| **Yarn** | 1.22+ | Latest stable |

---

## 2. Architecture Overview

```
                    ┌─────────────┐
   Users ──────────►│   Nginx     │
                    │  (reverse   │
                    │   proxy)    │
                    └──┬──────┬───┘
                       │      │
              /api/*   │      │  /*
                       ▼      ▼
                ┌──────────┐  ┌──────────┐
                │ FastAPI   │  │ Next.js  │
                │ :8001     │  │ :3000    │
                └─────┬─────┘  └──────────┘
                      │
                      ▼
                ┌──────────┐
                │ MongoDB  │
                │ :27017   │
                └──────────┘
```

- **Frontend**: Next.js 16 (App Router) — serves on port `3000`
- **Backend**: FastAPI (uvicorn) — serves on port `8001`
- **Database**: MongoDB (async via `motor`)
- **Reverse Proxy**: Nginx routes `/api/*` → backend, everything else → frontend

---

## 3. Environment Variables

### Backend (`/backend/.env`)

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=realprofits
JWT_SECRET=<generate-a-64-char-random-string>
EMERGENT_LLM_KEY=<your-openai-compatible-api-key>
ADMIN_EMAIL=admin@realprofits.com
ADMIN_PASSWORD=<strong-admin-password>
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend (`/frontend/.env`)

```env
NEXT_PUBLIC_BACKEND_URL=https://yourdomain.com
```

### Variable Reference

| Variable | Where | Purpose |
|----------|-------|---------|
| `MONGO_URL` | Backend | MongoDB connection string |
| `DB_NAME` | Backend | Database name |
| `JWT_SECRET` | Backend | Signs auth tokens — **keep secret, never commit** |
| `EMERGENT_LLM_KEY` | Backend | API key for GPT-4o-mini (ATS checks, AI suggestions) |
| `ADMIN_EMAIL` | Backend | Seeded admin account email |
| `ADMIN_PASSWORD` | Backend | Seeded admin account password |
| `FRONTEND_URL` | Backend | Used for CORS and cookie domain |
| `CORS_ORIGINS` | Backend | (Optional) Additional allowed CORS origins, comma-separated |
| `NEXT_PUBLIC_BACKEND_URL` | Frontend | Base URL for all API calls (no trailing slash) |

> **Note on `EMERGENT_LLM_KEY`**: This key powers the AI features (ATS checks, summary generation, skill suggestions). It uses OpenAI GPT-4o-mini via the `emergentintegrations` library. If you want to use your own OpenAI key directly, you'll need to refactor `server.py` to use the OpenAI SDK instead. Contact the dev team for guidance.

---

## 4. Setup Steps

### 4a. Clone & Install

```bash
# Clone repo
git clone <your-repo-url> /opt/realprofits
cd /opt/realprofits

# Backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
yarn install --frozen-lockfile
yarn build
```

### 4b. MongoDB Setup

If self-hosting MongoDB:

```bash
# Ubuntu
sudo apt install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

If using **MongoDB Atlas**: just set `MONGO_URL` to your Atlas connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net`).

### 4c. Create `.env` Files

```bash
# Backend
cp /opt/realprofits/backend/.env.example /opt/realprofits/backend/.env
# Edit with your values
nano /opt/realprofits/backend/.env

# Frontend
cp /opt/realprofits/frontend/.env.example /opt/realprofits/frontend/.env
# Edit with your values
nano /opt/realprofits/frontend/.env
```

Generate a JWT secret:
```bash
openssl rand -hex 32
```

---

## 5. Process Management (systemd)

### Backend Service

Create `/etc/systemd/system/realprofits-backend.service`:

```ini
[Unit]
Description=RealProfits FastAPI Backend
After=network.target mongod.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/realprofits/backend
Environment="PATH=/opt/realprofits/backend/venv/bin"
EnvironmentFile=/opt/realprofits/backend/.env
ExecStart=/opt/realprofits/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Frontend Service

Create `/etc/systemd/system/realprofits-frontend.service`:

```ini
[Unit]
Description=RealProfits Next.js Frontend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/realprofits/frontend
ExecStart=/usr/bin/yarn start
Restart=always
RestartSec=5
Environment="NODE_ENV=production"
EnvironmentFile=/opt/realprofits/frontend/.env

[Install]
WantedBy=multi-user.target
```

### Enable & Start

```bash
sudo systemctl daemon-reload
sudo systemctl enable realprofits-backend realprofits-frontend
sudo systemctl start realprofits-backend realprofits-frontend

# Check status
sudo systemctl status realprofits-backend
sudo systemctl status realprofits-frontend
```

---

## 6. Nginx Reverse Proxy

Install: `sudo apt install -y nginx`

Create `/etc/nginx/sites-available/realprofits`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL (use certbot or your own certs)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Backend API — all /api/* routes
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;

        # Important for cookie-based auth
        proxy_set_header Cookie $http_cookie;
    }

    # Frontend — everything else
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Static assets caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
}
```

### Enable & Test

```bash
sudo ln -s /etc/nginx/sites-available/realprofits /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 7. Database Indexes (Auto-Created)

The backend auto-creates indexes on startup (`db.py → init_db()`):

| Collection | Index | Type |
|------------|-------|------|
| `users` | `email` | unique |
| `login_attempts` | `identifier` | standard |
| `password_reset_tokens` | `expires_at` | TTL |
| `user_data` | `(user_id, tool_key)` | compound unique |
| `resume_drafts` | `draft_id` | unique |
| `ats_checks` | `hash` | unique |
| `ats_checks` | `created_at` | standard |

No manual index creation needed.

---

## 8. Health Check & Verification

After deployment, verify:

```bash
# Backend health
curl https://yourdomain.com/api/health
# Expected: {"status":"healthy","message":"RealProfits API is running"}

# Frontend
curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com
# Expected: 200

# Auth flow
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@realprofits.com","password":"YourAdminPassword"}'
# Expected: 200 with user JSON
```

---

## 9. Docker Alternative (Optional)

### Dockerfile — Backend

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "4"]
```

### Dockerfile — Frontend

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["yarn", "start"]
```

### docker-compose.yml

```yaml
version: "3.8"
services:
  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    ports:
      - "8001:8001"
    env_file: ./backend/.env
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file: ./frontend/.env
    depends_on:
      - backend

volumes:
  mongo_data:
```

---

## 10. Monitoring & Logs

```bash
# View logs
sudo journalctl -u realprofits-backend -f
sudo journalctl -u realprofits-frontend -f

# Recommended: Add log rotation
sudo nano /etc/logrotate.d/realprofits
```

### Recommended Monitoring
- **Uptime**: UptimeRobot or Pingdom on `/api/health`
- **Errors**: Sentry (free tier) for both frontend and backend
- **Metrics**: Prometheus + Grafana (optional)

---

## 11. Update / Redeploy Procedure

```bash
cd /opt/realprofits
git pull origin main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart realprofits-backend

# Frontend
cd ../frontend
yarn install --frozen-lockfile
yarn build
sudo systemctl restart realprofits-frontend
```

---

## 12. Security Checklist

- [ ] `JWT_SECRET` is unique, random, 64+ chars — **never committed to git**
- [ ] MongoDB is not exposed to the internet (bind to `127.0.0.1` or use Atlas)
- [ ] HTTPS enforced via Nginx redirect
- [ ] `CORS_ORIGINS` restricted to your domain(s) only
- [ ] Admin password is strong and changed from default
- [ ] `.env` files are in `.gitignore`
- [ ] Rate limiting enabled (Nginx `limit_req` or FastAPI middleware)
- [ ] Firewall: only ports 80, 443, 22 open

---

## Quick Reference

| What | Command |
|------|---------|
| Start backend | `sudo systemctl start realprofits-backend` |
| Start frontend | `sudo systemctl start realprofits-frontend` |
| Restart all | `sudo systemctl restart realprofits-backend realprofits-frontend` |
| View backend logs | `sudo journalctl -u realprofits-backend -f` |
| View frontend logs | `sudo journalctl -u realprofits-frontend -f` |
| Check health | `curl https://yourdomain.com/api/health` |
| Rebuild frontend | `cd /opt/realprofits/frontend && yarn build` |
| SSL renew | `sudo certbot renew` |

---

*Generated for RealProfits platform — Next.js 16 + FastAPI + MongoDB*
