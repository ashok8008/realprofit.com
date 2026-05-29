#!/bin/bash
set -e

PROJECT="realprofit"
BASE="/home/realprofit"
REPO="$BASE/public_html"

echo "▶ Enter repo"
cd "$REPO"

echo "▶ Pull latest code"
git pull origin main || git pull origin master

# ── Backend ────────────────────────────────────────────────
echo "▶ Update backend dependencies"
cd "$REPO/backend"
if [ -d "venv" ]; then
  source venv/bin/activate
  pip install --quiet -r requirements.txt
  deactivate
else
  echo "⚠ backend/venv not found — skipping pip install"
fi

# ── Frontend ───────────────────────────────────────────────
echo "▶ Enter frontend"
cd "$REPO/frontend"

echo "▶ Installing dependencies"
yarn install --frozen-lockfile

echo "▶ Building Next.js (server mode)"
yarn build

# ── Restart services ───────────────────────────────────────
echo "▶ Restart backend"
export XDG_RUNTIME_DIR=/run/user/$(id -u)
systemctl --user restart realprofit-backend

echo "▶ Restart frontend (PM2)"
# Find the PM2 process name automatically — falls back to "realprofit-frontend"
PM2_NAME=$(pm2 jlist 2>/dev/null | python3 -c "
import json, sys
try:
  procs = json.load(sys.stdin)
  for p in procs:
    if 'next' in (p.get('pm2_env', {}).get('exec_path', '') or '').lower() or '6001' in str(p.get('pm2_env', {}).get('PORT', '')):
      print(p['name']); break
except Exception:
  pass
" 2>/dev/null)
PM2_NAME=${PM2_NAME:-realprofit-frontend}

if pm2 list | grep -q "$PM2_NAME"; then
  pm2 reload "$PM2_NAME" --update-env
else
  echo "⚠ PM2 process '$PM2_NAME' not found — starting fresh"
  PORT=6001 pm2 start yarn --name "$PM2_NAME" --interpreter bash -- start
  pm2 save
fi

echo "✅ Deploy finished successfully"
