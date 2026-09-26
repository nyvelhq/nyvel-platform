-- 0013 — UX-05: tester profiles saved in the database.
--
-- Onboarding answers (skills, devices, bio, ...) lived only in the browser's
-- sessionStorage, so they vanished on logout or a new device and companies
-- never saw them. This adds public.tester_profiles, one row per tester.
--
-- Who can see what:
--   - the tester reads and writes their own row; admins read and write all;
--   - companies read NO rows directly. They call applicant_profiles(test_id),
--     which returns the work-relevant fields (skills, devices, OS versions,
--     connection, experience, country, bio) for testers who applied to one
--     of their own tests. City, age range, occupation and LinkedIn stay
--     private to the tester and admins.
--
-- The display name stays on public.profiles (already self-editable).
-- Safe to re-run.

create table if not exists public.tester_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  country text,
  city text,
  age_range text,
  occupation text,
  devices text[] not null default '{}',
  os_versions text[] not null default '{}',
  connection text,
  skills text[] not null default '{}',
  years_exp text,
  bio text,
  linkedin text,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint tester_profiles_text_lengths check (
    coalesce(char_length(country), 0) <= 100
    and coalesce(char_length(city), 0) <= 100
    and coalesce(char_length(age_range), 0) <= 20
    and coalesce(char_length(occupation), 0) <= 100
    and coalesce(char_length(connection), 0) <= 50
    and coalesce(char_length(years_exp), 0) <= 20
    and coalesce(char_length(bio), 0) <= 2000
    and coalesce(char_length(linkedin), 0) <= 300
  ),
  constraint tester_profiles_list_sizes check (
    cardinality(devices) <= 20 and char_length(array_to_string(devices, '')) <= 1000
    and cardinality(os_versions) <= 20 and char_length(array_to_string(os_versions, '')) <= 1000
    and cardinality(skills) <= 20 and char_length(array_to_string(skills, '')) <= 1000
  ),
  -- Only http(s) links, so a javascript: URL can never be rendered as a link.
  constraint tester_profiles_linkedin_url check (linkedin is null or linkedin ~* '^https?://[^[:space:]]+$')
);

alter table public.tester_profiles enable row level security;

drop policy if exists "tester_profiles: self or admin can read" on public.tester_profiles;
create policy "tester_profiles: self or admin can read" on public.tester_profiles
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "tester_profiles: tester can create own" on public.tester_profiles;
create policy "tester_profiles: tester can create own" on public.tester_profiles
  for insert with check (
    public.is_admin()
    or (user_id = auth.uid() and coalesce(public.current_user_role() = 'tester', false))
  );

drop policy if exists "tester_profiles: self or admin can update" on public.tester_profiles;
create policy "tester_profiles: self or admin can update" on public.tester_profiles
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "tester_profiles: admin can delete" on public.tester_profiles;
create policy "tester_profiles: admin can delete" on public.tester_profiles
  for delete using (public.is_admin());

revoke all on public.tester_profiles from anon;
grant select, insert, update, delete on public.tester_profiles to authenticated;

-- Server-stamped times; the row's owner can't be changed.
create or replace function public.guard_tester_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.user_id is distinct from old.user_id then
    raise exception 'A tester profile can''t be moved to another user.'
      using errcode = 'insufficient_privilege';
  end if;

  new.updated_at := now();
  if new.completed_at is not null then
    -- Keep the first completion time; ignore whatever time the client sent.
    new.completed_at := case when tg_op = 'UPDATE' and old.completed_at is not null
                             then old.completed_at else now() end;
  end if;
  return new;
end;
$$;

drop trigger if exists tester_profiles_guard on public.tester_profiles;
create trigger tester_profiles_guard
  before insert or update on public.tester_profiles
  for each row execute function public.guard_tester_profile();

-- Work-relevant profile fields for the testers who applied to a test, for the
-- company that owns it (or an admin). Anyone else gets an error.
create or replace function public.applicant_profiles(p_test_id uuid)
returns table (
  tester_id uuid,
  country text,
  devices text[],
  os_versions text[],
  connection text,
  skills text[],
  years_exp text,
  bio text
)
language plpgsql
stable
security definer set search_path = public
as $$
begin
  if not coalesce(
    public.is_admin()
    or exists (
      select 1 from public.tests t
      where t.id = p_test_id and t.client_id = public.current_user_client_id()
    ),
    false
  ) then
    raise exception 'You can only see applicants for your own tests.'
      using errcode = 'insufficient_privilege';
  end if;

  return query
    select tp.user_id, tp.country, tp.devices, tp.os_versions, tp.connection,
           tp.skills, tp.years_exp, tp.bio
    from public.applications a
    join public.tester_profiles tp on tp.user_id = a.tester_id
    where a.test_id = p_test_id;
end;
$$;

revoke execute on function public.applicant_profiles(uuid) from public, anon;
grant execute on function public.applicant_profiles(uuid) to authenticated;

notify pgrst, 'reload schema';
