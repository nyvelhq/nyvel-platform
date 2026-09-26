# Nyvel Agent Status

This file is the source of truth for the autonomous build orchestrator. It is
read at the start of every run and updated (in the same PR) whenever a queue
item moves to "in PR".

_Last updated: 2026-09-26 by the orchestrator (UX-01 NDA follow-up)._

## Current state (as of Sep 23, 2026)

- DONE and live: real Supabase auth with a 7-table schema and RLS; DataContext
  wired to Supabase; C-03 company application review; C-04/C-05 tester
  findings plus company triage; C-06 admin payouts (append-only, no unmark);
  F-08 admin dashboard metrics now real Supabase queries (PR #14, merged);
  the Fintech & Payments marketing-copy fix (PR #15, merged); F-05 (GitHub
  Actions CI on every PR) was already implemented and working — no PR
  needed, see the F-05 note below.
- New Test creation's "age_range" schema-cache error is fixed in code
  (PR #13, merged) pending Eben running
  `supabase/migrations/0005_reassert_test_fields.sql` against production if
  it hasn't been already.
- Seed accounts: `test-company@nyvel.co` (company), `test-tester@nyvel.co`
  (tester), `testeadu@gmail.com` (admin).
- Not yet exercised live: the Reject/More Info path in finding triage.
- Note for future runs: two orchestrator sessions independently picked up
  the Fintech-copy item (queue #3) concurrently and opened duplicate PRs
  (#15 and #16). #16 was closed as a duplicate; its one extra finding (an
  equivalent claim in `Testimonials.jsx` — "Validate payment flows in the
  real world" / "ship money-moving features with confidence" — that #15's
  own verification missed) was left as a comment on #15 for that PR to fold
  in. Worth checking whether that comment was addressed before treating the
  Fintech-copy compliance risk as fully closed. Check open PRs for an item
  before starting it, not just at the top of a run — another session may
  have opened one after this file was last read.

## Queue

1. ~~**New Test creation error**~~ — _status: done — merged via
   https://github.com/nyvelhq/nyvel-platform/pull/13_
2. ~~**F-08**~~ — replace the fabricated admin dashboard metrics with real
   Supabase queries. — _status: done — merged via
   https://github.com/nyvelhq/nyvel-platform/pull/14_
3. ~~**Remove the "Fintech & Payments — non-sandbox payment testing with
   real-world financial flows" claim**~~ from the public marketing site
   (compliance risk). — _status: done — merged via
   https://github.com/nyvelhq/nyvel-platform/pull/15_ (see the note above on
   the Testimonials.jsx gap flagged in review comments)
4. ~~**F-10**~~ — QA test plan and Definition of Done, plus unit tests for
   DataContext functions. — _status: done — merged via
   https://github.com/nyvelhq/nyvel-platform/pull/17_
5. ~~**F-05**~~ — GitHub Actions CI that runs install, test and build on
   every PR. — _status: already done, no code change needed —
   https://github.com/nyvelhq/nyvel-platform/pull/18_
6. ~~**F-06**~~ — secrets, backups and monitoring runbook (docs only unless
   trivial). — _status: done — merged via
   https://github.com/nyvelhq/nyvel-platform/pull/19_
7. ~~**F-07**~~ — STRIDE threat model doc. — _status: done — merged via
   https://github.com/nyvelhq/nyvel-platform/pull/20_
8. ~~**UX-01 Honesty pass**~~ — remove or make real every fabricated number,
   badge and claim a user can see (from the Sep 25 UI/UX review, approved by
   Eben). Tester dashboard/profile earnings and stats, company dashboard
   stats and charts, the demo notification bell, the five mock admin pages
   (Users, Tests, Reports, Security, Settings → "Coming soon"), and the
   landing page's live-metrics ledger, activity ticker, country/turnaround/
   free-trial claims and unbuilt pricing features. — _status: done — merged via
   https://github.com/nyvelhq/nyvel-platform/pull/21_; NDA-claim follow-up in
   https://github.com/nyvelhq/nyvel-platform/pull/22_
9. **UX-02 Close the loop** — the core company↔tester flow dead-ends in
   four places: show the test briefing (and NDA flag) to accepted testers;
   let a company mark a test complete; let a tester reply to a
   "More info needed" finding; add a confirmation step to admin
   "Mark Paid" (irreversible) and surface payout load/save errors instead of
   an empty state. — _status: not started_ (the "reply to more info" part
   likely needs a schema change → Architect pass + migration)

### Blocked (skip)

- **C-07** — payout email (needs an email provider).
- **NDA acceptance** — a real click-through NDA step for tests marked
  NDA-required (record acceptance per application before the briefing/build
  access is shown). Needs the NDA text from Eben (legal) plus a migration
  (e.g. `applications.nda_accepted_at`). Until then, UX-01 made all copy say
  only what the app enforces and tells companies to arrange NDAs directly.
- Payments (beyond sandbox/non-sandbox scoping already noted above).
- Legal / compliance sign-off items beyond the marketing-copy fix in the
  queue.

### Proposed new items (from F-07's findings — not yet added to the numbered
queue; a product-owner call for whoever prioritizes next)

- Fix `profiles: admin can insert`'s self-insert branch, which doesn't pin
  `role = 'tester'` the way the self-update policy does — a latent
  privilege-escalation gap (currently unreachable in the normal signup
  path, blocked by the `handle_new_user()` trigger + primary key, but a
  real hole in the policy's own design). See
  `docs/security/STRIDE_THREAT_MODEL.md` §2.6/§3.1 for the exact one-line
  fix.
- Add payout immutability (a trigger rejecting updates once
  `status = 'paid'`) and/or a lightweight audit/history table — `payouts`
  is documented as "append-only once paid" but nothing actually enforces
  that. See STRIDE doc §2.2 (T4) / §2.3 (R2).
- Cap findings submissions per tester per test — there's currently no
  limit on how many `findings` rows one accepted tester can insert for a
  test. See STRIDE doc §2.5 (D3).
- Replace `AdminSecurity.jsx`'s fabricated "2FA enabled 98%" / fake threat
  log with real data or an honest "not implemented" state — same class of
  fix as F-08 already did for the admin dashboard. See STRIDE doc §2.3
  (R3).

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
- **Fintech & Payments marketing copy** — removed the "Non-sandbox payment
  testing with real-world financial flows" claim from
  `src/data/mockData.js` (`testTypes`, rendered on the public landing page's
  `#test-types` section). Also fixed the same claim ("Real transaction
  testing") in `src/pages/CreateTest.jsx`'s test-type picker, which is
  authenticated company-facing product copy rather than the public site but
  asserts the identical non-sandbox/live-money capability — left in scope
  since it's a one-line copy fix addressing the same compliance risk.
  PR: https://github.com/nyvelhq/nyvel-platform/pull/15
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
- **F-05** — no code change: `.github/workflows/ci.yml` ("CI Pipeline") has
  existed since 2026-07-14 and already does exactly what this item asked —
  three jobs (lint, build, test) triggered on every `push` to `main`/`develop`
  and every `pull_request` targeting them, each running `npm ci` first. It
  has run successfully on every PR and merge this session (runs #52–#66,
  e.g. https://github.com/nyvelhq/nyvel-platform/actions/runs/35889362212 for
  PR #17) — verified via the GitHub Actions API
  (`mcp__github__actions_list`/`actions_get`), not just assumed from the repo
  containing a workflow file. The backlog's "not started" was stale; earlier
  PRs in this run checked `get_status` (the legacy commit-status API, which
  only shows things like Netlify/Vercel) instead of Actions check-runs, so
  the running CI was invisible in those checks — worth remembering for
  future runs. One real gap I can't fix from a PR: I have no way to verify
  whether these checks are set as "required" in main's branch protection
  rules (that's a repo Settings change, not a code change) — flagged under
  "Eben must do" below. **Update: Eben confirmed this is now set up** (a
  classic branch protection rule on `main` requiring the Lint/Build/Test
  checks and up-to-date branches). `deploy.yml` (a separate Vercel-deploy-notification
  workflow, largely redundant with Vercel's own GitHub integration) exists
  too but wasn't in scope for this item.
  PR: https://github.com/nyvelhq/nyvel-platform/pull/18
- **F-06** — added `docs/ops/RUNBOOK.md`, a real (not generic) secrets/
  backups/monitoring inventory. Secrets: all 3 env vars the code actually
  reads (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`,
  `REACT_APP_PASSWORD`), where they're set (Vercel dashboard), and a real
  live finding — `src/utils/accessGate.js` (wired into `App.js`'s
  site-wide pre-launch gate) and the unused `PrivateAccess.jsx` both
  silently fall back to the hardcoded password `'nyvel2024'` if
  `REACT_APP_PASSWORD` is ever unset in an environment. Flagged under
  "Eben must do" rather than silently changed, since changing the fallback
  behavior is a product decision, not a docs fix. **Update: turned out
  worse than assessed** — Eben checked the Vercel dashboard and found
  `REACT_APP_PASSWORD` was unset in *every* environment including
  Production, meaning the live site had been running on the hardcoded
  fallback the whole time (the site "working" was never evidence the var
  was set, since the fallback is designed to keep it working either way).
  Eben set a real value in all three environments and redeployed
  Production — verified resolved; `docs/ops/RUNBOOK.md` §1.2 updated to
  record the corrected severity and the lesson (check the dashboard
  directly, don't infer from app behavior). Added the missing var to
  `.env.example` and a one-line pointer comment at both hardcoded-default
  sites (trivial, safe — no behavior change).
  Backups: no Supabase CLI/config in this repo, migrations are a
  schema-reproducibility record but not a data backup, and the actual
  Supabase plan/backup/PITR settings can't be checked from the repo — that
  whole section is "Eben must do" (check the dashboard, verify a restore
  actually works once). Monitoring: confirmed there is currently none at
  all (no Sentry/LogRocket/Datadog/PostHog/Vercel Analytics in
  `package.json`, no monitoring code anywhere, nothing in the CI
  workflows) — ties back to F-08's removal of the fabricated "99.97%
  uptime" stat, which was never measuring anything real. Listed a
  cheapest-first menu of options (Vercel's own dashboard today, Vercel
  Analytics, Supabase's dashboard, a free uptime checker, then Sentry as a
  real but non-trivial follow-up) rather than picking one myself. Also
  documented, since it caused confusion while researching: `deploy.yml`
  doesn't actually deploy anything — Vercel's native GitHub integration
  does the real deploying, outside this repo's workflow files.
  PR: https://github.com/nyvelhq/nyvel-platform/pull/19
- **F-07** — added `docs/security/STRIDE_THREAT_MODEL.md`, a STRIDE
  analysis checked against the real schema/RLS/auth code rather than
  written generically. Every finding is tagged Verified (read the actual
  policy/code) or Inferred (plausible, not checked against a live
  Supabase project — no DB access from this PR). Headline findings: (1) a
  real but currently-unreachable privilege-escalation gap in the
  `profiles: admin can insert` RLS policy — its self-insert branch never
  pins `role = 'tester'` the way the sibling self-update policy does; (2)
  `payouts`' documented "append-only once paid" is a convention only,
  not enforced by RLS or a constraint — an admin update to a paid row
  today would leave no trace of the prior value; (3) no cap on findings
  submissions per tester per test; (4) `AdminSecurity.jsx` renders
  entirely fabricated 2FA/threat-log data (`mockData.js`) with no
  disclaimer that the *data* itself is fake, same class of issue F-08
  already fixed on the admin dashboard; (5) `schema.sql`'s comment
  claiming rejected/more-info findings "never reach the client" is stale
  — migration 0004 + `CompanyTestDetail.jsx` intentionally broadened this
  so the company/client role can triage all statuses, which is correct
  behavior, just undocumented as a comment update. None of these were
  fixed in this PR — it's a docs-only item per the backlog, and RLS/auth
  changes are explicitly "stop and report instead of guessing" per
  `docs/agent/RULES.md` when CI can't verify them against a live
  project. Proposed follow-up items added below the queue (not
  auto-added to the numbered queue itself — a product-owner/Eben call).
  `npm ci && npm test -- --watchAll=false && npm run build` all still
  pass (27/27 tests, clean build) since no application code changed.
  PR: https://github.com/nyvelhq/nyvel-platform/pull/20
- **UX-01 Honesty pass** — from the Sep 25 UI/UX review (screenshots of all
  21 routes × desktop/mobile against a mocked Supabase). Removed or made real
  everything a user could mistake for real data. Tester dashboard, earnings
  tab and profile now derive from the tester's own applications, accepted
  findings and `payouts` rows (pending payout uses AdminPayouts' own rule);
  the "Top Tester" badge, 4.9 rating, invented bio/location/devices/skills
  and "Fintech Testing Certified" certifications are gone (honest empty
  states instead). Company dashboard stat cards are real (active tests,
  testers accepted, applicants to review, findings to triage), the fake
  activity chart is removed and the severity donut counts real accepted
  findings. Notification bell shows "No notifications yet" (no fake dot).
  Admin Users/Tests/Reports/Security/Settings route to "Coming soon" — page
  files kept for the wire-up follow-up. Landing page: removed the "LIVE"
  ledger (1,284 testers) and ticker (incl. the NeoBank payment line), 42
  countries, 24–48h / 24h capacity, 14-day free trial / no credit card,
  "Most Popular", automatic tester compensation, and unbuilt pricing
  features (API/webhooks, SSO, custom integrations, CSV export); the
  Testimonials fintech card now says sandbox/staging. Service claims that
  may be delivered offline (vetting, NDAs, "professional QA review") and the
  plan prices were left as-is and flagged for Eben. New pure helpers in
  `src/utils/dashboardStats.js` + 7 new tests (34 total). PR: https://github.com/nyvelhq/nyvel-platform/pull/21
