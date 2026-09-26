import { deriveUserRows, deriveTestRows, matchesSearch } from './adminDirectory';

describe('deriveUserRows', () => {
  const rows = deriveUserRows({
    profiles: [
      { id: 't1', name: 'Ama', email: 'ama@x.io', role: 'tester', created_at: '2026-09-01' },
      { id: 'c1', name: 'Dana', email: 'dana@acme.io', role: 'company', client_id: 'cl1', clients: { company_name: 'Acme' }, created_at: '2026-09-10' },
    ],
    testerProfiles: [{ user_id: 't1', country: 'Ghana', skills: ['Fintech'], completed_at: '2026-09-02' }],
    applications: [
      { tester_id: 't1', status: 'accepted' },
      { tester_id: 't1', status: 'pending' },
    ],
    findings: [
      { tester_id: 't1', status: 'accepted' },
      { tester_id: 't1', status: 'open' },
    ],
    payouts: [
      { tester_id: 't1', amount: 50, status: 'paid' },
      { tester_id: 't1', amount: 75, status: 'pending' },
    ],
    tests: [{ client_id: 'cl1' }, { client_id: 'cl1' }, { client_id: 'other' }],
  });

  it('sorts newest first', () => {
    expect(rows.map((r) => r.id)).toEqual(['c1', 't1']);
  });

  it('computes tester activity from real rows only', () => {
    expect(rows[1]).toMatchObject({
      country: 'Ghana', skills: ['Fintech'], profileComplete: true,
      applications: 2, acceptedApplications: 1, acceptedFindings: 1, paid: 50,
    });
  });

  it('counts tests for company users by their company', () => {
    expect(rows[0]).toMatchObject({ company: 'Acme', companyTests: 2, applications: 0, paid: 0 });
  });
});

describe('deriveTestRows', () => {
  it('counts testers, applicants and findings per test', () => {
    const [row] = deriveTestRows({
      tests: [{ id: 'e1', title: 'Checkout', status: 'open', target_tester_count: 5, clients: { company_name: 'Acme' }, compensation: '60' }],
      applications: [
        { test_id: 'e1', status: 'accepted' },
        { test_id: 'e1', status: 'pending' },
        { test_id: 'e1', status: 'declined' },
        { test_id: 'other', status: 'accepted' },
      ],
      findings: [
        { test_id: 'e1', status: 'open' },
        { test_id: 'e1', status: 'more_info' },
        { test_id: 'e1', status: 'accepted' },
        { test_id: 'e1', status: 'rejected' },
      ],
    });
    expect(row).toMatchObject({
      company: 'Acme', statusLabel: 'Active', target: 5, acceptedTesters: 1, pendingApplicants: 1,
      untriagedFindings: 2, acceptedFindings: 1, compensation: 60,
    });
  });
});

it('matchesSearch is case-insensitive across the given fields', () => {
  const row = { name: 'Ama Mensah', email: 'ama@x.io' };
  expect(matchesSearch(row, 'MENSAH', ['name', 'email'])).toBe(true);
  expect(matchesSearch(row, 'acme', ['name', 'email'])).toBe(false);
  expect(matchesSearch(row, '  ', ['name'])).toBe(true);
});
