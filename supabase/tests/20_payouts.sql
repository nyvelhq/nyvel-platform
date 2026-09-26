-- Payout integrity (migration 0010). Runs after 10_access_rules.sql in the
-- same database, reusing its users: aa = tester, ad = admin, c1 = company,
-- dd = second tester; test e2 = Acme's open non-NDA test.

set role authenticated;

-- ------------------------------------------- admin records a paid payout
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ad';
insert into public.payouts (id, test_id, tester_id, amount, status, paid_by, paid_at)
  values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000e2',
          '00000000-0000-0000-0000-0000000000aa', 75, 'paid',
          '00000000-0000-0000-0000-0000000000c1', '2000-01-01');
select tests.check((select paid_at > now() - interval '1 minute' and paid_by = auth.uid()
  from public.payouts where id = '00000000-0000-0000-0000-0000000000a1'),
  '0010: paid_at/paid_by are stamped by the server, not the client');
select tests.check((select count(*) = 1 and bool_and(action = 'insert' and changed_by = auth.uid())
  from public.payout_history where payout_id = '00000000-0000-0000-0000-0000000000a1'),
  '0010: payout creation is recorded in history');

-- ----------------------------------------------- paid rows are locked
select tests.expect_error($$update public.payouts set amount = 1
  where id = '00000000-0000-0000-0000-0000000000a1'$$,
  'already marked paid', '0010: admin cannot change a paid amount');
select tests.expect_error($$update public.payouts set tester_id = '00000000-0000-0000-0000-0000000000dd'
  where id = '00000000-0000-0000-0000-0000000000a1'$$,
  'already marked paid', '0010: admin cannot redirect a paid payout');
select tests.expect_error($$insert into public.payouts (test_id, tester_id, amount, status)
  values ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000aa', 500, 'paid')
  on conflict (test_id, tester_id) do update set amount = excluded.amount$$,
  'already marked paid', '0010: upsert cannot overwrite a paid payout');
select tests.expect_error($$delete from public.payouts where id = '00000000-0000-0000-0000-0000000000a1'$$,
  'already marked paid', '0010: admin cannot delete a paid payout');
select tests.check((select amount = 75 and tester_id = '00000000-0000-0000-0000-0000000000aa'
  from public.payouts where id = '00000000-0000-0000-0000-0000000000a1'),
  '0010: paid payout unchanged after rejected edits');

-- ------------------------------------------ pending -> paid still works
insert into public.payouts (id, test_id, tester_id, amount, status)
  values ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000e2',
          '00000000-0000-0000-0000-0000000000dd', 40, 'pending');
update public.payouts set amount = 45 where id = '00000000-0000-0000-0000-0000000000a2';
update public.payouts set status = 'paid' where id = '00000000-0000-0000-0000-0000000000a2';
select tests.check((select status = 'paid' and amount = 45 and paid_at is not null
  from public.payouts where id = '00000000-0000-0000-0000-0000000000a2'),
  '0010: a pending payout can be edited and then marked paid');
select tests.check((select count(*) = 3 from public.payout_history
  where payout_id = '00000000-0000-0000-0000-0000000000a2'),
  '0010: each change to a payout adds a history row');

-- ------------------------------------------------ who can read history
select tests.check((select count(*) >= 4 from public.payout_history), '0010: admin can read payout history');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
select tests.check((select count(*) = 1 from public.payouts), '0010: tester still reads own payout');
select tests.check((select count(*) = 0 from public.payout_history), '0010: tester cannot read payout history');
select tests.expect_error($$insert into public.payout_history (payout_id, action) values (gen_random_uuid(), 'insert')$$,
  'permission denied', '0010: nobody can write history directly');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
select tests.check((select count(*) = 0 from public.payout_history), '0010: company cannot read payout history');
reset role;
set role anon;
reset request.jwt.claim.sub;
select tests.expect_error('select * from public.payout_history', 'permission denied', '0010: anon cannot read payout history');
reset role;

-- --------------------------- SQL editor (no user JWT) can still correct it
update public.payouts set amount = 70 where id = '00000000-0000-0000-0000-0000000000a1';
select tests.check((select amount = 70 from public.payouts where id = '00000000-0000-0000-0000-0000000000a1'),
  '0010: dashboard correction of a paid payout is allowed');
select tests.check((select (old_row->>'amount')::numeric = 75 and (new_row->>'amount')::numeric = 70 and changed_by is null
  from public.payout_history where payout_id = '00000000-0000-0000-0000-0000000000a1' and action = 'update'),
  '0010: dashboard correction is recorded with before/after values');

\echo 'All payout checks passed.'
