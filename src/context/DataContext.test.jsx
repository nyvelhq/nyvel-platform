import React, { useEffect } from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { DataProvider, useAppData } from './DataContext';
import { __getLastInsert, __getCalls, __setResponse, __reset } from '../lib/supabaseClient';
import { __setAuth } from '../App';

// A configurable signed-in user for each test. Overridden per test via
// __setAuth before rendering; defaults to a company user with a client_id.
jest.mock('../App', () => {
  let current = {
    user: { id: 'user-1', clientId: 'client-1', role: 'company' },
    isAuthenticated: true,
  };
  return {
    useAuth: () => current,
    __setAuth: (next) => {
      current = next;
    },
  };
});

// Stands in for the real supabase-js query builder. Every chain method
// (select/eq/in/order) returns the same builder; insert/update/upsert
// record their table, payload and any .eq()/.in() filters so tests can
// assert on exactly what DataContext sent to Supabase; select-style reads
// resolve to whatever __setResponse(table, {...}) configured, defaulting
// to an empty result.
jest.mock('../lib/supabaseClient', () => {
  const state = { lastInsert: null, calls: [], responses: {} };

  const makeBuilder = (table) => {
    const call = { table, op: null, payload: null, filters: {} };
    const builder = {};
    builder.select = () => builder;
    builder.eq = (col, val) => {
      call.filters[col] = val;
      return builder;
    };
    builder.in = (col, vals) => {
      call.filters[col] = vals;
      return builder;
    };
    builder.order = () => builder;
    builder.insert = (payload) => {
      call.op = 'insert';
      call.payload = payload;
      state.lastInsert = payload;
      state.calls.push(call);
      return builder;
    };
    builder.update = (payload) => {
      call.op = 'update';
      call.payload = payload;
      state.calls.push(call);
      return builder;
    };
    builder.upsert = (payload, opts) => {
      call.op = 'upsert';
      call.payload = payload;
      call.opts = opts;
      state.calls.push(call);
      return builder;
    };
    builder.single = () =>
      Promise.resolve({ data: { id: 'new-id', ...call.payload }, error: null });
    builder.then = (resolve) =>
      Promise.resolve(state.responses[table] || { data: [], error: null }).then(resolve);
    return builder;
  };

  return {
    supabase: {
      from: (table) => makeBuilder(table),
      rpc: (fn, args) => {
        state.calls.push({ table: null, op: 'rpc', fn, args });
        return Promise.resolve(state.responses[`rpc:${fn}`] || { data: null, error: null });
      },
    },
    __getLastInsert: () => state.lastInsert,
    __getCalls: () => state.calls,
    __setResponse: (table, response) => {
      state.responses[table] = response;
    },
    __reset: () => {
      state.lastInsert = null;
      state.calls = [];
      state.responses = {};
    },
  };
});

beforeEach(() => {
  __reset();
  __setAuth({
    user: { id: 'user-1', clientId: 'client-1', role: 'company' },
    isAuthenticated: true,
  });
});

// Captures the DataContext value so tests can call its functions directly
// instead of driving them through UI.
function Harness({ onReady }) {
  const data = useAppData();
  useEffect(() => {
    onReady(data);
  });
  return null;
}

async function renderApi() {
  let api;
  render(
    <DataProvider>
      <Harness onReady={(d) => { api = d; }} />
    </DataProvider>
  );
  await waitFor(() => expect(api).toBeTruthy());
  return () => api;
}

const lastCall = (table, op) =>
  [...__getCalls()].reverse().find((c) => c.table === table && c.op === op);

describe('addCompanyTest', () => {
  it('only writes columns that exist on public.tests', async () => {
    const getApi = await renderApi();

    await act(async () => {
      await getApi().addCompanyTest({
        name: 'My Test',
        type: 'Bug Hunt',
        description: 'A description',
        startDate: '2026-08-01',
        endDate: '2026-08-15',
        testerCount: 20,
        platforms: ['Web'],
        expertise: ['General Consumer'],
        ageRange: '18-65',
        countries: 'United States',
        compensation: 35,
        nda: true,
        briefing: 'Focus on checkout',
      });
    });

    const KNOWN_TESTS_COLUMNS = [
      'client_id', 'title', 'description', 'test_type', 'target_tester_count',
      'status', 'created_by', 'compensation', 'start_date', 'end_date',
      'platforms', 'expertise', 'age_range', 'countries', 'nda', 'briefing',
    ].sort();
    expect(Object.keys(__getLastInsert()).sort()).toEqual(KNOWN_TESTS_COLUMNS);
  });

  it('fails with a clear error instead of inserting when the account has no client_id', async () => {
    __setAuth({ user: { id: 'user-1', role: 'company' }, isAuthenticated: true });
    const getApi = await renderApi();

    let result;
    await act(async () => {
      result = await getApi().addCompanyTest({ name: 'x' });
    });

    expect(result.error).toBeInstanceOf(Error);
    expect(lastCall('tests', 'insert')).toBeUndefined();
  });
});

