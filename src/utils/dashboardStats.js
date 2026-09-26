const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Mirrors AdminPayouts' payable rule: an accepted tester is owed a test's
// flat compensation once they have at least one accepted finding on it, until
// a paid payout row exists for that test.
export function deriveTesterEarnings({ applications = [], payouts = [], acceptedFindingTestIds = [], now = new Date() }) {
  const paid = payouts.filter((p) => p.status === 'paid');
  const paidTestIds = new Set(paid.map((p) => p.test_id));
  const acceptedFindings = new Set(acceptedFindingTestIds);

  const totalEarned = paid.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const owed = applications.filter((a) => (a.status === 'Active' || a.status === 'Completed')
    && acceptedFindings.has(a.sourceTestId)
    && !paidTestIds.has(a.sourceTestId));
  const pendingPayout = owed.reduce((sum, a) => sum + (Number(a.compensation) || 0), 0);

  const monthly = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    monthly.push({ key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`, month: MONTHS[d.getUTCMonth()], earned: 0 });
  }
  const byKey = new Map(monthly.map((m) => [m.key, m]));
  paid.forEach((p) => {
    if (!p.paid_at) return;
    const d = new Date(p.paid_at);
    const bucket = byKey.get(`${d.getUTCFullYear()}-${d.getUTCMonth()}`);
    if (bucket) bucket.earned += Number(p.amount) || 0;
  });

  return {
    activeTests: applications.filter((a) => a.status === 'Active').length,
    completedTests: applications.filter((a) => a.status === 'Completed').length,
    acceptedFindings: acceptedFindingTestIds.length,
    totalEarned,
    pendingPayout,
    // The tests behind pendingPayout, so the dashboard can link to them (UX-06).
    pendingPayoutTests: owed.map((a) => ({ id: a.sourceTestId, name: a.testName, amount: Number(a.compensation) || 0 })),
    thisMonth: monthly[monthly.length - 1].earned,
    monthly: monthly.map(({ month, earned }) => ({ month, earned })),
  };
}

export const SEVERITY_COLORS = [
  { key: 'critical', name: 'Critical', color: '#ef4444' },
  { key: 'high', name: 'High', color: '#f97316' },
  { key: 'medium', name: 'Medium', color: '#f59e0b' },
  { key: 'low', name: 'Low', color: '#6366f1' },
];

export function deriveCompanySummary(companyTests = []) {
  const sum = (fn) => companyTests.reduce((total, t) => total + (fn(t) || 0), 0);
  return {
    activeTests: companyTests.filter((t) => t.status === 'Active').length,
    acceptedTesters: sum((t) => t.testers),
    applicantsToReview: sum((t) => t.pendingApplicants),
    findingsToTriage: sum((t) => t.openFindings),
    severity: SEVERITY_COLORS.map(({ key, name, color }) => ({
      name,
      color,
      value: sum((t) => t.acceptedBySeverity?.[key]),
    })),
  };
}

// Tests with something waiting on the company, most urgent first (UX-06).
// `field` is a per-test count on companyTests rows, e.g. 'pendingApplicants'.
export function testsNeedingAction(companyTests = [], field) {
  return companyTests
    .filter((t) => (t[field] || 0) > 0)
    .map((t) => ({ id: t.id, name: t.name, count: t[field] }))
    .sort((a, b) => b.count - a.count || String(a.name).localeCompare(String(b.name)));
}

// "1 bug" / "2 bugs". Pass the plural; a trailing "s" is dropped for one.
export const pluralize = (count, plural) =>
  `${count} ${count === 1 && plural.endsWith('s') ? plural.slice(0, -1) : plural}`;
