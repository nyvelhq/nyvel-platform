-- 0010 — SEC-02: paid payouts are immutable, and every payout change is
-- recorded (STRIDE T4 / R2).
--
-- `payouts` was "append-only once paid" by convention only: the admin RLS
-- policy allows any UPDATE/DELETE, so a paid row's amount, recipient or
-- paid_at could be changed with no trace.
--
-- - Through the API (any caller with a user JWT, admins included) a paid
--   payout can't be updated or deleted. Corrections are still possible from
--   the Supabase SQL editor / service role (no user JWT), and are logged.
-- - paid_at / paid_by are stamped by the server when a payout becomes paid,
--   so they can't be backdated or attributed to someone else.
-- - payout_history keeps a row for every insert/update/delete, with the
--   before/after values and who made the change. It has no foreign keys, so
--   it survives the test or tester being deleted. Admins can read it; nobody
--   can write it except the trigger.
--
-- Safe to re-run.

create table if not exists public.payout_history (
  id bigint generated always as identity primary key,
  payout_id uuid not null,
  action text not null check (action in ('insert', 'update', 'delete')),
  old_row jsonb,
  new_row jsonb,
  changed_by uuid,
  changed_at timestamptz not null default now()
);

create index if not exists idx_payout_history_payout_id on public.payout_history(payout_id);

alter table public.payout_history enable row level security;
revoke all on public.payout_history from anon, authenticated;
grant select on public.payout_history to authenticated;

drop policy if exists "payout_history: admin can read" on public.payout_history;
create policy "payout_history: admin can read" on public.payout_history
  for select using (public.is_admin());

-- BEFORE: lock paid rows for API callers and stamp paid_at/paid_by.
create or replace function public.guard_payout_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') and old.status = 'paid' and auth.uid() is not null then
    raise exception 'This payout is already marked paid and can''t be changed from the app.'
      using errcode = 'check_violation';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  if new.status = 'paid' and (tg_op = 'INSERT' or old.status is distinct from 'paid') then
    new.paid_at := now();
    new.paid_by := coalesce(auth.uid(), new.paid_by);
  elsif new.status = 'pending' then
    new.paid_at := null;
    new.paid_by := null;
  end if;

  return new;
end;
$$;

drop trigger if exists payouts_guard_change on public.payouts;
create trigger payouts_guard_change
  before insert or update or delete on public.payouts
  for each row execute function public.guard_payout_change();

-- AFTER: append to history.
create or replace function public.record_payout_history()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.payout_history (payout_id, action, old_row, new_row, changed_by)
  values (
    coalesce(new.id, old.id),
    lower(tg_op),
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end,
    auth.uid()
  );
  return null;
end;
$$;

drop trigger if exists payouts_record_history on public.payouts;
create trigger payouts_record_history
  after insert or update or delete on public.payouts
  for each row execute function public.record_payout_history();

notify pgrst, 'reload schema';
