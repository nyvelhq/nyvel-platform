# Nyvel Ops Runbook: Secrets, Backups, Monitoring

This is the real, current state of Nyvel's secrets, backups, and monitoring
— what exists, what's verified vs. inferred, and what's genuinely missing.
It replaces guessing with an honest inventory. Where something needs a
human to check or decide (a Supabase dashboard setting, a business
decision to pay for a tool), that's called out explicitly rather than
assumed.

## 1. Secrets

### Inventory — every env var actually read by the code

| Variable | Used in | Purpose | Where it's set |
|---|---|---|---|
| `REACT_APP_SUPABASE_URL` | `src/lib/supabaseClient.js` | Supabase project URL | Vercel → Project Settings → Environment Variables (per `DEPLOYMENT_GUIDE.md`) |
| `REACT_APP_SUPABASE_ANON_KEY` | `src/lib/supabaseClient.js` | Supabase anon/public API key | Same as above |
| `REACT_APP_PASSWORD` | `src/utils/accessGate.js`, `src/components/ui/PrivateAccess.jsx` | The site-wide pre-launch password gate (see §1.2) | Same as above |

No other secrets exist in this codebase — no Supabase service-role key, no
third-party API keys, no GitHub Actions secrets beyond the built-in
`secrets.GITHUB_TOKEN` (used only for `deploy.yml`'s deployment-status
marker, not for app secrets).

**Is the Supabase anon key actually sensitive?** No — by design. It's
meant to be public (it ships in the browser bundle of every visitor). What
actually protects data is Row Level Security on the Supabase tables (see
`supabase/schema.sql`), not keeping this key secret. Don't spend effort
"protecting" it beyond normal env-var hygiene.

### 1.1 Where secrets live today

All three vars are set in the **Vercel dashboard** (Project Settings →
Environment Variables), per `DEPLOYMENT_GUIDE.md`. Locally, they go in
`.env.local` (git-ignored — confirmed in `.gitignore`; never commit real
values there). `.env.example` documents the two Supabase vars but did not
list `REACT_APP_PASSWORD` before this doc — fixed alongside this PR.

**No rotation policy exists anywhere in the repo.** If you need to rotate
the Supabase anon key: Supabase dashboard → Project Settings → API →
regenerate, then update the Vercel env var and redeploy. There is
currently no documented cadence for doing this proactively (see §1.3).

### 1.2 RESOLVED (2026-09-23): the password gate's hardcoded fallback

