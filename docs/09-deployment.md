# 09 — Deployment

The canonical production target is a **single-node Hetzner VPS** running
Debian/Ubuntu. Frontend lives on PM2; backend lives on systemd; Nginx is
the TLS reverse proxy. A static **DEPLOYMENT_GUIDE.md** at the project
root documents one-time host bootstrapping. This file documents the
**recurring** deploy + CI/CD flow.

## 9.1 Build Process

### Frontend (`/app/frontend`)
```bash
yarn install --frozen-lockfile
yarn build          # runs `prebuild` (copy pdf.worker) + `next build` + `postbuild` (IndexNow ping)
```

Output: `.next/` directory ready for `yarn start` (next server mode — NOT
static export). The `prebuild` hook copies
`node_modules/pdfjs-dist/build/pdf.worker.min.mjs` → `public/pdfjs/` so PDF
rendering never depends on cdnjs (which 404'd in the past).

### Backend (`/app/backend`)
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

No "build" step. The app is run via `uvicorn` under systemd:

```ini
# /etc/systemd/system/rp-backend.service
[Unit]
Description=RealProfits API
After=network.target postgresql.service

[Service]
WorkingDirectory=/app/backend
EnvironmentFile=/app/backend/.env
ExecStart=/app/backend/.venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

## 9.2 Deployment Process

### Manual (recommended for low-traffic ops)

```bash
ssh user@prod-host
cd /app
git pull --rebase
./deploy.sh           # see below
```

`deploy.sh` does:

```bash
#!/usr/bin/env bash
set -e
cd /app
git pull --rebase
cd frontend && yarn install --frozen-lockfile && yarn build
pm2 reload rp-frontend
cd ../backend && /app/backend/.venv/bin/pip install -r requirements.txt
sudo systemctl restart rp-backend
```

### CI/CD (`.github/workflows/deploy.yml`)

Triggered on push to `main`. The workflow SSHes to the host (via
`SSH_PRIVATE_KEY` + `SSH_HOST` GitHub Secrets) and runs `deploy.sh`. After
the deploy, the post-build script pings IndexNow + Google sitemap with the
fresh content.

## 9.3 Server Requirements

| Resource         | Minimum                                | Recommended                       |
|------------------|----------------------------------------|-----------------------------------|
| CPU              | 2 vCPU                                 | 4 vCPU                            |
| RAM              | 4 GB                                   | 8 GB                              |
| Disk             | 40 GB SSD (PDFs grow!)                 | 100 GB SSD                        |
| OS               | Debian 12 / Ubuntu 22.04               | same                              |
| Node.js          | 22 (matches Next 16)                   | 22                                |
| Python           | 3.11                                   | 3.11                              |
| MongoDB          | 7                                      | 7                                 |
| PostgreSQL       | 15                                     | 15                                |
| nginx            | any recent                             | 1.24+                             |
| pm2              | latest                                 | latest                            |

## 9.4 PM2 Configuration

```bash
pm2 start "yarn start" --name rp-frontend \
  --cwd /app/frontend \
  --update-env \
  -i 1 \
  --max-memory-restart 1G
pm2 save
pm2 startup    # write systemd hook so pm2 resurrects on reboot
```

> The frontend `start` script is `next start -H 0.0.0.0` and reads `PORT`
> from env. Set `PORT=6001` in `/app/frontend/.env.production` if you want
> a non-default port (the bundled DEPLOYMENT_GUIDE.md uses 6001).

## 9.5 Nginx Configuration

```nginx
# /etc/nginx/sites-available/realprofits
server {
    listen 443 ssl http2;
    server_name realprofits.com www.realprofits.com;

    ssl_certificate     /etc/letsencrypt/live/realprofits.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/realprofits.com/privkey.pem;

    client_max_body_size 30M;

    # /api/* → FastAPI on 8001
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 120s;
    }

    # Everything else → Next.js
    location / {
        proxy_pass http://127.0.0.1:6001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

server {
    listen 80;
    server_name realprofits.com www.realprofits.com;
    return 301 https://realprofits.com$request_uri;
}
```

> `client_max_body_size 30M` allows eSign PDF uploads above the default
> 1 MB.

## 9.6 SSL Setup (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d realprofits.com -d www.realprofits.com
# certbot will auto-renew via systemd timer
sudo systemctl status certbot.timer
```

## 9.7 Database Setup (one-time)

```bash
# Mongo
sudo apt install -y gnupg curl && curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
# ... add repo and install mongodb-org
sudo systemctl enable --now mongod

# Postgres
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql <<'SQL'
CREATE USER realprofits WITH PASSWORD 'CHANGEME';
CREATE DATABASE realprofits_esign OWNER realprofits;
GRANT ALL PRIVILEGES ON DATABASE realprofits_esign TO realprofits;
SQL
```

The FastAPI startup creates the `documents/signers/signature_fields/audit_events/subscriptions/subscription_events/saved_signatures` tables via `Base.metadata.create_all()`. No migrations system is in use — schema changes require either manual `ALTER TABLE` or a one-shot migration script.

## 9.8 Deploy Sanity Checks

```bash
# Backend
curl -s https://realprofits.com/api/health
# {"status":"healthy",...}

# Auth
curl -s -X POST https://realprofits.com/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@realprofits.com","password":"…"}'

# eSign DB reachable
journalctl -u rp-backend -n 50 --no-pager | grep -i 'postgres\|asyncpg'   # should be silent

# Frontend
curl -sI https://realprofits.com/ | head -3
curl -sI https://realprofits.com/tools/esign/dashboard | head -3
```

## 9.9 Zero-Downtime Notes

- `pm2 reload` runs a graceful restart — in-flight requests finish on the old worker.
- `systemctl restart rp-backend` is a ~1 s hard restart. Acceptable because requests are short. If you need true zero-downtime, wrap the service in `--instances 2` via PM2 + a Python WSGI/ASGI manager, or front it with two systemd units behind nginx upstream.

## 9.10 Rollback

```bash
cd /app
git log --oneline -10            # find previous good SHA
git reset --hard <sha>
./deploy.sh
```

Postgres rollback: no automated migrations means no automated rollback. If
you ALTER a column, write the inverse before deploying.
