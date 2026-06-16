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

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created .env.local — add ANTHROPIC_API_KEY before running analysis."
else
  echo ".env.local already exists."
fi

npm install
npm run parse-pdf

echo ""
echo "Next steps:"
echo "  1. Edit .env.local with ANTHROPIC_API_KEY"
echo "  2. npm run dev"
echo "  3. Open http://localhost:3000 and start a company analysis"