describe('loadCompanyTests (derived company test rows)', () => {
  it('maps DB status to display status and aggregates accepted testers/findings per test', async () => {
    __setResponse('tests', {
      data: [
        { id: 't1', title: 'Bug Hunt Test', test_type: 'Bug Hunt', status: 'open', target_tester_count: 5, end_date: '2026-08-01', platforms: ['Web'] },
        { id: 't2', title: 'Usability Test', test_type: 'Usability', status: 'complete', target_tester_count: 3, end_date: '2026-07-01', platforms: [] },
      ],
      error: null,
    });
    __setResponse('applications', {
      data: [
        { test_id: 't1', status: 'accepted' },
        { test_id: 't1', status: 'pending' },
        { test_id: 't2', status: 'accepted' },
      ],
      error: null,
    });
    __setResponse('findings', {
      data: [
        { test_id: 't1', severity: 'critical', status: 'accepted' },
        { test_id: 't1', severity: 'low', status: 'open' }, // not accepted -> excluded
        { test_id: 't2', severity: 'medium', status: 'accepted' },
      ],
      error: null,
    });

    const getApi = await renderApi();
    await waitFor(() => expect(getApi().companyTests).toHaveLength(2));

    const [t1, t2] = getApi().companyTests;
    expect(t1).toMatchObject({ id: 't1', status: 'Active', testers: 1, issues: 1, criticalIssues: 1, severity: 'Critical' });
    expect(t2).toMatchObject({ id: 't2', status: 'Completed', testers: 1, issues: 1, criticalIssues: 0, severity: 'Medium' });
    expect(t1).toMatchObject({ pendingApplicants: 1, openFindings: 1, acceptedBySeverity: { critical: 1 } });
    expect(t2).toMatchObject({ pendingApplicants: 0, openFindings: 0, acceptedBySeverity: { medium: 1 } });
  });
});

describe('loadMyEarnings (tester payouts + accepted findings)', () => {
  it('exposes the signed-in tester\'s payouts and accepted-finding test ids', async () => {
    __setAuth({ user: { id: 'tester-1', role: 'tester' }, isAuthenticated: true });
    __setResponse('payouts', {
      data: [{ test_id: 't1', amount: 50, status: 'paid', paid_at: '2026-09-01T00:00:00Z' }],
      error: null,
    });
    __setResponse('findings', { data: [{ test_id: 't1' }, { test_id: 't2' }], error: null });

    const getApi = await renderApi();
    await waitFor(() => expect(getApi().myPayouts).toHaveLength(1));
    expect(getApi().myAcceptedFindingTestIds).toEqual(['t1', 't2']);
  });

  it('loads nothing for a non-tester', async () => {
    __setResponse('payouts', { data: [{ test_id: 't1', amount: 50, status: 'paid' }], error: null });
    const getApi = await renderApi();
    await waitFor(() => expect(getApi().dataLoading).toBe(false));
    expect(getApi().myPayouts).toEqual([]);
  });
});

describe('loadAvailableTests (derived tester-facing test rows)', () => {
  it('computes remaining slots from accepted applications and carries company name/tags', async () => {
    __setResponse('tests', {
      data: [{
        id: 't1', title: 'Beta App', test_type: 'Bug Hunt', status: 'open',
        compensation: 50, end_date: '2026-09-01', target_tester_count: 10,
        platforms: ['iOS'], expertise: ['QA Professional'], description: 'desc',
        clients: { company_name: 'Acme' },
      }],
      error: null,
    });
    __setResponse('applications', {
      data: [{ test_id: 't1', status: 'accepted' }, { test_id: 't1', status: 'accepted' }],
      error: null,
    });

    const getApi = await renderApi();
    await waitFor(() => expect(getApi().availableTests).toHaveLength(1));

    expect(getApi().availableTests[0]).toMatchObject({
      id: 't1', company: 'Acme', compensation: 50, slots: 8, slotsTotal: 10,
      platforms: ['iOS'], tags: ['QA Professional'],
    });
  });
});

