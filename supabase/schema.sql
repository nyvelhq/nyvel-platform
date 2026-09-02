-- ============================================================================
-- Nyvel — Core data model (Phase 0 foundation, F-03/F-02)
-- Run this once in the Supabase SQL editor for a fresh project.
-- Matches the ERD in Nyvel_BA_DevReady_Spec.docx.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles — extends auth.users with the app's role + client link.
--    auth.users already gives us id/email/password; we never duplicate
--    those here. role is enforced server-side (F-02) via RLS below, not
--    chosen by the client at sign-in.
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'company', 'tester');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  role public.user_role not null default 'tester',
  -- set by admin when inviting a client contact (US-01); null for admin/tester
  -- (FK added below, after the clients table exists)
  client_id uuid,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. clients — the company account created by an admin invite (C-08),
--    replacing public self-serve signup.
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  primary_contact_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

-- profiles.client_id references clients, which is declared after profiles —
-- add the FK now that both tables exist.
alter table public.profiles
  add constraint profiles_client_id_fkey
  foreign key (client_id) references public.clients(id) on delete set null;

-- ---------------------------------------------------------------------------
-- 3. tests — an engagement (loop step 1 / C-01)
-- ---------------------------------------------------------------------------
create table public.tests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  description text not null default '',
  test_type text not null default 'General QA',
  target_tester_count int not null default 5 check (target_tester_count > 0),
  status text not null default 'draft' check (status in ('draft', 'open', 'in_review', 'complete')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. applications — tester applies, admin accepts/declines (loop 2/3, C-02/C-03)
-- ---------------------------------------------------------------------------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  tester_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  applied_at timestamptz not null default now(),
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  unique (test_id, tester_id) -- a tester can only apply once per test
);

-- ---------------------------------------------------------------------------
-- 5. findings — tester submits, admin/QA triages (loop 5/6, C-04/C-05)
-- ---------------------------------------------------------------------------
create table public.findings (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  tester_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  status text not null default 'open' check (status in ('open', 'accepted', 'rejected', 'more_info')),
  review_reason text,
  reviewed_by uuid references public.profiles(id),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint review_reason_required_on_reject_or_more_info check (
    status not in ('rejected', 'more_info') or review_reason is not null
  )
);

-- ---------------------------------------------------------------------------
-- 6. payouts — one row per tester per test, aggregated from accepted findings
--    (loop 7, C-06). Append-only once paid — see the no-edit-after-paid
--    policy below.
-- ---------------------------------------------------------------------------
create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  tester_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid')),
  paid_by uuid references public.profiles(id),
  paid_at timestamptz,
  unique (test_id, tester_id)
);

-- ---------------------------------------------------------------------------
-- 7. notifications — audit log of what was sent (C-07), not a delivery queue.
--    Actual sending happens in an Edge Function; this table just records it.
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in (
    'applied', 'accepted', 'declined', 'finding_reviewed', 'payout_paid', 'password_reset'
  )),
  related_entity_id uuid,
  sent_at timestamptz not null default now(),
  status text not null default 'sent' check (status in ('sent', 'failed'))
);

-- ============================================================================
-- Indexes
-- ============================================================================
create index idx_profiles_client_id on public.profiles(client_id);
create index idx_tests_client_id on public.tests(client_id);
create index idx_applications_test_id on public.applications(test_id);
create index idx_applications_tester_id on public.applications(tester_id);
create index idx_findings_test_id on public.findings(test_id);
create index idx_findings_tester_id on public.findings(tester_id);
create index idx_payouts_test_id on public.payouts(test_id);
create index idx_notifications_user_id on public.notifications(user_id);

-- ============================================================================
-- Auto-create a profile row when a new auth user is created.
-- Role defaults to 'tester' — an admin promotes/reassigns role and
-- client_id explicitly; nothing about role is ever client-chosen (F-02).
-- ============================================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- Row-Level Security (F-02 — role enforced server-side, not by the client)
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.tests enable row level security;
alter table public.applications enable row level security;
alter table public.findings enable row level security;
alter table public.payouts enable row level security;
alter table public.notifications enable row level security;

-- Helper: current caller's role, read once via a SECURITY DEFINER function
-- so policies don't recursively re-query profiles under RLS.
create function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.current_user_client_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select client_id from public.profiles where id = auth.uid();
$$;

create function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.current_user_role() = 'admin';
$$;

-- --- profiles ---
create policy "profiles: self or admin can read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles: self can update own name only" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_user_role());

create policy "profiles: admin can update any" on public.profiles
  for update using (public.is_admin());

create policy "profiles: admin can insert" on public.profiles
  for insert with check (public.is_admin() or id = auth.uid());

-- --- clients ---
create policy "clients: admin full access" on public.clients
  for all using (public.is_admin()) with check (public.is_admin());

create policy "clients: company can read own client" on public.clients
  for select using (id = public.current_user_client_id());

-- --- tests ---
create policy "tests: admin full access" on public.tests
  for all using (public.is_admin()) with check (public.is_admin());

create policy "tests: company can read own client's tests" on public.tests
  for select using (client_id = public.current_user_client_id());

create policy "tests: testers can read open tests" on public.tests
  for select using (
    public.current_user_role() = 'tester' and status in ('open', 'in_review', 'complete')
  );

-- --- applications ---
create policy "applications: admin full access" on public.applications
  for all using (public.is_admin()) with check (public.is_admin());

create policy "applications: tester can read own" on public.applications
  for select using (tester_id = auth.uid());

create policy "applications: tester can apply for self only" on public.applications
  for insert with check (
    tester_id = auth.uid() and public.current_user_role() = 'tester'
  );

-- --- findings ---
create policy "findings: admin full access" on public.findings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "findings: tester can read own" on public.findings
  for select using (tester_id = auth.uid());

-- Only a tester with an ACCEPTED application on this test may submit a
-- finding for it — this is the C-03 -> C-04 gate from the BA spec (US-05).
create policy "findings: accepted tester can submit" on public.findings
  for insert with check (
    tester_id = auth.uid()
    and exists (
      select 1 from public.applications a
      where a.test_id = findings.test_id
        and a.tester_id = auth.uid()
        and a.status = 'accepted'
    )
  );

-- Client sees only ACCEPTED findings for their own engagement — the
-- results-portal read model from US-08. Rejected / more-info findings
-- never reach the client.
create policy "findings: company can read accepted findings for own tests" on public.findings
  for select using (
    status = 'accepted'
    and exists (
      select 1 from public.tests t
      where t.id = findings.test_id and t.client_id = public.current_user_client_id()
    )
  );

-- --- payouts ---
create policy "payouts: admin full access" on public.payouts
  for all using (public.is_admin()) with check (public.is_admin());

create policy "payouts: tester can read own" on public.payouts
  for select using (tester_id = auth.uid());

-- --- notifications ---
create policy "notifications: admin full access" on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());

create policy "notifications: user can read own" on public.notifications
  for select using (user_id = auth.uid());

-- ============================================================================
-- Seed the first admin account manually after running this file:
--   1. Create the user in Supabase Auth (dashboard -> Authentication -> Add user)
--   2. Then run:  update public.profiles set role = 'admin' where email = 'you@example.com';
-- This is deliberately not automated — the first admin is a one-time,
-- out-of-band step, not a self-serve signup path (F-01/C-08).
-- ============================================================================
