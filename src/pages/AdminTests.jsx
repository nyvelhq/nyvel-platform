import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, FlaskConical, Users, FileSearch, AlertTriangle } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import { StatusBadge, TypeBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import SegmentedControl from '../components/ui/SegmentedControl';
import StatCard from '../components/ui/StatCard';
import TableScrollArea from '../components/ui/TableScrollArea';
import DetailDrawer from '../components/admin/DetailDrawer';
import { supabase } from '../lib/supabaseClient';
import { deriveTestRows, matchesSearch } from '../utils/adminDirectory';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'complete', label: 'Completed' },
];

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/**
 * AdminTests — ADM-01. Read-only list of every test on the platform with
 * real tester, applicant and finding counts. Status changes stay with the
 * owning company (set_test_status); there are no bulk actions.
 */
export default function AdminTests() {
  const [raw, setRaw] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoadError('');
    const [tests, applications, findings] = await Promise.all([
      supabase
        .from('tests')
        .select('id, title, status, test_type, target_tester_count, compensation, nda, start_date, end_date, created_at, clients(company_name)'),
      supabase.from('applications').select('test_id, status'),
      supabase.from('findings').select('test_id, status'),
    ]);
    if (tests.error) {
      console.error('AdminTests load:', tests.error.message);
      setLoadError(tests.error.message || 'Could not load tests.');
      setRaw({});
      return;
    }
    if (applications.error) console.error('AdminTests load (applications):', applications.error.message);
    if (findings.error) console.error('AdminTests load (findings):', findings.error.message);
    setRaw({ tests: tests.data || [], applications: applications.data || [], findings: findings.data || [] });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => (raw ? deriveTestRows(raw) : []), [raw]);
  const active = rows.filter((r) => r.status === 'open');
  const visible = rows.filter(
    (r) => (status === 'all' || r.status === status) && matchesSearch(r, query, ['title', 'company', 'type'])
  );
  const loading = raw === null;

  return (
    <PlatformLayout title="Tests">
      <div className="p-2 sm:p-8 space-y-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Active tests" value={active.length} icon={FlaskConical} iconColor="brand"
            trendCaption={`${rows.length} tests in total`} />
          <StatCard label="Testers accepted" value={active.reduce((n, r) => n + r.acceptedTesters, 0)} icon={Users}
            iconColor="success" trendCaption={`of ${active.reduce((n, r) => n + r.target, 0)} wanted on active tests`} />
          <StatCard label="Findings awaiting triage" value={rows.reduce((n, r) => n + r.untriagedFindings, 0)}
            icon={FileSearch} iconColor="warning" trendCaption="Open or waiting on more info" />
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="max-w-full overflow-x-auto"><SegmentedControl ariaLabel="Filter by status" size="sm" value={status} onChange={setStatus} options={STATUS_FILTERS} /></div>
            <div className="relative sm:w-72">
              <Search size={16} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
              <label htmlFor="test-search" className="sr-only">Search tests</label>
              <input
                id="test-search"
                type="search"
                className="form-input pl-9"
                placeholder="Test, company or type"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">Loading tests…</div>
          ) : loadError ? (
            <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-3" role="alert">
              <AlertTriangle size={18} className="text-error-500 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">Couldn&apos;t load tests: {loadError}</p>
              <Button size="sm" variant="secondary" onClick={load}>Retry</Button>
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title={rows.length ? 'No tests match' : 'No tests yet'}
              description={rows.length ? 'Try another search or status.' : 'Tests appear here once a company creates one.'}
            />
          ) : (
            <TableScrollArea>
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Status</th>
                    <th>Testers</th>
                    <th>Applicants</th>
                    <th>Findings</th>
                    <th>Ends</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <button
                          type="button"
                          onClick={() => setSelected(r)}
                          className="text-left font-medium text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {r.title}
                        </button>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{r.company || 'No company'}</div>
                      </td>
                      <td data-label="Status"><StatusBadge status={r.statusLabel} /></td>
                      <td data-label="Testers" className="text-sm tabular-nums whitespace-nowrap">{r.acceptedTesters}/{r.target}</td>
                      <td data-label="Applicants" className="text-sm tabular-nums whitespace-nowrap">
                        {r.pendingApplicants ? `${r.pendingApplicants} to review` : '—'}
                      </td>
                      <td data-label="Findings" className="text-sm whitespace-nowrap">
                        {r.acceptedFindings} accepted
                        {r.untriagedFindings > 0 && (
                          <span className="text-warning-700 dark:text-warning-400"> · {r.untriagedFindings} waiting</span>
                        )}
                      </td>
                      <td data-label="Ends" className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(r.endDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScrollArea>
          )}
        </div>
      </div>

      <DetailDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title}
        subtitle={selected?.company || 'No company'}
        fields={
          selected
            ? [
                { label: 'Status', value: selected.statusLabel },
                { label: 'Type', value: selected.type ? <TypeBadge type={selected.type} /> : '—' },
                { label: 'NDA', value: selected.nda ? 'Required' : 'No' },
                { label: 'Pay per tester', value: `$${selected.compensation.toLocaleString()}` },
                { label: 'Testers', value: `${selected.acceptedTesters} accepted of ${selected.target}` },
                { label: 'Applicants to review', value: selected.pendingApplicants },
                { label: 'Findings', value: `${selected.acceptedFindings} accepted, ${selected.untriagedFindings} waiting` },
                { label: 'Runs', value: `${formatDate(selected.startDate)} – ${formatDate(selected.endDate)}` },
                { label: 'Created', value: formatDate(selected.created) },
              ]
            : []
        }
      />
    </PlatformLayout>
  );
}
