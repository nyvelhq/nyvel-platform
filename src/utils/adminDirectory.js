// Pure helpers for the admin Users and Tests pages (ADM-01). They turn raw
// Supabase rows into table rows, so the pages stay thin and this logic is
// unit-tested (see adminDirectory.test.js).

const countBy = (rows, key, pick = () => true) => {
  const out = {};
  rows.forEach((r) => {
    if (!pick(r)) return;
    out[r[key]] = (out[r[key]] || 0) + 1;
  });
  return out;
};

export const TEST_STATUS_LABELS = {
  draft: 'Draft',
  open: 'Active',
  complete: 'Completed',
};

export function deriveUserRows({
  profiles = [],
  testerProfiles = [],
  applications = [],
  findings = [],
  payouts = [],
  tests = [],
}) {
  const tpByUser = Object.fromEntries(testerProfiles.map((tp) => [tp.user_id, tp]));
  const appsByTester = countBy(applications, 'tester_id');
  const acceptedAppsByTester = countBy(applications, 'tester_id', (a) => a.status === 'accepted');
  const acceptedFindingsByTester = countBy(findings, 'tester_id', (f) => f.status === 'accepted');
  const testsByClient = countBy(tests, 'client_id');
  const paidByTester = {};
  payouts.forEach((p) => {
    if (p.status !== 'paid') return;
    paidByTester[p.tester_id] = (paidByTester[p.tester_id] || 0) + Number(p.amount || 0);
  });

  return profiles
    .map((p) => {
      const tp = tpByUser[p.id];
      return {
        id: p.id,
        name: p.name || '',
        email: p.email || '',
        role: p.role || 'tester',
        company: p.clients?.company_name || '',
        clientId: p.client_id || null,
        joined: p.created_at || null,
        country: tp?.country || '',
        skills: tp?.skills || [],
        profileComplete: Boolean(tp?.completed_at),
        applications: appsByTester[p.id] || 0,
        acceptedApplications: acceptedAppsByTester[p.id] || 0,
        acceptedFindings: acceptedFindingsByTester[p.id] || 0,
        paid: paidByTester[p.id] || 0,
        companyTests: p.client_id ? testsByClient[p.client_id] || 0 : 0,
      };
    })
    .sort((a, b) => String(b.joined || '').localeCompare(String(a.joined || '')));
}

export function deriveTestRows({ tests = [], applications = [], findings = [] }) {
  const accepted = countBy(applications, 'test_id', (a) => a.status === 'accepted');
  const pending = countBy(applications, 'test_id', (a) => a.status === 'pending');
  const untriaged = countBy(findings, 'test_id', (f) => f.status === 'open' || f.status === 'more_info');
  const acceptedFindings = countBy(findings, 'test_id', (f) => f.status === 'accepted');

  return tests
    .map((t) => ({
      id: t.id,
      title: t.title || 'Untitled test',
      company: t.clients?.company_name || '',
      type: t.test_type || '',
      status: t.status || 'draft',
      statusLabel: TEST_STATUS_LABELS[t.status] || t.status || 'Draft',
      target: t.target_tester_count || 0,
      acceptedTesters: accepted[t.id] || 0,
      pendingApplicants: pending[t.id] || 0,
      untriagedFindings: untriaged[t.id] || 0,
      acceptedFindings: acceptedFindings[t.id] || 0,
      compensation: Number(t.compensation || 0),
      nda: Boolean(t.nda),
      startDate: t.start_date || null,
      endDate: t.end_date || null,
      created: t.created_at || null,
    }))
    .sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')));
}

// Case-insensitive match on any of the given fields.
export function matchesSearch(row, query, fields) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => String(row[f] || '').toLowerCase().includes(q));
}
