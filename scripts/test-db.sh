#!/usr/bin/env bash
# Applies supabase/schema.sql + every migration (in filename order) to an
# empty Postgres, runs each migration a second time to prove it is safe to
# re-run, then runs the access-rule tests in supabase/tests/.
#
# Uses the standard libpq env vars (PGHOST, PGPORT, PGUSER, PGPASSWORD,
# PGDATABASE). The database must be empty and the user a superuser.
set -euo pipefail
cd "$(dirname "$0")/.."

PSQL=(psql -X -q -v ON_ERROR_STOP=1 --set=client_min_messages=warning)

echo "==> Supabase stub"
"${PSQL[@]}" -f supabase/tests/00_supabase_stub.sql

echo "==> schema.sql"
"${PSQL[@]}" -f supabase/schema.sql

for m in supabase/migrations/*.sql; do
  echo "==> $m"
  "${PSQL[@]}" -f "$m"
done

for m in supabase/migrations/*.sql; do
  echo "==> re-run $m"
  "${PSQL[@]}" -f "$m"
done

for t in supabase/tests/[1-9]*.sql; do
  echo "==> $t"
  "${PSQL[@]}" -f "$t"
done
