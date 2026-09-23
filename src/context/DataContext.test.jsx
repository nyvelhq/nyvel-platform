import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataProvider, useAppData } from './DataContext';
import { __getLastInsert } from '../lib/supabaseClient';

// A company user with a client_id — the only shape addCompanyTest needs.
jest.mock('../App', () => ({
  useAuth: () => ({
    user: { id: 'user-1', clientId: 'client-1', role: 'company' },
    isAuthenticated: true,
  }),
}));

// Stands in for the real supabase-js query builder: every chain method
// returns the same thenable builder, load* calls resolve to an empty
// result (nothing under test needs real rows), and insert() records its
// payload so the test below can assert on it.
jest.mock('../lib/supabaseClient', () => {
  const state = { lastInsert: null };
  const makeBuilder = () => {
    const builder = {};
    builder.select = () => builder;
    builder.update = () => builder;
    builder.eq = () => builder;
    builder.in = () => builder;
    builder.order = () => builder;
    builder.insert = (payload) => {
      state.lastInsert = payload;
      return builder;
    };
    builder.single = () =>
      Promise.resolve({ data: { id: 'new-test-id', ...state.lastInsert }, error: null });
    builder.then = (resolve) => Promise.resolve({ data: [], error: null }).then(resolve);
    return builder;
  };
  // Plain function, not jest.fn() — CRA's jest preset sets resetMocks:
  // true, which strips a jest.fn()'s implementation before every test and
  // would silently turn this into a from() that returns undefined.
  return {
    supabase: { from: () => makeBuilder() },
    __getLastInsert: () => state.lastInsert,
  };
});

// Every column addCompanyTest is allowed to write to public.tests, per
// schema.sql (base columns) + migration 0002 (CreateTest.jsx's wizard
// fields). If this list and the insert payload's keys ever diverge, the
// production insert fails with a PostgREST "column ... not found in the
// schema cache" error like the one this test guards against.
const KNOWN_TESTS_COLUMNS = [
  'client_id',
  'title',
  'description',
  'test_type',
  'target_tester_count',
  'status',
  'created_by',
  'compensation',
  'start_date',
  'end_date',
  'platforms',
  'expertise',
  'age_range',
  'countries',
  'nda',
  'briefing',
].sort();

function LaunchButton() {
  const { addCompanyTest } = useAppData();
  return (
    <button
      onClick={() =>
        addCompanyTest({
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
        })
      }
    >
      Launch
    </button>
  );
}

describe('addCompanyTest', () => {
  it('only writes columns that exist on public.tests', async () => {
    render(
      <DataProvider>
        <LaunchButton />
      </DataProvider>
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Launch'));
    });

    const insertedPayload = __getLastInsert();
    expect(insertedPayload).not.toBeNull();
    expect(Object.keys(insertedPayload).sort()).toEqual(KNOWN_TESTS_COLUMNS);
  });
});
