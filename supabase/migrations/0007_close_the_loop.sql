-- 0007 — UX-02 "close the loop": protected test briefings, test completion,
-- and tester replies to "More info needed" findings.
--
-- Safe to re-run. Requires 0006 (applications.nda_accepted_at).

-- ============================================================================
-- 1. Test briefings — readable only by the owning company, admins, and
--    testers with an ACCEPTED application (plus an accepted NDA when the test
--    is NDA-required).
--
-- Until now the briefing was a column on public.tests, and "tests: testers can
-- read open tests" let every signed-in tester read it through the API. It now
-- lives in its own table with its own RLS. A trigger moves anything written to
-- tests.briefing into test_briefings and clears the column, so the existing
-- Create Test insert keeps working unchanged and old clients can't re-leak it.
-- ============================================================================

create table if not exists public.test_briefings (
  test_id uuid primary key references public.tests(id) on delete cascade,
  briefing text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.test_briefings enable row level security;

-- Explicit rather than relying on Supabase's default privileges; RLS still
-- decides which rows each signed-in user sees. Writes go through the trigger.
revoke all on public.test_briefings from anon, authenticated;
grant select on public.test_briefings to authenticated;

drop policy if exists "test_briefings: admin full access" on public.test_briefings;
create policy "test_briefings: admin full access" on public.test_briefings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "test_briefings: company can read own" on public.test_briefings;
create policy "test_briefings: company can read own" on public.test_briefings
  for select using (
    exists (
      select 1 from public.tests t
      where t.id = test_briefings.test_id and t.client_id = public.current_user_client_id()
    )
  );

drop policy if exists "test_briefings: accepted tester can read" on public.test_briefings;
create policy "test_briefings: accepted tester can read" on public.test_briefings
  for select using (
    exists (
      select 1
      from public.applications a
      join public.tests t on t.id = a.test_id
      where a.test_id = test_briefings.test_id
        and a.tester_id = auth.uid()
        and a.status = 'accepted'
        and (t.nda is not true or a.nda_accepted_at is not null)
    )
  );

create or replace function public.move_test_briefing()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.test_briefings (test_id, briefing, updated_at)
  values (new.id, new.briefing, now())
  on conflict (test_id) do update set briefing = excluded.briefing, updated_at = now();
  update public.tests set briefing = null where id = new.id;
  return null;
end;
$$;

drop trigger if exists tests_move_briefing on public.tests;
create trigger tests_move_briefing
  after insert or update of briefing on public.tests
  for each row when (new.briefing is not null)
  execute function public.move_test_briefing();

insert into public.test_briefings (test_id, briefing)
  select id, briefing from public.tests where briefing is not null
  on conflict (test_id) do nothing;
update public.tests set briefing = null where briefing is not null;

-- ============================================================================
-- 2. Test completion — the owning company (or an admin) moves a test between
--    open/in_review and complete. An RPC rather than a broad UPDATE policy so
--    companies can't also rewrite compensation or other fields after testers
--    have done the work.
-- ============================================================================

create or replace function public.set_test_status(p_test_id uuid, p_status text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  cur_status text;
  owner_client uuid;
begin
  select status, client_id into cur_status, owner_client from public.tests where id = p_test_id;
  if not found then
    raise exception 'Test not found.' using errcode = 'no_data_found';
  end if;

  if not (
    public.is_admin()
    or (public.current_user_role() = 'company' and owner_client = public.current_user_client_id())
  ) then
    raise exception 'You can only change the status of your own tests.' using errcode = 'insufficient_privilege';
  end if;

  if not (
    (p_status = 'complete' and cur_status in ('open', 'in_review'))
    or (p_status = 'open' and cur_status = 'complete')
  ) then
    raise exception 'A % test cannot be changed to %.', cur_status, p_status using errcode = 'check_violation';
  end if;

  update public.tests set status = p_status where id = p_test_id;
end;
$$;

revoke execute on function public.set_test_status(uuid, text) from public;
grant execute on function public.set_test_status(uuid, text) to authenticated;

-- No new findings once a test is complete (triage of existing ones continues).
create or replace function public.block_findings_on_complete_test()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if exists (select 1 from public.tests where id = new.test_id and status = 'complete') then
    raise exception 'This test is complete and no longer accepts findings.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists findings_block_on_complete_test on public.findings;
create trigger findings_block_on_complete_test
  before insert on public.findings
  for each row execute function public.block_findings_on_complete_test();

-- ============================================================================
-- 3. Tester replies to "More info needed". Testers still have no UPDATE
--    policy on findings; the only way to write a reply is this RPC, which
--    checks ownership and status and sends the finding back to 'open' for
--    the company to re-triage. Companies can't edit the reply.
-- ============================================================================

alter table public.findings
  add column if not exists tester_response text,
  add column if not exists responded_at timestamptz;

alter table public.findings drop constraint if exists findings_tester_response_length;
alter table public.findings
  add constraint findings_tester_response_length
  check (tester_response is null or char_length(tester_response) <= 5000);

create or replace function public.respond_to_finding(p_finding_id uuid, p_response text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  reply text := btrim(coalesce(p_response, ''));
begin
  if reply = '' then
    raise exception 'Reply cannot be empty.' using errcode = 'check_violation';
  end if;
  if char_length(reply) > 5000 then
    raise exception 'Reply must be 5000 characters or fewer.' using errcode = 'check_violation';
  end if;

  update public.findings
    set tester_response = reply, responded_at = now(), status = 'open'
    where id = p_finding_id and tester_id = auth.uid() and status = 'more_info';

  if not found then
    raise exception 'Only your own findings marked "More info needed" can be replied to.'
      using errcode = 'check_violation';
  end if;
end;
$$;

revoke execute on function public.respond_to_finding(uuid, text) from public;
grant execute on function public.respond_to_finding(uuid, text) to authenticated;

create or replace function public.protect_tester_response()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if public.current_user_role() = 'company' then
    new.tester_response := old.tester_response;
    new.responded_at := old.responded_at;
  end if;
  return new;
end;
$$;

drop trigger if exists findings_protect_tester_response on public.findings;
create trigger findings_protect_tester_response
  before update on public.findings
  for each row execute function public.protect_tester_response();

notify pgrst, 'reload schema';
