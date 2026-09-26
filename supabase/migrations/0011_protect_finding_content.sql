-- 0011 — SEC-03: companies triage findings; they can't rewrite them.
--
-- "findings: company can triage own tests' findings" (0004) allows UPDATE of
-- any column, so a company could change what a tester reported (title,
-- description, severity), reassign it to another tester or test, or backdate
-- it — and forge reviewed_by/reviewed_at. The tester's own record matters in
-- any dispute, and accepted findings drive payouts.
--
-- A company may now change only the triage fields, and only to a triage
-- decision (accepted / rejected / more_info). reviewed_by and reviewed_at are
-- stamped by the server whenever a company changes the status. Admins and
-- the SQL editor (no user JWT) can still correct anything. The tester's reply
-- (0007) stays protected by findings_protect_tester_response.
--
-- Safe to re-run.

create or replace function public.protect_finding_content()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() or public.current_user_role() is distinct from 'company' then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.test_id is distinct from old.test_id
     or new.tester_id is distinct from old.tester_id
     or new.title is distinct from old.title
     or new.description is distinct from old.description
     or new.severity is distinct from old.severity
     or new.submitted_at is distinct from old.submitted_at then
    raise exception 'Companies can review findings but not change what the tester reported.'
      using errcode = 'insufficient_privilege';
  end if;

  if new.status is distinct from old.status then
    if new.status not in ('accepted', 'rejected', 'more_info') then
      raise exception 'A finding can only be accepted, rejected or sent back for more info.'
        using errcode = 'check_violation';
    end if;
    new.reviewed_by := auth.uid();
    new.reviewed_at := now();
  else
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
  end if;

  return new;
end;
$$;

drop trigger if exists findings_protect_content on public.findings;
create trigger findings_protect_content
  before update on public.findings
  for each row execute function public.protect_finding_content();

notify pgrst, 'reload schema';