describe('loadMyApplications (derived tester applications)', () => {
  it('combines application + test status into a display status/progress, and drops applications to an unreadable test', async () => {
    __setAuth({ user: { id: 'tester-1', role: 'tester' }, isAuthenticated: true });
    __setResponse('applications', {
      data: [
        { id: 'app1', test_id: 't1', status: 'declined', applied_at: '2026-06-01T00:00:00Z', tests: { id: 't1', title: 'Test A', test_type: 'Bug Hunt', status: 'open', compensation: 20, end_date: '2026-07-01', clients: { company_name: 'Acme' } } },
        { id: 'app2', test_id: 't2', status: 'pending', applied_at: '2026-06-02T00:00:00Z', tests: { id: 't2', title: 'Test B', test_type: 'Usability', status: 'open', compensation: 25, end_date: '2026-07-02', clients: { company_name: 'Beta' } } },
        { id: 'app3', test_id: 't3', status: 'accepted', applied_at: '2026-06-03T00:00:00Z', tests: { id: 't3', title: 'Test C', test_type: 'Load Test', status: 'open', compensation: 15, end_date: '2026-07-03', clients: { company_name: 'Gamma' } } },
        { id: 'app4', test_id: 't4', status: 'accepted', applied_at: '2026-06-04T00:00:00Z', tests: { id: 't4', title: 'Test D', test_type: 'Usability', status: 'complete', compensation: 40, end_date: '2026-07-04', clients: { company_name: 'Delta' } } },
        { id: 'app5', test_id: 't5', status: 'accepted', applied_at: '2026-06-05T00:00:00Z', tests: null }, // RLS/deleted test -> dropped
      ],
      error: null,
    });

    const getApi = await renderApi();
    await waitFor(() => expect(getApi().myApplications).toHaveLength(4));

    const byId = Object.fromEntries(getApi().myApplications.map((a) => [a.id, a]));
    expect(byId.app1).toMatchObject({ status: 'Rejected', progress: 0 });
    expect(byId.app2).toMatchObject({ status: 'Pending', progress: 0 });
    expect(byId.app3).toMatchObject({ status: 'Active', progress: 50 });
    expect(byId.app4).toMatchObject({ status: 'Completed', progress: 100 });
    expect(byId.app5).toBeUndefined();
  });
});

describe('applyToTest / hasApplied', () => {
  it('inserts an application for the signed-in tester', async () => {
    __setAuth({ user: { id: 'tester-1', role: 'tester' }, isAuthenticated: true });
    const getApi = await renderApi();

    await act(async () => {
      await getApi().applyToTest({ id: 'test-1' });
    });

    expect(lastCall('applications', 'insert').payload).toEqual({ test_id: 'test-1', tester_id: 'tester-1' });
  });

  it('does not insert a second application for a test the tester already applied to', async () => {
    __setAuth({ user: { id: 'tester-1', role: 'tester' }, isAuthenticated: true });
    __setResponse('applications', {
      data: [{ id: 'app1', test_id: 'test-1', status: 'pending', applied_at: '2026-06-01T00:00:00Z', tests: { id: 'test-1', title: 'T', test_type: 'Bug Hunt', status: 'open', compensation: 10, end_date: '2026-07-01', clients: {} } }],
      error: null,
    });
    const getApi = await renderApi();
    await waitFor(() => expect(getApi().myApplications).toHaveLength(1));

    expect(getApi().hasApplied('test-1')).toBe(true);
    await act(async () => {
      await getApi().applyToTest({ id: 'test-1' });
    });
    expect(lastCall('applications', 'insert')).toBeUndefined();
  });

  it('records the accepted NDA version when applying to an NDA-required test', async () => {
    __setAuth({ user: { id: 'tester-1', role: 'tester' }, isAuthenticated: true });
    const getApi = await renderApi();

    await act(async () => {
      await getApi().applyToTest({ id: 'test-1', nda: true }, { ndaVersion: 'v1-test' });
    });

    expect(lastCall('applications', 'insert').payload).toEqual({
      test_id: 'test-1', tester_id: 'tester-1', nda_version: 'v1-test',
    });
  });

  it('refuses to apply to an NDA-required test without an accepted NDA version', async () => {
    __setAuth({ user: { id: 'tester-1', role: 'tester' }, isAuthenticated: true });
    const getApi = await renderApi();

    let result;
    await act(async () => {
      result = await getApi().applyToTest({ id: 'test-1', nda: true });
    });

    expect(result.error).toBeInstanceOf(Error);
    expect(lastCall('applications', 'insert')).toBeUndefined();
  });
});

