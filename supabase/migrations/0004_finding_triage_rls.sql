-- ============================================================================
-- Nyvel — Phase 2 slice: C-04/C-05, tester submits findings + company
-- triages them (accept/reject/more-info). Run once in the Supabase SQL
-- editor, after 0003_application_review_rls.sql. Safe to re-run —
-- DROP+CREATE POLICY.
--
-- C-04 (tester submit) needs NO new policy — schema.sql's original
-- "findings: accepted tester can submit" and "findings: tester can read
-- own" already cover it. This migration is only for C-05 (company triage),
-- which was scoped in the BA spec (US-06) as a COMPANY action, not admin —
-- same gap shape as 0002/0003: the original schema.sql only gave company a
-- narrow read of ACCEPTED findings (the client results-portal model, C-09),
-- nothing to see pending ones or decide on them.
-- ============================================================================

-- a) company can see ALL findings (any status) for their own tests, not just
--    accepted ones — needed to triage 'open' findings in the first place.
--    Coexists with the existing accepted-only policy (RLS SELECT policies
--    OR together), which stays as-is/documented for the C-09 read model.
drop policy if exists "findings: company can read all findings for own tests" on public.findings;
create policy "findings: company can read all findings for own tests" on public.findings
  for select using (
    exists (
      select 1 from public.tests t
      where t.id = findings.test_id and t.client_id = public.current_user_client_id()
    )
  );

-- b) company can triage (accept/reject/more_info) a finding on their own
--    test. review_reason-required-on-reject-or-more_info is already
--    enforced by the table's own CHECK constraint, so RLS only needs to
--    gate ownership.
drop policy if exists "findings: company can triage own tests' findings" on public.findings;
create policy "findings: company can triage own tests' findings" on public.findings
  for update using (
    exists (
      select 1 from public.tests t
      where t.id = findings.test_id and t.client_id = public.current_user_client_id()
    )
  )
  with check (
    exists (
      select 1 from public.tests t
      where t.id = findings.test_id and t.client_id = public.current_user_client_id()
    )
  );
