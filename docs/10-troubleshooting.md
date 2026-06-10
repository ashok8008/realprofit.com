# 10 — Troubleshooting Guide

A field-tested catalogue of failures we've actually seen on this codebase,
and how to fix them.

## Log Locations

| Service             | Log file                                                     |
|---------------------|--------------------------------------------------------------|
| Backend (supervisor / dev pod) | `/var/log/supervisor/backend.{out,err}.log`        |
| Frontend (supervisor)          | `/var/log/supervisor/frontend.{out,err}.log`       |
| Backend (production systemd)   | `journalctl -u rp-backend -f`                       |
| Frontend (PM2)                 | `pm2 logs rp-frontend --lines 200`                  |
| Nginx                          | `/var/log/nginx/{access,error}.log`                 |
| MongoDB                        | `/var/log/mongodb/mongod.log`                       |
| PostgreSQL                     | `/var/log/postgresql/postgresql-15-main.log`        |

## 10.1 Backend fails to start: `Cannot assign requested address (asyncpg)`

**Symptom**: `tail /var/log/supervisor/backend.err.log` shows
`[Errno 99] Cannot assign requested address` followed by an asyncpg
connection error on `127.0.0.1:5432`.

**Root cause**: PostgreSQL is not running on the host.

**Fix**:
```bash
# Pod / dev:
apt-get install -y postgresql postgresql-contrib   # if missing
pg_ctlcluster 15 main start
sudo -u postgres psql -c "CREATE USER realprofits WITH PASSWORD 'realprofits_dev';"
sudo -u postgres psql -c "CREATE DATABASE realprofits_esign OWNER realprofits;"
sudo supervisorctl restart backend

# Prod:
sudo systemctl status postgresql
sudo systemctl restart postgresql
sudo systemctl restart rp-backend
```

## 10.2 PDF viewer 404: `pdf.worker.min.mjs not found`

**Symptom**: Browser console shows `GET https://cdnjs.cloudflare.com/.../pdf.worker.min.mjs 404`.

**Root cause**: PDF.js fetching its worker from a CDN that broke; the
self-hosted worker isn't there because `prebuild` didn't run.

**Fix**:
```bash
cd /app/frontend
yarn build               # triggers prebuild → copies worker into public/pdfjs/
sudo supervisorctl restart frontend     # or pm2 reload rp-frontend
```

The worker path used by the app is `/pdfjs/pdf.worker.min.mjs`; confirm:

```bash
curl -sI https://your-host/pdfjs/pdf.worker.min.mjs | head -3
```

## 10.3 "Failed to send email" / Resend silently no-ops

**Symptom**: `/api/admin/email-diag` shows `RESEND_API_KEY` and
`SENDER_EMAIL` set, but no email arrives.

**Common root causes**:

1. `SENDER_EMAIL` uses an unverified domain. Resend silently drops these.
2. `SENDER_EMAIL` is wrapped in extra characters from a stray quote in `.env`.
3. The Resend API key is for a different account / wrong environment.

**Fix**:
```bash
# Check what the backend actually parsed
curl -s https://your-host/api/admin/email-diag -H 'Authorization: Bearer <admin>'
# {"resend_configured": true, "sender": "RealProfits <hello@realprofits.com>", "domain_verified": true}
```

If `sender` looks garbled, edit `/app/backend/.env` and restart backend.
If domain not verified, go to https://resend.com/domains and add SPF/DKIM/DMARC records.

## 10.4 Stripe webhook 400 / signature failed

**Symptom**: Stripe dashboard shows repeated 400s on `/api/billing/webhook`.

**Root cause**:

1. `STRIPE_WEBHOOK_SECRET` mismatch (e.g. test-mode secret on prod endpoint).
2. Nginx is buffering or modifying the body; signature uses raw bytes.

**Fix**:
- Match the secret to the endpoint in Stripe → Developers → Webhooks.
- Ensure the request path is exactly `/api/billing/webhook` (no rewrites).
- For nginx, set `proxy_request_buffering off;` for this single location if you see body-mutation issues.

## 10.5 Login returns 429 even with correct password

**Root cause**: Brute-force lockout. After 5 failed attempts for `<ip>:<email>`, a 15-minute lock is applied.

**Fix**:
```bash
mongosh realprofits --eval 'db.login_attempts.deleteMany({identifier: /admin@realprofits.com/})'
```

## 10.6 eSign signing link returns "Invalid signing link"

**Root cause options**:
- Token expired (>30 days by default).
- `signers.token_used = true` (token already consumed).
- `signers.token_hash` was rotated by a subsequent `PATCH /api/esign/documents/{id}` that replaced signers.
- `JWT_SECRET` changed since the token was minted.

**Fix**: From the dashboard, void the document and resend, or manually mint a new token in a one-off script.

## 10.7 Frontend shows blank CSS / unstyled HTML

**Symptom**: Pages load but look unstyled in production.

**Likely causes**:
1. `yarn start` is running on the wrong port; nginx is proxying to the wrong PM2 instance.
2. `.next/` was rebuilt while PM2 still serves the old build — restart PM2.

**Fix**:
```bash
pm2 reload rp-frontend
curl -sI https://your-host/_next/static/css/<sha>.css | head -3
```

## 10.8 "Auth failed" loop — endless redirect to /login

**Root cause**: `access` cookie not being sent. Two common reasons:
1. The frontend calls a different origin than `NEXT_PUBLIC_BACKEND_URL` — cookie scope wrong.
2. `SameSite=Lax` blocking cross-site iframe requests.

**Fix**: Confirm the page is loaded from the same host that issued the cookie. Open DevTools → Application → Cookies and verify `access` is present and scoped to your domain.

## 10.9 Invoice attachment 413 Payload Too Large

**Root cause**: nginx `client_max_body_size` too small, or invoice attachment exceeds 10 MB cap.

**Fix**:
- Backend cap: env `MAX_UPLOAD_BYTES`.
- nginx: `client_max_body_size 30M;` inside the relevant server block.

## 10.10 Build OOM on small VPS (`JavaScript heap out of memory`)

**Fix**:
```bash
NODE_OPTIONS="--max-old-space-size=2048" yarn build
```

Or upgrade the box. The build needs ~1.5 GB peak for the SSG of all pSEO pages.

## 10.11 PostgreSQL "permission denied for schema public"

**Root cause**: Postgres 15 revoked `CREATE` on `public` from `PUBLIC`.

**Fix**:
```sql
GRANT ALL ON SCHEMA public TO realprofits;
```

## 10.12 Debugging Procedures

```bash
# Tail everything
sudo tail -n 200 -f /var/log/supervisor/backend.err.log

# Live-reload a single Python file
# (uvicorn reload is on in supervisor; just save the file)

# Manual smoke
API=https://your-host
curl -s $API/api/health
curl -s -X POST $API/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@realprofits.com","password":"…"}' -c /tmp/c.txt
curl -s -b /tmp/c.txt $API/api/esign/documents | jq .

# Mongo shell
mongosh realprofits
> db.users.findOne({email: "admin@realprofits.com"})

# Postgres shell
sudo -u postgres psql realprofits_esign
=> \dt
=> SELECT id, title, status FROM documents ORDER BY created_at DESC LIMIT 10;

# pytest
cd /app/backend
/root/.venv/bin/pytest tests/ -v -x
```
