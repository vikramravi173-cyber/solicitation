#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

pkill -f "next dev" 2>/dev/null || true

for p in 3000 3001 3002; do
  lsof -ti:"$p" | xargs kill -9 2>/dev/null || true
done

sleep 2

for p in 3000 3001 3002; do
  if lsof -ti:"$p" >/dev/null 2>&1; then
    echo "Port $p is still in use. Stop the process manually and retry." >&2
    lsof -nP -iTCP:"$p" -sTCP:LISTEN >&2 || true
    exit 1
  fi
done

rm -rf .next node_modules/.cache
echo "Cleared .next cache. Starting dev server on http://localhost:3000"
exec npx next dev -p 3000
