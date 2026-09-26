#!/usr/bin/env bash
# Loads supabase/schema.sql (first run only) and every migration into the
# local e2e Supabase started by `npm run db:start`. Never points at
# production: the URL defaults to the local CLI database.
set -euo pipefail
cd "$(dirname "$0")/../.."

DB_URL="${E2E_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
case "$DB_URL" in
  *127.0.0.1*|*localhost*) ;;
  *) echo "Refusing to load the schema into a non-local database: $DB_URL" >&2; exit 1 ;;
esac

PSQL=(psql "$DB_URL" -X -q -v ON_ERROR_STOP=1 --set=client_min_messages=warning)

if [ "$("${PSQL[@]}" -tAc "select to_regclass('public.profiles') is null")" = "t" ]; then
  echo "==> schema.sql"
  "${PSQL[@]}" -f supabase/schema.sql
fi

for m in supabase/migrations/*.sql; do
  echo "==> $m"
  "${PSQL[@]}" -f "$m"
done
