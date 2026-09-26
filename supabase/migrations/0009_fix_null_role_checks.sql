-- 0009 — Callers without a profile (anon, or a user whose profile row is
-- missing) could run set_test_status.
--
-- is_admin() returned NULL rather than false for them, and set_test_status
-- guarded with `if not (is_admin() or ...)`: NULL propagated, the IF was
-- skipped, and the status update ran. Supabase also grants EXECUTE on new
-- functions to anon by default, so `revoke ... from public` in 0007 didn't
-- stop anonymous callers. Caught by the access-rule tests in CI.
--
-- Safe to re-run.

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

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

  if not coalesce(
    public.is_admin()
    or (public.current_user_role() = 'company' and owner_client = public.current_user_client_id()),
    false
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

revoke execute on function public.set_test_status(uuid, text) from anon;
revoke execute on function public.respond_to_finding(uuid, text) from anon;

notify pgrst, 'reload schema';