describe('acceptApplication / declineApplication', () => {
  it('updates the application status, decided_by and the target row', async () => {
    const getApi = await renderApi();

    await act(async () => {
      await getApi().acceptApplication('app-1');
    });
    const acceptCall = lastCall('applications', 'update');
    expect(acceptCall.payload).toMatchObject({ status: 'accepted', decided_by: 'user-1' });
    expect(acceptCall.filters).toEqual({ id: 'app-1' });

    await act(async () => {
      await getApi().declineApplication('app-2');
    });
    const declineCall = lastCall('applications', 'update');
    expect(declineCall.payload).toMatchObject({ status: 'declined', decided_by: 'user-1' });
    expect(declineCall.filters).toEqual({ id: 'app-2' });
  });
});

describe('submitFinding', () => {
  it('inserts a finding attributed to the signed-in tester', async () => {
    __setAuth({ user: { id: 'tester-1', role: 'tester' }, isAuthenticated: true });
    const getApi = await renderApi();

    let result;
    await act(async () => {
      result = await getApi().submitFinding({ testId: 't1', title: 'Crash on save', description: 'Steps...', severity: 'high' });
    });

    expect(lastCall('findings', 'insert').payload).toEqual({
      test_id: 't1', tester_id: 'tester-1', title: 'Crash on save', description: 'Steps...', severity: 'high',
    });
    expect(result.finding.id).toBe('new-id');
  });

  it('refuses to submit when nobody is signed in, without calling Supabase', async () => {
    __setAuth({ user: null, isAuthenticated: false });
    const getApi = await renderApi();

    let result;
    await act(async () => {
      result = await getApi().submitFinding({ testId: 't1', title: 'x', description: 'y', severity: 'low' });
    });

    expect(result.error).toBeInstanceOf(Error);
    expect(lastCall('findings', 'insert')).toBeUndefined();
  });
});

describe('triageFinding', () => {
  it('records the decision, reviewer and reason, and targets the right finding', async () => {
    const getApi = await renderApi();

    await act(async () => {
      await getApi().triageFinding('finding-1', 'accepted', null);
    });
    const acceptCall = lastCall('findings', 'update');
    expect(acceptCall.payload).toMatchObject({ status: 'accepted', review_reason: null, reviewed_by: 'user-1' });
    expect(acceptCall.filters).toEqual({ id: 'finding-1' });

    await act(async () => {
      await getApi().triageFinding('finding-2', 'rejected', 'Not reproducible');
    });
    const rejectCall = lastCall('findings', 'update');
    expect(rejectCall.payload).toMatchObject({ status: 'rejected', review_reason: 'Not reproducible' });
    expect(rejectCall.filters).toEqual({ id: 'finding-2' });
  });
});

describe('markPayoutPaid', () => {
  it('upserts a paid payout keyed on (test_id, tester_id)', async () => {
    __setAuth({ user: { id: 'admin-1', role: 'admin' }, isAuthenticated: true });
    const getApi = await renderApi();

    await act(async () => {
      await getApi().markPayoutPaid({ testId: 't1', testerId: 'tester-1', amount: 50 });
    });

    const call = lastCall('payouts', 'upsert');
    expect(call.payload).toMatchObject({ test_id: 't1', tester_id: 'tester-1', amount: 50, status: 'paid', paid_by: 'admin-1' });
    expect(call.opts).toEqual({ onConflict: 'test_id,tester_id' });
  });
});

describe('setTestStatus / respondToFinding (migration 0007 RPCs)', () => {
  const rpcCall = (fn) => [...__getCalls()].reverse().find((c) => c.op === 'rpc' && c.fn === fn);

  it('calls set_test_status with the test id and target status', async () => {
    const getApi = await renderApi();
    let result;
    await act(async () => {
      result = await getApi().setTestStatus('test-1', 'complete');
    });
    expect(result.error).toBeNull();
    expect(rpcCall('set_test_status').args).toEqual({ p_test_id: 'test-1', p_status: 'complete' });
  });

  it('passes the server error back instead of swallowing it', async () => {
    __setResponse('rpc:set_test_status', { data: null, error: { message: 'You can only change the status of your own tests.' } });
    const getApi = await renderApi();
    let result;
    await act(async () => {
      result = await getApi().setTestStatus('test-1', 'complete');
    });
    expect(result.error.message).toMatch(/own tests/);
  });

  it('calls respond_to_finding with the finding id and reply', async () => {
    __setAuth({ user: { id: 'tester-1', role: 'tester' }, isAuthenticated: true });
    const getApi = await renderApi();
    await act(async () => {
      await getApi().respondToFinding('finding-1', 'Build 1.4.2');
    });
    expect(rpcCall('respond_to_finding').args).toEqual({ p_finding_id: 'finding-1', p_response: 'Build 1.4.2' });
  });
});
