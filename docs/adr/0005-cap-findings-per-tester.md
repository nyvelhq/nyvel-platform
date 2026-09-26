# ADR 0005: Cap untriaged findings per tester per test (SEC-04)

- Status: Accepted
- Date: 2026-09-26

## Context

`docs/security/STRIDE_THREAT_MODEL.md` (F-07) flagged D3: nothing stopped an
accepted tester from submitting an unlimited number of findings on one test.
A tester (malicious or just careless with a script) could flood a company's
triage queue, burying genuine findings under noise and making triage
unworkable. This is a denial-of-service against the company's workflow, not
the database.

## Decision

- Migration `0014_cap_findings_per_tester.sql` adds a `before insert` trigger
  on `public.findings` that counts the tester's own findings on that test
  with `status in ('open', 'more_info')` — the ones still sitting in the
  triage queue — and rejects the insert once that count reaches 20.
- The cap is on **untriaged** findings, not lifetime findings per test.
  Accepted and rejected findings don't count, and once the company works the
  queue down (or the tester replies to a "more info" request and it's
  re-triaged), the tester can submit again. A prolific but legitimate tester
  is never permanently blocked — only ever throttled to a sane queue depth.
- 20 matches the list-size cap already used for tester profile fields
  (migration `0013`), kept as the project's one "reasonable list size"
  constant rather than inventing a new number.
- Admins and the SQL editor are unaffected — the trigger fires for every
  insert regardless of role, but only actual tester submissions can reach
  it in practice (RLS's `findings: accepted tester can submit` policy is the
  only insert path available to a non-admin).

## Consequences

- A tester who is legitimately finding 20+ real bugs the company hasn't
  triaged yet will see a clear error asking them to wait. This is the
  intended trade-off: it's a queue-depth limit, and the fix is for the
  company to triage, not for the tester to work around it.
- The cap is a single constant (`max_untriaged` in the trigger function), not
  a per-test or per-company setting. If a real user ever needs a different
  number, that's a follow-up, not a sign this migration is wrong.
