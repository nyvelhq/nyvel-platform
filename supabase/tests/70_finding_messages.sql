-- Finding conversation history (migration 0015). Reuses users from 10:
-- dd = tester accepted on Acme's open test e1, aa = another tester there,
-- c1 = Acme, c2 = another company, ad = admin.

-- ------------------------------------------------ two full rounds are kept
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000dd';
insert into public.findings (id, test_id, tester_id, title, description, severity) values
  ('00000000-0000-0000-0000-0000000000f3', '00000000-0000-0000-0000-0000000000e1',
   '00000000-0000-0000-0000-0000000000dd', 'Login loops', 'Steps', 'high');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
update public.findings set status = 'more_info', review_reason = 'Which browser?'
  where id = '00000000-0000-0000-0000-0000000000f3';
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000dd';
select public.respond_to_finding('00000000-0000-0000-0000-0000000000f3', 'Safari 17');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
update public.findings set status = 'more_info', review_reason = 'Private mode too?'
  where id = '00000000-0000-0000-0000-0000000000f3';
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000dd';
select public.respond_to_finding('00000000-0000-0000-0000-0000000000f3', 'Only in private mode');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
update public.findings set status = 'rejected', review_reason = 'Known Safari bug'
  where id = '00000000-0000-0000-0000-0000000000f3';
reset role;

select tests.check((
  select array_agg(kind || ':' || coalesce(body, '') order by created_at, kind)
  from public.finding_messages where finding_id = '00000000-0000-0000-0000-0000000000f3'
) = array['question:Which browser?', 'reply:Safari 17', 'question:Private mode too?',
          'reply:Only in private mode', 'rejected:Known Safari bug'],
  '0015: every question, reply and decision is kept in order');
select tests.check((
  select bool_and(author_id = case kind when 'reply' then '00000000-0000-0000-0000-0000000000dd'::uuid
                                        else '00000000-0000-0000-0000-0000000000c1'::uuid end)
  from public.finding_messages where finding_id = '00000000-0000-0000-0000-0000000000f3'
), '0015: messages record who wrote them');

-- ------------------------------------------------ who can read
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000dd';
select tests.check((select count(*) = 5 from public.finding_messages
  where finding_id = '00000000-0000-0000-0000-0000000000f3'), '0015: the tester reads their finding''s thread');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
select tests.check((select count(*) = 0 from public.finding_messages
  where finding_id = '00000000-0000-0000-0000-0000000000f3'), '0015: another tester cannot read it');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
select tests.check((select count(*) = 5 from public.finding_messages
  where finding_id = '00000000-0000-0000-0000-0000000000f3'), '0015: the owning company reads it');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c2';
select tests.check((select count(*) = 0 from public.finding_messages
  where finding_id = '00000000-0000-0000-0000-0000000000f3'), '0015: another company cannot read it');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ad';
select tests.check((select count(*) = 5 from public.finding_messages
  where finding_id = '00000000-0000-0000-0000-0000000000f3'), '0015: admins read it');

-- ------------------------------------------------ nobody writes directly
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000dd';
select tests.expect_error($$insert into public.finding_messages (finding_id, kind, body)
  values ('00000000-0000-0000-0000-0000000000f3', 'reply', 'forged')$$, 'permission denied',
  '0015: tester cannot insert a message');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
select tests.expect_error($$update public.finding_messages set body = 'edited'$$, 'permission denied',
  '0015: company cannot edit the thread');
select tests.expect_error($$delete from public.finding_messages$$, 'permission denied',
  '0015: company cannot delete the thread');
reset role;

set role anon;
reset request.jwt.claim.sub;
select tests.expect_error('select * from public.finding_messages', 'permission denied',
  '0015: anon cannot read messages');
reset role;

-- ------------------------------------------------ backfill
-- A finding that already had a question and reply before 0015 existed.
alter table public.findings disable trigger findings_log_message;
insert into public.findings (id, test_id, tester_id, title, description, severity, status, review_reason,
                             reviewed_at, tester_response, responded_at)
  values ('00000000-0000-0000-0000-0000000000f4', '00000000-0000-0000-0000-0000000000e1',
          '00000000-0000-0000-0000-0000000000dd', 'Old one', 'Steps', 'low', 'open', 'Which OS?',
          now() - interval '2 days', 'iOS 17', now() - interval '1 day');
alter table public.findings enable trigger findings_log_message;

\i supabase/migrations/0015_finding_messages.sql
\i supabase/migrations/0015_finding_messages.sql
select tests.check((
  select array_agg(kind || ':' || body order by created_at)
  from public.finding_messages where finding_id = '00000000-0000-0000-0000-0000000000f4'
) = array['question:Which OS?', 'reply:iOS 17'],
  '0015: existing question and reply are backfilled once, in order');
select tests.check((select count(*) = 5 from public.finding_messages
  where finding_id = '00000000-0000-0000-0000-0000000000f3'), '0015: re-running does not duplicate history');

\echo 'All finding-message checks passed.'
