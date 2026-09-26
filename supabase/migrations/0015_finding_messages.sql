-- 0015 — UX-07: keep the whole conversation on a finding.
--
-- findings.review_reason and findings.tester_response hold only the latest
-- "More info" question and reply, so a second round overwrote the first.
-- This adds public.finding_messages, an append-only log the database writes
-- itself whenever a finding is:
--   - sent back for more info   → 'question' (the company's review_reason)
--   - replied to by the tester  → 'reply'    (via respond_to_finding)
--   - accepted or rejected      → 'accepted' / 'rejected' (with any reason)
--
-- Nobody writes to it directly: there are no insert/update/delete grants or
-- policies. Anyone who can read the finding (its tester, the owning company,
-- admins — via findings' own RLS) can read its messages. Existing questions
-- and replies are backfilled once.
--
-- Safe to re-run.

create table if not exists public.finding_messages (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references public.findings(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('question', 'reply', 'accepted', 'rejected')),
  body text check (body is null or char_length(body) <= 5000),
  created_at timestamptz not null default now()
);

create index if not exists idx_finding_messages_finding on public.finding_messages(finding_id, created_at);

alter table public.finding_messages enable row level security;

drop policy if exists "finding_messages: readable with the finding" on public.finding_messages;
create policy "finding_messages: readable with the finding" on public.finding_messages
  for select using (
    exists (select 1 from public.findings f where f.id = finding_messages.finding_id)
  );

revoke all on public.finding_messages from anon, authenticated;
grant select on public.finding_messages to authenticated;

create or replace function public.log_finding_message()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Tester reply (respond_to_finding sets tester_response and responded_at).
  if new.tester_response is not null
     and new.responded_at is distinct from old.responded_at then
    insert into public.finding_messages (finding_id, author_id, kind, body, created_at)
      values (new.id, new.tester_id, 'reply', new.tester_response, coalesce(new.responded_at, now()));
  end if;

  -- Company decision (status change, or a new reason on the same status).
  if new.status in ('more_info', 'accepted', 'rejected')
     and (new.status is distinct from old.status or new.review_reason is distinct from old.review_reason) then
    insert into public.finding_messages (finding_id, author_id, kind, body, created_at)
      values (
        new.id,
        coalesce(new.reviewed_by, auth.uid()),
        case new.status when 'more_info' then 'question' else new.status end,
        new.review_reason,
        coalesce(new.reviewed_at, now())
      );
  end if;

  return new;
end;
$$;

drop trigger if exists findings_log_message on public.findings;
create trigger findings_log_message
  after update on public.findings
  for each row execute function public.log_finding_message();

-- One-time backfill of what the columns still hold, for findings with no
-- messages yet. The question is dated just before the reply when both exist.
insert into public.finding_messages (finding_id, author_id, kind, body, created_at)
select f.id, f.reviewed_by, 'question', f.review_reason,
       coalesce(least(f.reviewed_at, f.responded_at - interval '1 second'), f.reviewed_at, f.submitted_at)
from public.findings f
where f.review_reason is not null
  and (f.status = 'more_info' or f.tester_response is not null)
  and not exists (select 1 from public.finding_messages m where m.finding_id = f.id);

insert into public.finding_messages (finding_id, author_id, kind, body, created_at)
select f.id, f.tester_id, 'reply', f.tester_response, coalesce(f.responded_at, now())
from public.findings f
where f.tester_response is not null
  and not exists (select 1 from public.finding_messages m where m.finding_id = f.id and m.kind = 'reply');

notify pgrst, 'reload schema';
