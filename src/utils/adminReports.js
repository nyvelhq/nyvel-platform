// Pure helpers for the admin Reports page (ADM-02). Everything is derived
// from real findings, payouts and tests rows; see adminReports.test.js.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SEVERITIES = ['critical', 'high', 'medium', 'low'];
const DAY = 24 * 60 * 60 * 1000;

const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const monthKey = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

/**
 * @param {object}  raw
 * @param {Array}   raw.tests     id, created_at, status, clients { company_name }
 * @param {Array}   raw.findings  test_id, severity, status, submitted_at, reviewed_at
 * @param {Array}   raw.payouts   amount, status, paid_at
 * @param {number|null} rangeDays  null = all time
 * @param {Date}    now
 */
export function deriveReport({ tests = [], findings = [], payouts = [] }, rangeDays = null, now = new Date()) {
  const since = rangeDays ? now.getTime() - rangeDays * DAY : null;
  const inRange = (iso) => Boolean(iso) && (since === null || new Date(iso).getTime() >= since);

  const found = findings.filter((f) => inRange(f.submitted_at));
  const bySeverity = Object.fromEntries(SEVERITIES.map((s) => [s, found.filter((f) => f.severity === s).length]));
  const byStatus = {
    waiting: found.filter((f) => f.status === 'open' || f.status === 'more_info').length,
    accepted: found.filter((f) => f.status === 'accepted').length,
    rejected: found.filter((f) => f.status === 'rejected').length,
  };
  const decided = byStatus.accepted + byStatus.rejected;
  const reviewHours = found
    .filter((f) => f.reviewed_at && f.submitted_at)
    .map((f) => (new Date(f.reviewed_at) - new Date(f.submitted_at)) / (60 * 60 * 1000))
    .filter((h) => h >= 0);

  const paid = payouts.filter((p) => p.status === 'paid' && inRange(p.paid_at));
  const paidTotal = paid.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Month rows, newest first, for every month with any activity in range.
  const months = new Map();
  const bucket = (iso) => {
    const d = new Date(iso);
    const key = monthKey(d);
    if (!months.has(key)) {
      months.set(key, { key, label: `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`, submitted: 0, accepted: 0, paid: 0 });
    }
    return months.get(key);
  };
  found.forEach((f) => {
    const m = bucket(f.submitted_at);
    m.submitted += 1;
    if (f.status === 'accepted') m.accepted += 1;
  });
  paid.forEach((p) => {
    bucket(p.paid_at).paid += Number(p.amount) || 0;
  });

  // Companies ranked by accepted findings in range.
  const companyByTest = Object.fromEntries(tests.map((t) => [t.id, t.clients?.company_name || 'Unknown company']));
  const companies = new Map();
  found.forEach((f) => {
    const name = companyByTest[f.test_id] || 'Unknown company';
    const row = companies.get(name) || { name, submitted: 0, accepted: 0 };
    row.submitted += 1;
    if (f.status === 'accepted') row.accepted += 1;
    companies.set(name, row);
  });

  return {
    findingsSubmitted: found.length,
    bySeverity,
    byStatus,
    acceptanceRate: decided ? byStatus.accepted / decided : null,
    medianReviewHours: median(reviewHours),
    paidTotal,
    paidCount: paid.length,
    testsCreated: tests.filter((t) => inRange(t.created_at)).length,
    activeTests: tests.filter((t) => t.status === 'open').length,
    months: [...months.values()].sort((a, b) => b.key.localeCompare(a.key)),
    companies: [...companies.values()].sort((a, b) => b.accepted - a.accepted || b.submitted - a.submitted).slice(0, 5),
  };
}

// "3h", "2.5 days", or "—".
export function formatDuration(hours) {
  if (hours === null || hours === undefined) return '—';
  if (hours < 1) return '< 1h';
  if (hours < 48) return `${Math.round(hours)}h`;
  const days = hours / 24;
  return `${days < 10 ? days.toFixed(1).replace(/\.0$/, '') : Math.round(days)} days`;
}

export function monthsToCsv(months) {
  const escape = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const lines = [['Month', 'Findings submitted', 'Findings accepted', 'Paid out (USD)']];
  months.forEach((m) => lines.push([m.label, m.submitted, m.accepted, m.paid]));
  return lines.map((row) => row.map(escape).join(',')).join('\n');
}
