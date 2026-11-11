#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CACHE_DIR="$PROJECT_DIR/.cache/hallmark"
REVISION=407fa689f4a276f2fd389208d271d0fef08f5058
if [[ ! -d "$CACHE_DIR/.git" ]]; then mkdir -p "$(dirname "$CACHE_DIR")"; git clone https://github.com/Nutlope/hallmark.git "$CACHE_DIR"; fi
git -C "$CACHE_DIR" checkout --detach "$REVISION"
export HALLMARK_PUPPETEER="$PROJECT_DIR/node_modules/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js"
cd "$PROJECT_DIR"
node "$CACHE_DIR/skills/hallmark/scripts/sloplint.mjs" src --scope app --genre editorial --render \
 --url http://127.0.0.1:8097 --url 'http://127.0.0.1:8097/#reader' \
 --url 'http://127.0.0.1:8097/#practice' --url 'http://127.0.0.1:8097/#notes' \
 --url 'http://127.0.0.1:8097/#notes?tab=review'
