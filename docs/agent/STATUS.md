# Nyvel Agent Status

This file is the source of truth for the autonomous build orchestrator. It is
read at the start of every run and updated (in the same PR) whenever a queue
item moves to "in PR".

_Last updated: 2026-09-23 by the orchestrator (F-10)._

## Current state (as of Sep 23, 2026)

- DONE and live: real Supabase auth with a 7-table schema and RLS; DataContext
  wired to Supabase; C-03 company application review; C-04/C-05 tester
  findings plus company triage; C-06 admin payouts (append-only, no unmark).
- New Test creation's schema-cache error is fixed pending Eben running the
  migration in PR #13 (merged) against production.
- F-08 (real admin dashboard metrics) is merged (PR #14) and live.
- Seed accounts: `test-company@nyvel.co` (company), `test-tester@nyvel.co`
  (tester), `testeadu@gmail.com` (admin).
- Not yet exercised live: the Reject/More Info path in finding triage.
- Note for future runs: two orchestrator sessions independently picked up
  the Fintech-copy item (queue #3) concurrently and opened duplicate PRs
  (#15 and #16). #16 was closed as a duplicate; its one extra finding
  (an equivalent claim in `Testimonials.jsx`) was left as a comment on #15
  for that PR to fold in. Check open PRs for an item before starting it,
  not just at the top of a run — another session may have opened one after
  this file was last read.

## Queue

1. **New Test creation error** — `Could not find the 'age_range' column of
   'tests' in the schema cache` (400). — _status: merged —
   https://github.com/nyvelhq/nyvel-platform/pull/13_
2. **F-08** — replace the fabricated admin dashboard metrics with real
   Supabase queries. — _status: merged —
   https://github.com/nyvelhq/nyvel-platform/pull/14_
3. **Remove the "Fintech & Payments — non-sandbox payment testing with
   real-world financial flows" claim** from the public marketing site
   (compliance risk). — _status: in PR (another orchestrator session) —
   https://github.com/nyvelhq/nyvel-platform/pull/15_
4. **F-10** — QA test plan and Definition of Done, plus unit tests for
   DataContext functions. — _status: in PR —
   https://github.com/nyvelhq/nyvel-platform/pull/17_
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
  instead of shipping. PR: https://github.com/nyvelhq/nyvel-platform/pull/13

- **F-08** — `AdminDashboard.jsx` (Platform Overview) rendered
  `src/data/mockData.js`'s fabricated `adminStats`/`platformGrowthData`/
  `recentPlatformActivity`/`topCompanies` (hardcoded totals like 412,847
  users, a 99.97% "uptime", and a 4.8/5.0 "tester satisfaction score" with
  no backing data anywhere in the schema). Replaced with real Supabase
  queries against `profiles`/`tests`/`payouts`/`findings`/`clients`/
  `applications`: real user/test counts, real $ paid out (from the C-06
  payouts table), real accepted-findings counts, a real cumulative growth
  chart, a real recent-activity feed, and real top-companies-by-amount-paid
  table. Metrics with no real data source (uptime, satisfaction score) were
  removed rather than replaced with a different guess — "Findings Awaiting
  Triage" and "Test Fill Rate" (accepted testers vs. target) stand in as
  real, honest alternatives. Aggregation logic extracted into a pure
  `deriveAdminStats()` function with 6 unit tests
  (`src/pages/AdminDashboard.test.js`). Only touches `AdminDashboard.jsx`
  itself — `AdminUsers.jsx`/`AdminTests.jsx`/etc. still use mock data and
  are a separate, larger follow-up (not in this backlog yet). Scope: only
  `src/pages/AdminDashboard.jsx` — no schema, RLS, or migration changes
  (admin already has full-access RLS on every table this page reads).
  PR: https://github.com/nyvelhq/nyvel-platform/pull/14

- **F-10** — added `docs/qa/TEST_PLAN.md` (scope, test types and where they
  live, environments, entry/exit criteria, severity, regression strategy)
  and `docs/qa/DEFINITION_OF_DONE.md` (a concrete checklist, not aspirational
  — column-name-vs-schema check, RLS review requirement, no-fabricated-
  claims, etc., each tied to a real incident or fix already in this repo).
  Added 10 new unit tests for `DataContext.jsx`'s functions — `loadCompanyTests`,
  `loadAvailableTests`, `loadMyApplications` (status/progress derivation),
  `applyToTest`/`hasApplied` (including the no-double-apply guard),
  `acceptApplication`/`declineApplication`, `submitFinding` (including the
  signed-out guard), `triageFinding`, `markPayoutPaid` — on top of the
  existing `addCompanyTest` coverage, using a shared mock Supabase builder
  that records table/payload/filters per call. Verified the new tests
  actually catch regressions by deliberately breaking `acceptApplication`
  locally, watching it fail, then reverting. `src/context/DataContext.test.jsx`
  now has 12 tests; full suite is 27 tests across 5 files.
  PR: https://github.com/nyvelhq/nyvel-platform/pull/17
