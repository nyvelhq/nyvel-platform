# Nyvel Agent Status

This file is the source of truth for the autonomous build orchestrator. It is
read at the start of every run and updated (in the same PR) whenever a queue
item moves to "in PR".

_Last updated: 2026-09-23 by the orchestrator (New Test creation error)._

## Current state (as of Sep 23, 2026)

- DONE and live: real Supabase auth with a 7-table schema and RLS; DataContext
  wired to Supabase; C-03 company application review; C-04/C-05 tester
  findings plus company triage; C-06 admin payouts (append-only, no unmark).
- Seed accounts: `test-company@nyvel.co` (company), `test-tester@nyvel.co`
  (tester), `testeadu@gmail.com` (admin).
- Not yet exercised live: the Reject/More Info path in finding triage.

## Queue

1. **New Test creation error** — `Could not find the 'age_range' column of
   'tests' in the schema cache` (400). — _status: in PR — see PR log below._
2. **F-08** — replace the fabricated admin dashboard metrics with real
   Supabase queries. — _status: not started_
3. **Remove the "Fintech & Payments — non-sandbox payment testing with
   real-world financial flows" claim** from the public marketing site
   (compliance risk). — _status: not started_
4. **F-10** — QA test plan and Definition of Done, plus unit tests for
   DataContext functions. — _status: not started_
5. **F-05** — GitHub Actions CI that runs install, test and build on every
   PR. — _status: not started_
6. **F-06** — secrets, backups and monitoring runbook (docs only unless
   trivial). — _status: not started_
7. **F-07** — STRIDE threat model doc. — _status: not started_

### Blocked (skip)

- **C-07** — payout email (needs an email provider).
- Payments (beyond sandbox/non-sandbox scoping already noted above).
- Legal / compliance sign-off items beyond the marketing-copy fix in the
  queue.

## PR log

- **New Test creation error** — root-caused: `CreateTest.jsx`/`DataContext.jsx`
  already insert exactly the columns migration `0002_test_fields_and_rls.sql`
  adds (`compensation`, `start_date`, `end_date`, `platforms`, `expertise`,
  `age_range`, `countries`, `nda`, `briefing`) — no code mismatch. The 400 means
  that `alter table` was never actually applied to production (or PostgREST's
  schema cache never refreshed after it was). Added
  `supabase/migrations/0005_reassert_test_fields.sql` (idempotent re-run of
  0002's columns + `notify pgrst, 'reload schema'`) and a regression test
  (`src/context/DataContext.test.jsx`) that pins the exact column set
  `addCompanyTest` is allowed to write, so a future rename/typo fails CI
  instead of shipping. PR: (added on push, see repo).
