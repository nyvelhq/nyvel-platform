# Nyvel end-to-end tests

Playwright + TypeScript. Tests drive the real app in a browser, sign in as
real users and hit a **throwaway local Supabase** loaded with
`supabase/schema.sql` and every migration, so access rules (RLS, triggers)
are exercised end to end. They never touch production: every helper refuses
a non-local database.

## Run locally

Needs Docker, Node 20 and `psql`.

```bash
cd e2e
npm ci
npx playwright install chromium
npm run db:start      # local Supabase (db, auth, API only)
npm run db:schema     # schema.sql + all migrations
npm run app:build     # builds the app pointed at local Supabase
npm run test:smoke    # or: npm test  (everything)
npm run report        # HTML report, with traces for failures
npm run db:stop
```

Each run resets the database and seeds five accounts (`lib/accounts.ts`):
admin, two companies, two testers.

## Layout

| Path | What it holds |
| --- | --- |
| `tests/auth.setup.ts` | Signs each account in once through the real login form and saves the session. |
| `tests/smoke/` | `@smoke` tier: runs on every PR. |
| `tests/regression/` | Everything else: runs on pushes to main and nightly. |
| `pages/` | Page objects, one per screen. All selectors live here. |
| `fixtures/test.ts` | `as(role)` for a signed-in page, and `expectAccessible(page)` (axe, WCAG 2 AA). |
| `lib/factory.ts` | Creates per-test data with unique names (`createTest`, `enrol`, `addFinding`). |
| `lib/db.ts` | Service-role client for setup and assertions. Only for arranging or inspecting data, never for acting as a user. |

## Conventions

- Tag core-loop tests `@smoke`. Add `@mobile` to also run on a phone
  viewport (Pixel 7).
- Use roles and labels (`getByRole`, `getByLabel`) the way a user or screen
  reader finds things. If you can't, the UI probably needs a label.
- Arrange data with `lib/factory.ts`. Act only through the UI as the right
  role.
- A UI change isn't done until its e2e tests are updated in the same PR
  (`docs/qa/DEFINITION_OF_DONE.md`).

## CI

- **E2E (Playwright)** in `.github/workflows/ci.yml`: `@smoke` on PRs, the
  full suite on pushes to main. On failure, the report, traces, screenshots
  and videos are uploaded.
- **E2E Nightly** (`e2e-nightly.yml`): the full suite every night and on
  demand.

## Roadmap (one area per PR)

Auth and the gate, test creation, applications and NDA, findings triage and
replies, payouts, access requests, admin. Each adds positive, negative and
edge cases under `tests/regression/`.
