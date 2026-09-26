import { deriveReport, formatDuration, monthsToCsv } from './adminReports';

const now = new Date('2026-09-26T12:00:00Z');
const raw = {
  tests: [
    { id: 't1', status: 'open', created_at: '2026-09-10T00:00:00Z', clients: { company_name: 'Acme' } },
    { id: 't2', status: 'complete', created_at: '2026-05-01T00:00:00Z', clients: { company_name: 'Globex' } },
  ],
  findings: [
    { test_id: 't1', severity: 'high', status: 'accepted', submitted_at: '2026-09-20T00:00:00Z', reviewed_at: '2026-09-20T06:00:00Z' },
    { test_id: 't1', severity: 'low', status: 'rejected', submitted_at: '2026-09-21T00:00:00Z', reviewed_at: '2026-09-22T00:00:00Z' },
    { test_id: 't1', severity: 'low', status: 'open', submitted_at: '2026-09-25T00:00:00Z' },
    { test_id: 't2', severity: 'critical', status: 'accepted', submitted_at: '2026-05-05T00:00:00Z', reviewed_at: '2026-05-06T00:00:00Z' },
  ],
  payouts: [
    { amount: 75, status: 'paid', paid_at: '2026-09-23T00:00:00Z' },
    { amount: 50, status: 'paid', paid_at: '2026-05-20T00:00:00Z' },
    { amount: 60, status: 'pending', paid_at: null },
  ],
};

describe('deriveReport', () => {
  it('limits everything to the chosen range', () => {
    const r = deriveReport(raw, 30, now);
    expect(r.findingsSubmitted).toBe(3);
    expect(r.bySeverity).toEqual({ critical: 0, high: 1, medium: 0, low: 2 });
    expect(r.byStatus).toEqual({ waiting: 1, accepted: 1, rejected: 1 });
    expect(r.acceptanceRate).toBe(0.5);
    expect(r.medianReviewHours).toBe(15); // 6h and 24h
    expect(r.paidTotal).toBe(75);
    expect(r.testsCreated).toBe(1);
    expect(r.activeTests).toBe(1);
  });

  it('covers all time when no range is given, with months newest first', () => {
    const r = deriveReport(raw, null, now);
    expect(r.findingsSubmitted).toBe(4);
    expect(r.paidTotal).toBe(125);
    expect(r.months.map((m) => [m.label, m.submitted, m.accepted, m.paid])).toEqual([
      ['Sep 2026', 3, 1, 75],
      ['May 2026', 1, 1, 50],
    ]);
  });

  it('ranks companies by accepted findings', () => {
    const r = deriveReport(raw, null, now);
    expect(r.companies[0]).toEqual({ name: 'Acme', submitted: 3, accepted: 1 });
    expect(r.companies[1]).toEqual({ name: 'Globex', submitted: 1, accepted: 1 });
  });

  it('reports no acceptance rate or review time when nothing is decided', () => {
    const r = deriveReport({ findings: [{ status: 'open', severity: 'low', submitted_at: '2026-09-25T00:00:00Z' }] }, 30, now);
    expect(r.acceptanceRate).toBeNull();
    expect(r.medianReviewHours).toBeNull();
  });
});

it('formatDuration reads naturally', () => {
  expect(formatDuration(null)).toBe('—');
  expect(formatDuration(0.5)).toBe('< 1h');
  expect(formatDuration(15)).toBe('15h');
  expect(formatDuration(60)).toBe('2.5 days');
  expect(formatDuration(24 * 12)).toBe('12 days');
});

it('monthsToCsv produces a header and one row per month', () => {
  expect(monthsToCsv([{ label: 'Sep 2026', submitted: 3, accepted: 1, paid: 75 }])).toBe(
    'Month,Findings submitted,Findings accepted,Paid out (USD)\nSep 2026,3,1,75'
  );
});
