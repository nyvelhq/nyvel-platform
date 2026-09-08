-- ============================================================================
-- Nyvel — Phase 2 slice: C-03, company-side application review (accept/
-- decline testers who applied). Run once in the Supabase SQL editor, after
-- 0002_test_fields_and_rls.sql. Safe to re-run — DROP+CREATE POLICY.
--
-- Same shape of gap as 0002: schema.sql gave company read-only access to
-- applications for their own tests, but nothing lets them actually decide
-- (UPDATE), and nothing lets them see WHO applied (profiles is locked to
-- self-or-admin only). Both are required for this feature to work at all.
-- ============================================================================

-- a) company can accept/decline applications on their own tests
drop policy if exists "applications: company can decide on own tests" on public.applications;
create policy "applications: company can decide on own tests" on public.applications
  for update using (
    exists (
      select 1 from public.tests t
      where t.id = applications.test_id
        and t.client_id = public.current_user_client_id()
    )
  )
  with check (
    exists (
      select 1 from public.tests t
      where t.id = applications.test_id
        and t.client_id = public.current_user_client_id()
    )
  );

-- b) company can read the name/email of testers who applied to their tests
--    (needed to show who's applying — profiles was previously self-or-admin only)
drop policy if exists "profiles: company can read applicant profiles" on public.profiles;
create policy "profiles: company can read applicant profiles" on public.profiles
  for select using (
    exists (
      select 1
      from public.applications a
      join public.tests t on t.id = a.test_id
      where a.tester_id = profiles.id
        and t.client_id = public.current_user_client_id()
    )
  );
