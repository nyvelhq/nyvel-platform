-- 0008 — SEC-01: users can't grant themselves a role or a company.
--
-- Two holes in public.profiles:
--
-- 1. LIVE: "profiles: self can update own name only" pins `role` but not
--    `client_id`. Testers can read any open test's client_id, so a tester
--    could set a company's client_id on their own profile and pass every
--    policy that checks `client_id = current_user_client_id()`: read that
--    company's tests (drafts included), briefings and findings, decide
--    applications and triage findings (including their own).
-- 2. Latent (STRIDE T3): "profiles: admin can insert" lets a signed-in user
--    insert their own profile row with any role/client_id if it's missing.
--
-- Fix: self-insert is pinned to role 'tester' with no client_id, and a
-- trigger rejects any API update to role, client_id, email or id unless the
-- caller is an admin. Calls without a user JWT (the auth signup trigger, the
-- SQL editor, the service role) are unaffected, so seeding and role
-- assignment from the dashboard keep working.
--
-- Safe to re-run.

drop policy if exists "profiles: admin can insert" on public.profiles;
create policy "profiles: admin can insert" on public.profiles
  for insert with check (
    public.is_admin()
    or (id = auth.uid() and role = 'tester' and client_id is null)
  );

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role
     or new.client_id is distinct from old.client_id
     or new.email is distinct from old.email
     or new.id is distinct from old.id then
    raise exception 'Only an admin can change a profile''s role, company or email.'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_privileges on public.profiles;
create trigger profiles_protect_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

notify pgrst, 'reload schema';
