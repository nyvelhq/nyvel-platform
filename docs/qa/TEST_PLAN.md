# Nyvel QA Test Plan

This is the real, current test plan for nyvel-platform — what we actually
test, how, and why, given the app's actual state (a small React 18 + CRA +
Tailwind frontend on Supabase auth/Postgres/RLS, no dedicated QA team, no
e2e runner installed yet). It replaces reliance on ad-hoc, unverifiable
"QA passed" writeups (see `QA_REPORT.md` at the repo root, which predates
the real Supabase backend and should not be treated as current) with a plan
that says what's actually covered, what isn't, and how to tell the
difference.

## 1. Scope

**In scope:**
- `src/` — all React components, pages, and the `DataContext` data layer.
- `supabase/schema.sql` and `supabase/migrations/*.sql` — schema and RLS
  correctness (reviewed, not executed by CI — see §4).
- The public marketing site (`LandingPage.jsx` and `src/components/marketing/`)
  for factual accuracy of claims, not just rendering.

**Out of scope (for now):**
- End-to-end browser testing. No Playwright/Cypress is installed. Manual
  verification against the live Supabase project (or a preview deploy) is
  the substitute until F-05 (CI) and a future e2e setup land.
- Load/performance testing.
- Payment processing (blocked in the backlog — Nyvel does not process real
  financial transactions; see the Fintech & Payments copy fix for why this
  matters even in marketing text).

## 2. Test types and where they live

| Type | Tool | Where | What it catches |
|---|---|---|---|
| Unit — pure logic | Jest | `*.test.js` next to the module (e.g. `AdminDashboard.test.js` tests the exported `deriveAdminStats`) | Aggregation/derivation bugs, independent of rendering or Supabase |
| Unit/integration — hooks & data layer | Jest + React Testing Library, mocked `supabase` client | `src/context/DataContext.test.jsx` | Wrong table/column names, wrong payload shape, wrong guard conditions (e.g. "don't double-apply"), wrong status mapping — the exact class of bug that caused the `age_range` schema-cache incident |
| Component/integration | Jest + RTL | `src/pages/*.test.jsx` | Multi-step UI flows (e.g. `CreateTest.test.jsx`'s step transitions) |
| Copy/compliance regression | Jest, plain string assertions | `src/marketingCopyClaims.test.js` | A fabricated or risky claim (e.g. "non-sandbox... real-world financial flows") silently reappearing in marketing copy |
| Manual/exploratory | A human, against a preview deploy or local `npm start` with real `.env.local` Supabase credentials | N/A | RLS behavior under a real session, visual/UX regressions, anything CI can't see |

**Why mock Supabase instead of hitting a real test database:** there is no
CI-provisioned Supabase project, and the hard rule is never to run SQL
against production. Mocking `supabase.from(...)` lets tests assert on
exactly what DataContext sends (table, columns, filters) without needing
real infrastructure. This does **not** replace verifying RLS itself — RLS
is reviewed by reading the policy, and exercised live by a human (see §5),
never assumed correct because a mocked unit test passed.

## 3. Environments

- **Local**: `npm start` against `.env.local` (copy `.env.example`). Used
  for manual verification during development.
- **CI** (once F-05 lands): `npm ci && npm test -- --watchAll=false && npm run build`
  on every PR, no live Supabase access.
- **Production**: Supabase project + Vercel deploy. Never touched by
  automated tests; migrations and manual verification only, always by a
  human (see `docs/agent/RULES.md`'s hard rules).

## 4. Entry / exit criteria

**Entry** (before starting work on a change):
- The bug/feature is reproducible or the acceptance criteria are written
  down (see `docs/agent/RULES.md`'s BA pass).
- If the change touches schema, RLS, or a new integration, a short ADR
  exists in `docs/adr/` first.

**Exit** (before a PR is opened) — see `DEFINITION_OF_DONE.md` for the full
checklist. In short: `npm ci && npm test -- --watchAll=false && npm run build`
all pass locally, new/changed behavior has a test that would fail without
the fix, and any RLS/auth-relevant change has been read and reasoned about
by a human or explicitly flagged as unverified.

## 5. Severity and priority

| Severity | Definition | Example |
|---|---|---|
| Critical | Data loss, security/RLS bypass, or the app fails to boot | `supabaseClient` throwing at import time (the incident that motivated the current guard in `src/lib/supabaseClient.js`) |
| High | A core loop is broken for a whole role (company/tester/admin) | The `age_range` schema-cache 400 blocking all test creation |
| Medium | A feature works but degrades UX or shows wrong (not fake) data | A miscomputed KPI on the admin dashboard |
| Low | Cosmetic, copy, or an edge case with a workaround | A misaligned badge color |

Priority is severity adjusted by how many real users hit it today; with a
small beta userbase, a Critical bug on a rarely-used admin page may still
be lower priority than a High bug on the tester application flow.

## 6. Regression strategy

- Every bug fix gets a test that fails on the old code and passes on the
  fix (verified by literally breaking the fix locally and watching the
  test fail, then reverting — this is not optional, see
  `DEFINITION_OF_DONE.md`).
- Derived/aggregated data (dashboard metrics, growth charts, activity
  feeds) is computed by a pure, exported function wherever practical
  (`deriveAdminStats` is the model to follow) so the math can be tested
  without mounting a page or mocking auth/routing.
- Marketing and product copy that makes a factual or compliance-relevant
  claim gets a copy-regression test (see `marketingCopyClaims.test.js`),
  not just a one-time fix.

## 7. Roles

Matches `docs/agent/RULES.md`'s role passes: BA writes acceptance
criteria, SWE implements + adds tests, Security reviews RLS/auth/secrets,
QA runs the exit criteria. On a solo/small team this is one person moving
through the passes in order, not four different people — the point is
doing each pass deliberately, not skipping straight to "looks done."
