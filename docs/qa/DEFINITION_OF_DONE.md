# Definition of Done

A change to nyvel-platform is done when every applicable box below is
checked — not when it "looks right" or "the happy path works." This is the
exit criteria referenced by `TEST_PLAN.md` and by `docs/agent/RULES.md`'s
QA pass.

## Every change

- [ ] `npm ci && npm test -- --watchAll=false && npm run build` all pass
      locally. A red or skipped test is not done; fix it or explain why in
      the PR, never silence it.
- [ ] The diff is the smallest change that satisfies the acceptance
      criteria — no drive-by refactors, no speculative abstractions.
- [ ] No secrets, tokens, or real credentials in the diff (check `.env`
      files and anything that looks like a key before committing).

## If it fixes a bug

- [ ] There's a test that fails against the old code and passes against
      the fix. Prove it: temporarily reintroduce the bug, watch the new
      test fail, then revert — don't just assume the test would have
      caught it.
- [ ] The root cause is documented (in the PR description or a code
      comment), not just the symptom. "It works now" without knowing why
      it was broken means it can silently break the same way again.

## If it changes `DataContext.jsx` or any Supabase call

- [ ] Every column name in an `.insert()`/`.update()`/`.upsert()` payload
      is checked against `supabase/schema.sql` + the migrations that touch
      that table. This exact mismatch (a column the code writes that the
      live table doesn't have) has caused a production incident before.
- [ ] Embeds off `applications` or `findings` use explicit FK hints
      (`profiles!tester_id(...)`) — both tables have two FKs into
      `profiles`, and an unhinted embed is ambiguous.
- [ ] `src/lib/supabaseClient.js` still never throws at import time (don't
      remove the `|| 'placeholder-...'` fallback or add a new
      `throw`/`createClient` call that isn't guarded the same way). This
      caused an earlier full-app outage.

## If it changes schema, RLS, or adds an integration

- [ ] A short ADR exists in `docs/adr/` explaining the decision (per
      `docs/agent/RULES.md`'s Architect pass).
- [ ] New SQL lives in a new, idempotent
      `supabase/migrations/NNNN_*.sql` file (`if not exists`, `drop policy
      if exists` + `create policy`, etc. — see any existing migration for
      the pattern). It is never run against production directly; it's
      listed under "Eben must do" in the PR.
- [ ] Every new/changed RLS policy is read and reasoned through by a human
      (what role can do what, on which rows) — a passing test suite does
      not verify RLS, since tests mock the Supabase client rather than
      running against real Postgres with RLS enabled. If the reasoning
      can't be fully verified from the diff alone, say so explicitly in
      the PR instead of asserting it's safe.

## If it changes UI

- [ ] Run a WCAG 2.1 AA pass (contrast, focus order, labels/roles) per
      `docs/agent/RULES.md`'s UX pass.
- [ ] Loading and empty states are handled — a page must not crash or show
      a blank screen when a table has zero rows (see `AdminDashboard.jsx`'s
      "No activity yet." / "No companies with recorded payouts yet." for
      the pattern).

## If it changes marketing or product-facing copy

- [ ] No fabricated claims, statistics, logos, or capabilities. If a
      number is shown, it must come from a real query or be clearly
      illustrative (see `Testimonials.jsx`'s "Illustrative examples..."
      disclaimer for the pattern).
- [ ] If the copy makes a claim with real compliance weight (financial
      transactions, data handling, certifications), it's checked against
      what the product actually does — not what would sound best.
- [ ] Consider a copy-regression test (`marketingCopyClaims.test.js` is the
      existing example) if the claim being fixed is the kind that could
      quietly resurface in a different file.

## Before opening the PR

- [ ] `docs/agent/STATUS.md` is updated in the same PR: the queue item
      marked with its status and a link back to this PR once it exists.
- [ ] The PR description includes: acceptance criteria, what changed, test
      evidence (the actual commands run and their output, not just "tests
      pass"), and an "Eben must do" list (migrations, env vars, what to
      verify live).
- [ ] Anything inferred rather than verified is labeled as such — never
      reported as confirmed working when it wasn't actually checked.
