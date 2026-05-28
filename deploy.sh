#!/bin/bash
set -e

PROJECT="realprofit"
BASE="/home/realprofit"
REPO="$BASE/public_html"

echo "▶ Enter repo"
cd "$REPO"

echo "▶ Pull latest code"
git pull origin main || git pull origin master

echo "▶ Enter frontend"
cd "$REPO/frontend"

echo "▶ Installing dependencies"
yarn install --frozen-lockfile

echo "▶ Building static export"
yarn build

echo "▶ Restart backend"
export XDG_RUNTIME_DIR=/run/user/$(id -u) && \
systemctl --user restart realprofit-backend

echo "✅ Deploy finished successfully"
