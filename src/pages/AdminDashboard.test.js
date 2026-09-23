import { deriveAdminStats } from './AdminDashboard';

// Fixture rows shaped exactly like the columns AdminDashboard.jsx's load()
// selects from Supabase. This guards the aggregation math (F-08's real
// replacement for the old fabricated adminStats/platformGrowthData/
// recentPlatformActivity/topCompanies) independently of Supabase, routing
// and auth — deriveAdminStats is a pure function of these rows.
function buildRaw(overrides = {}) {
  const now = new Date();
  const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

  return {
    profiles: [
      { id: 'u1', created_at: daysAgo(30) },
      { id: 'u2', created_at: daysAgo(2) }, // within last 7 days
    ],
    tests: [
      {
        id: 't1', title: 'Bug Hunt', status: 'open', target_tester_count: 2,
        created_at: daysAgo(10), client_id: 'c1', clients: { company_name: 'Acme' },
      },
      {
        id: 't2', title: 'Usability Study', status: 'complete', target_tester_count: 1,
        created_at: daysAgo(1), client_id: 'c1', clients: { company_name: 'Acme' },
      },
    ],
    payouts: [
      { test_id: 't1', tester_id: 'u1', amount: 100, status: 'paid', paid_at: daysAgo(1) },
      { test_id: 't1', tester_id: 'u2', amount: 50, status: 'pending', paid_at: null },
    ],
    findings: [
      { id: 'f1', title: 'Crash on checkout', severity: 'critical', status: 'accepted', submitted_at: daysAgo(9), test_id: 't1' },
      { id: 'f2', title: 'Minor UI glitch', severity: 'low', status: 'open', submitted_at: daysAgo(1), test_id: 't2' },
    ],
    clients: [
      { id: 'c1', company_name: 'Acme', created_at: daysAgo(60) },
    ],
    applications: [
      { test_id: 't1', status: 'accepted' },
      { test_id: 't1', status: 'accepted' }, // t1's target_tester_count (2) is fully met
      { test_id: 't2', status: 'pending' }, // t2's target (1) is not met
    ],
    ...overrides,
  };
}

describe('deriveAdminStats', () => {
  it('returns null when nothing has loaded yet', () => {
    expect(deriveAdminStats(null)).toBeNull();
  });

  it('computes every KPI from the fixture rows, not a placeholder', () => {
    const stats = deriveAdminStats(buildRaw());

    expect(stats.totalUsers).toBe(2);
    expect(stats.newUsers7d).toBe(1);

    expect(stats.activeTests).toBe(1); // only t1 is 'open'/'in_review'
    expect(stats.newTests7d).toBe(1); // only t2 was created within 7 days

    expect(stats.totalPaidOut).toBe(100); // only the 'paid' payout counts
    expect(stats.paidCount).toBe(1);

    expect(stats.acceptedFindingsCount).toBe(1);
    expect(stats.criticalAccepted).toBe(1);
    expect(stats.openFindings).toBe(1);
  });

  it('ranks top companies by amount actually paid out, not by compensation committed', () => {
    const stats = deriveAdminStats(buildRaw());
    expect(stats.topCompanies).toEqual([
      { name: 'Acme', tests: 2, spend: 100 },
    ]);
  });

  it('computes test fill rate from accepted applications vs. each test\'s target', () => {
    const stats = deriveAdminStats(buildRaw());
    // t1: target 2, 2 accepted -> filled. t2: target 1, 0 accepted -> not filled.
    expect(stats.fillRate).toBe(50);
  });

  it('omits fill rate and time-to-first-result instead of fabricating a number when there is no data for them', () => {
    const stats = deriveAdminStats(buildRaw({ tests: [], applications: [], findings: [] }));
    expect(stats.fillRate).toBeNull();
    expect(stats.avgTimeToFirstResult).toBeNull();
  });

  it('merges recent tests, critical findings, paid payouts and new companies into one sorted activity feed', () => {
    const stats = deriveAdminStats(buildRaw());
    const types = stats.activity.map((a) => a.type);
    expect(types).toEqual(expect.arrayContaining(['test', 'alert', 'payment', 'company']));
    // Sorted newest-first.
    const timestamps = stats.activity.map((a) => new Date(a.at).getTime());
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });
});
