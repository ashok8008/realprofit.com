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
PM2_NAME="realprofits.com"
if pm2 list | grep -q "$PM2_NAME"; then
  pm2 reload "$PM2_NAME" --update-env
else
  echo "⚠ PM2 process '$PM2_NAME' not found — starting from ecosystem.config.js"
  cd "$BASE/public_html"
  pm2 start ecosystem.config.js
  pm2 save
fi

echo "✅ Deploy finished successfully"