`src/utils/accessGate.js` (the gate actually wired into `App.js`, guarding
every route except `/`, `/login`, `/reset-password`) and the unused
`src/components/ui/PrivateAccess.jsx` (dead code — not imported anywhere,
confirmed by repo-wide search; safe to delete in a future cleanup, not
done here since it's out of scope for a docs-only item) both contain:

```js
process.env.REACT_APP_PASSWORD || 'nyvel2024'
```

**This was worse than first assessed.** The initial version of this doc
guessed the gap was likely Preview/Development-only, since Production
"working" was assumed to mean it had a real value set. That assumption
was wrong: when Eben checked the Vercel dashboard, `REACT_APP_PASSWORD`
was **not set in any environment, including Production** — the live site
had been running on the hardcoded fallback `nyvel2024` the entire time.
"The site works" was never evidence the var was set correctly, because
the fallback is specifically designed to make the site keep working
either way — that's what made this easy to miss.

**Fix applied**: Eben added `REACT_APP_PASSWORD` with a real, non-default
value to all three Vercel environments (Production, Preview, Development)
and redeployed Production to pick it up. Verified resolved.

**Lesson for future secrets audits**: "the app boots and looks fine" is
not sufficient evidence that a var with a fallback default is actually
set — check the Vercel dashboard directly, don't infer from behavior.

### 1.3 Recommended rotation cadence (not yet a policy — proposing one)

- **Supabase anon key**: rotate if ever exposed unexpectedly (e.g.,
  committed to a public fork, leaked in a support ticket) — otherwise, low
  urgency given it's designed to be public and RLS is the real boundary.
- **`REACT_APP_PASSWORD`**: rotate whenever someone who had it (a beta
  tester, an investor sent a `?key=` link) no longer should, and once the
  product is public and the gate is removed entirely, delete the var. No
  fixed calendar cadence needed for a value this low-stakes.

## 2. Backups

**This section is the least verifiable from the repo alone — most of it
needs Eben to check the Supabase dashboard directly, listed under "Eben
must do."**

- No `supabase/config.toml` or Supabase CLI project setup exists in this
  repo — schema changes are applied manually via the Supabase SQL editor
  (see every file in `supabase/migrations/`, each with a "run this in the
  SQL editor" comment). This means `supabase/migrations/*.sql` is a
  reasonably good **schema-reproducibility** record (you could rebuild the
  table structure from these files) but it is **not a data backup** — it
  says nothing about actual row data, and nothing enforces that it was
  actually run (see the `age_range` incident, PR #13, where a migration
  sat unrun against production for weeks).
- Supabase's own backup behavior depends entirely on the project's paid
  tier, which nothing in this repo records:
  - **Free tier**: no automated backups, no point-in-time recovery (PITR).
  - **Pro tier and above**: daily automated backups (7-day retention on
    Pro), with PITR available as an add-on on some plans.
- **Eben must do**:
  1. Check Supabase dashboard → Project Settings → Add-ons (or
     Database → Backups) to see the current plan and what's actually
     enabled.
  2. If on the free tier with real user data (it now has real accounts,
     tests, findings, payouts — see `docs/agent/STATUS.md`), decide
     whether that's an acceptable risk for this stage, or worth upgrading.
  3. If backups are enabled, actually try a restore once in a
     non-production project to confirm the process works before you need
     it for real — an untested backup is not a verified backup.
  4. Whatever the answer is, write it down (even just an update to this
     file) so the plan/tier isn't tribal knowledge.

## 3. Monitoring

**Current state: none.** Verified, not inferred — checked `package.json`
for Sentry/LogRocket/Datadog/PostHog/Vercel Analytics/etc. (none present),
grepped `src/` for any monitoring SDK usage (none), and checked
`.github/workflows/*.yml` (CI runs lint/build/test only, nothing
monitoring-related). F-08 also removed a fabricated "99.97% uptime" stat
from the admin dashboard that had no real monitoring behind it — that
number was never measuring anything.

This means: **if the site goes down, or an error spikes for real users,
nobody finds out unless a person reports it.**

### What's realistic to add, roughly cheapest-first

None of these are implemented here — they're a menu, not a decision I can
make for the team (several involve signing up for a service):

1. **Vercel's own dashboard** (already available, zero setup): deployment
   status, build logs, and function/edge logs are already visible in the
   Vercel project dashboard today. This is the fastest thing to actually
   *use* even though it requires no code change — worth a habit of
   checking it after each deploy.
2. **Vercel Web Analytics / Speed Insights**: a checkbox in the Vercel
   dashboard (no code change, free tier available) for basic traffic and
   performance visibility.
3. **Supabase dashboard**: Database → Logs and the Reports tab already
   show query errors and performance — also zero-setup, just needs someone
   to look at it periodically.
4. **An uptime checker** (e.g. a free tier of UptimeRobot, Better Uptime,
   or similar): pings the production URL every few minutes and alerts
   (email/Slack) on downtime. This is the single highest-value addition
   for "would we know if the site is down" and needs no code change,
   just an account and the production URL.
5. **Error tracking** (e.g. Sentry): would need a real SDK integration
   (an `npm install` + a few lines of init code) and a paid-or-free-tier
   account. Genuinely useful, but not "trivial" — a real follow-up task,
   not done in this docs-only pass.

**Eben must do**: at minimum, set up #4 (an uptime checker) — it's free,
takes a few minutes, and directly closes the "would we know if it's down"
gap. The rest is worth prioritizing against everything else on the
backlog rather than doing reflexively.

## 4. Deployment — how release actually happens

Documented here because it's adjacent to secrets/monitoring and was a
source of confusion while writing this doc.

- **`.github/workflows/deploy.yml` does not actually deploy anything.** It
  runs `npm ci` + `npm run build` (a build-only smoke test) and then, for
  pushes to `main`, echoes status messages and creates a GitHub deployment
  marker — it never invokes the Vercel CLI or a Vercel deploy action.
- **The real deployment mechanism is Vercel's native GitHub integration**
  (configured in the Vercel dashboard, not in this repo) — Vercel watches
  the repo directly and deploys on push, independent of GitHub Actions.
  This is consistent with `DEPLOYMENT_GUIDE.md`/`QUICK_DEPLOY.md`, which
  both describe connecting the repo via the Vercel dashboard.
- **Staging**: `develop` is treated as a staging branch only by convention
  (in `deploy.yml`'s branch conditionals) — there's no separate documented
  Vercel environment, no distinct env var set for it, and no confirmation
  that a `develop` branch is actually kept up to date. Vercel's automatic
  PR preview deployments (one per PR, visible as a check — you've seen
  these on recent PRs) are the actual staging-like environment in
  practice, not `develop`.
- **`.github/workflows/ci.yml`** is the real gate: four jobs — Lint & Code
  Quality (`npm run lint`, zero warnings), Build Application, Run Tests,
  and Database Migrations & Access Rules (`scripts/test-db.sh`: applies
  `schema.sql` + every migration twice to Postgres 15 and runs
  `supabase/tests/*.sql` as real tester/company/admin/anon users). Run the
  database check locally with `npm run test:db` against an empty Postgres.

### 4.1 Merging PRs without bypassing branch protection

PRs opened by Claude are authored by the `nyvelhq` account, which is also
the account that reviews and merges. GitHub never lets a PR's author approve
it, so a "require 1 approval" rule can never be met and forces "bypass rules
and merge". Recommended `main` settings (GitHub → Settings → Branches →
`main` rule, or Rules → Rulesets):

- **Require a pull request before merging:** on, **Required approvals: 0**.
  The merge click is the approval, after ticking the PR template's sign-off
  checklist.
- **Require status checks to pass:** on, with all four CI jobs required —
  `Lint & Code Quality`, `Build Application`, `Run Tests`,
  `Database Migrations & Access Rules`. Keep "Require branches to be up to
  date" on.
- **Do not allow bypassing the above settings** (classic: "Include
  administrators"): on, so nobody — including the owner — can merge red CI.
- If a real second approver is wanted later: add a second person as a
  collaborator and set approvals back to 1, or connect Claude through a
  separate GitHub account so its PRs have a different author.

Database changes still need Eben to run the migration in the Supabase SQL
editor before merging; CI proves the SQL works on a clean Postgres, not that
it has been applied to production.

## 5. Related reading

- `docs/agent/RULES.md` — the hard rule that `supabaseClient` must never
  throw at import time exists because of a past outage tied to missing
  env vars; this runbook's secrets section is the operational
  companion to that rule.
- `docs/qa/DEFINITION_OF_DONE.md` — references this runbook's checks for
  any future change that touches secrets, deploy config, or monitoring.
- `DEPLOYMENT_GUIDE.md` / `QUICK_DEPLOY.md` — the how-to-deploy walkthrough
  this runbook doesn't duplicate; read those for step-by-step setup, this
  file for what's actually true about the current environment.
