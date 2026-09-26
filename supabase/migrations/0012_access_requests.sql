-- 0012 — UX-03: "Request access" (companies) and "Apply to test" (testers).
--
-- Every sign-up CTA on the public site used to land on a login page that
-- can't create an account. Visitors can now leave a request; admins review
-- it. No email is sent (C-07 is blocked on an email provider) and approving
-- does not create an account — an admin invites the person from Supabase.
--
-- Visitors (anon or signed in) may only INSERT a new request; nobody but an
-- admin can read or change them. Inputs are length/format-checked, and a
-- global throttle caps new requests so an anonymous script can't flood the
-- table.
--
-- Safe to re-run.

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('company', 'tester')),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company_name text check (company_name is null or char_length(company_name) <= 160),
  website text check (website is null or char_length(website) <= 300),
  country text check (country is null or char_length(country) <= 80),
  devices text check (devices is null or char_length(devices) <= 500),
  message text check (message is null or char_length(message) <= 2000),
  status text not null default 'new' check (status in ('new', 'contacted', 'approved', 'declined')),
  admin_note text check (admin_note is null or char_length(admin_note) <= 2000),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint company_request_needs_company check (kind <> 'company' or char_length(btrim(coalesce(company_name, ''))) > 0)
);

create index if not exists idx_access_requests_created_at on public.access_requests(created_at desc);

alter table public.access_requests enable row level security;
revoke all on public.access_requests from anon, authenticated;
grant insert on public.access_requests to anon, authenticated;
grant select, update on public.access_requests to authenticated;

drop policy if exists "access_requests: anyone can submit" on public.access_requests;
create policy "access_requests: anyone can submit" on public.access_requests
  for insert with check (
    status = 'new' and admin_note is null and reviewed_by is null and reviewed_at is null
  );

drop policy if exists "access_requests: admin can read" on public.access_requests;
create policy "access_requests: admin can read" on public.access_requests
  for select using (public.is_admin());

drop policy if exists "access_requests: admin can review" on public.access_requests;
create policy "access_requests: admin can review" on public.access_requests
  for update using (public.is_admin()) with check (public.is_admin());

create or replace function public.guard_access_request()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    -- Global throttle: an anonymous script can't bury real requests.
    if (select count(*) from public.access_requests where created_at > now() - interval '10 minutes') >= 50 then
      raise exception 'We''re receiving a lot of requests right now. Please try again in a few minutes.'
        using errcode = 'check_violation';
    end if;
    new.email := lower(btrim(new.email));
    new.name := btrim(new.name);
    new.created_at := now();
    return new;
  end if;

  -- UPDATE (admin review): only the review fields change; stamp reviewer.
  if auth.uid() is not null then
    if new.kind is distinct from old.kind or new.name is distinct from old.name
       or new.email is distinct from old.email or new.company_name is distinct from old.company_name
       or new.website is distinct from old.website or new.country is distinct from old.country
       or new.devices is distinct from old.devices or new.message is distinct from old.message
       or new.created_at is distinct from old.created_at then
      raise exception 'Only the status and note of a request can be changed.' using errcode = 'check_violation';
    end if;
    new.reviewed_by := auth.uid();
    new.reviewed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists access_requests_guard on public.access_requests;
create trigger access_requests_guard
  before insert or update on public.access_requests
  for each row execute function public.guard_access_request();

notify pgrst, 'reload schema';
