#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 18+ is required. Install from https://nodejs.org/ or run: brew install node"
  exit 1
fi

echo "Using Node $(node -v)"

npm install
npm run parse-pdf

echo ""
echo "Next steps:"
echo "  npm run dev"
echo "  Open http://localhost:3000"
