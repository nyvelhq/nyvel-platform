#!/usr/bin/env bash
# Builds the React app into e2e/.app-build, pointed at the local e2e
# Supabase. The anon key comes from `supabase status`, so nothing secret is
# committed.
set -euo pipefail
cd "$(dirname "$0")/.."

eval "$(npx supabase status -o env | grep -E '^(API_URL|ANON_KEY)=')"

cd ..
BUILD_PATH=e2e/.app-build \
REACT_APP_SUPABASE_URL="$API_URL" \
REACT_APP_SUPABASE_ANON_KEY="$ANON_KEY" \
REACT_APP_PASSWORD="${E2E_SITE_PASSWORD:-e2e-gate}" \
GENERATE_SOURCEMAP=false \
  npx react-scripts build
