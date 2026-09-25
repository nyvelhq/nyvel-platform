import { deriveTesterEarnings, deriveCompanySummary } from './dashboardStats';

const now = new Date('2026-09-25T12:00:00Z');

describe('deriveTesterEarnings', () => {
  it('returns zeros and six empty months for a brand-new tester', () => {
    const e = deriveTesterEarnings({ now });
    expect(e).toMatchObject({ activeTests: 0, completedTests: 0, acceptedFindings: 0, totalEarned: 0, pendingPayout: 0, thisMonth: 0 });
    expect(e.monthly.map((m) => m.month)).toEqual(['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']);
    expect(e.monthly.every((m) => m.earned === 0)).toBe(true);
  });

  it('sums only paid payouts and buckets them by paid month', () => {
    const e = deriveTesterEarnings({
      now,
      payouts: [
        { test_id: 't1', amount: '50.00', status: 'paid', paid_at: '2026-09-02T10:00:00Z' },
        { test_id: 't2', amount: 30, status: 'paid', paid_at: '2026-07-15T10:00:00Z' },
        { test_id: 't3', amount: 999, status: 'pending', paid_at: null },
        { test_id: 't4', amount: 20, status: 'paid', paid_at: '2025-12-01T10:00:00Z' },
      ],
    });
    expect(e.totalEarned).toBe(100);
    expect(e.thisMonth).toBe(50);
    expect(e.monthly.find((m) => m.month === 'Jul').earned).toBe(30);
  });

  it('counts pending payout only for accepted work with an accepted finding and no paid payout', () => {
    const e = deriveTesterEarnings({
      now,
      applications: [
        { sourceTestId: 't1', status: 'Active', compensation: 75 },
        { sourceTestId: 't2', status: 'Completed', compensation: 50 },
        { sourceTestId: 't3', status: 'Active', compensation: 40 },
        { sourceTestId: 't4', status: 'Pending', compensation: 60 },
        { sourceTestId: 't5', status: 'Rejected', compensation: 60 },
      ],
      acceptedFindingTestIds: ['t1', 't1', 't2', 't4', 't5'],
      payouts: [{ test_id: 't2', amount: 50, status: 'paid', paid_at: '2026-09-01T00:00:00Z' }],
    });
    expect(e.pendingPayout).toBe(75);
    expect(e.activeTests).toBe(2);
    expect(e.completedTests).toBe(1);
    expect(e.acceptedFindings).toBe(5);
  });
});

describe('deriveCompanySummary', () => {
  it('aggregates real per-test counts and accepted findings by severity', () => {
    const s = deriveCompanySummary([
      { status: 'Active', testers: 2, pendingApplicants: 1, openFindings: 3, acceptedBySeverity: { high: 1, low: 2 } },
      { status: 'Completed', testers: 4, pendingApplicants: 0, openFindings: 0, acceptedBySeverity: { critical: 1 } },
      { status: 'Draft', testers: 0 },
    ]);
    expect(s).toMatchObject({ activeTests: 1, acceptedTesters: 6, applicantsToReview: 1, findingsToTriage: 3 });
    expect(s.severity.map((x) => [x.name, x.value])).toEqual([['Critical', 1], ['High', 1], ['Medium', 0], ['Low', 2]]);
  });

  it('is all zeros with no tests', () => {
    const s = deriveCompanySummary([]);
    expect(s.activeTests + s.acceptedTesters + s.applicantsToReview + s.findingsToTriage).toBe(0);
    expect(s.severity.every((x) => x.value === 0)).toBe(true);
  });
});
