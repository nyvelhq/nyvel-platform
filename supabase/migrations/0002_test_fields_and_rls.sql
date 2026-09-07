-- ============================================================================
-- Nyvel — Phase 1: fields CreateTest.jsx collects but schema.sql never
-- stored, plus RLS policies the real UI needs that schema.sql was missing.
-- Run this once in the Supabase SQL editor, after schema.sql. Safe to
-- re-run — every change is idempotent (IF NOT EXISTS / DROP+CREATE POLICY).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. New columns on tests — CreateTest.jsx's wizard collects these but the
--    original tests table only had title/description/test_type/
--    target_tester_count/status. "duration" is intentionally NOT added:
--    the form never collects it (TesterDashboard displays it optionally).
-- ----------------------------------------------------------------------------
alter table public.tests
  add column if not exists compensation numeric(10,2) not null default 0,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists platforms text[] not null default '{}',
  add column if not exists expertise text[] not null default '{}',
  add column if not exists age_range text,
  add column if not exists countries text,
  add column if not exists nda boolean not null default true,
  add column if not exists briefing text;

-- ----------------------------------------------------------------------------
-- 2. RLS gaps — schema.sql gave "company" role SELECT-only on tests, and
--    nothing at all on applications/clients beyond their own client row.
--    That's fine for read-only dashboards, but three real flows in this
--    phase break without more:
--
--    a) A company user launching a test (CreateTest.jsx -> insert into
--       tests) has NO insert policy at all today — only admin can insert.
--    b) A company user's "testers accepted" count on their own tests
--       requires reading applications rows for those tests — no policy
--       lets company read ANY applications row, even for their own test.
--    c) A tester browsing open tests needs the company display name,
--       which lives in clients — but "clients: company can read own
--       client" only lets a company read *their own* row, and testers
--       have no clients policy at all.
-- ----------------------------------------------------------------------------

-- a) company can create tests for their own client_id
drop policy if exists "tests: company can insert own client's tests" on public.tests;
create policy "tests: company can insert own client's tests" on public.tests
  for insert with check (
    client_id = public.current_user_client_id()
    and public.current_user_role() = 'company'
  );

-- b) company can read applications for tests that belong to their client
drop policy if exists "applications: company can read applications for own tests" on public.applications;
create policy "applications: company can read applications for own tests" on public.applications
  for select using (
    exists (
      select 1 from public.tests t
      where t.id = applications.test_id
        and t.client_id = public.current_user_client_id()
    )
  );

-- c) any signed-in tester can read company display names (not sensitive —
--    just company_name, same column companies already see about themselves)
drop policy if exists "clients: tester can read company names" on public.clients;
create policy "clients: tester can read company names" on public.clients
  for select using (public.current_user_role() = 'tester');
