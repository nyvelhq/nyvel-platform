import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileSearch, CheckCircle2, Clock, DollarSign, Download, AlertTriangle, BarChart3 } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import SegmentedControl from '../components/ui/SegmentedControl';
import StatCard from '../components/ui/StatCard';
import TableScrollArea from '../components/ui/TableScrollArea';
import { supabase } from '../lib/supabaseClient';
import { deriveReport, formatDuration, monthsToCsv } from '../utils/adminReports';
import { SEVERITY_COLORS } from '../utils/dashboardStats';

const RANGES = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

/**
 * AdminReports — ADM-02. Platform reporting built only from real rows:
 * findings (volume, severity, outcomes, review time), payouts (paid out) and
 * tests. The monthly table can be downloaded as CSV.
 */
export default function AdminReports() {
  const [raw, setRaw] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [range, setRange] = useState('30');

  const load = useCallback(async () => {
    setLoadError('');
    const [tests, findings, payouts] = await Promise.all([
      supabase.from('tests').select('id, status, created_at, clients(company_name)'),
      supabase.from('findings').select('test_id, severity, status, submitted_at, reviewed_at'),
      supabase.from('payouts').select('amount, status, paid_at'),
    ]);
    const failed = [tests, findings, payouts].find((r) => r.error);
    if (failed) {
      console.error('AdminReports load:', failed.error.message);
      setLoadError(failed.error.message || 'Could not load report data.');
      setRaw({});
      return;
    }
    setRaw({ tests: tests.data || [], findings: findings.data || [], payouts: payouts.data || [] });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const report = useMemo(
    () => (raw ? deriveReport(raw, range === 'all' ? null : Number(range)) : null),
    [raw, range]
  );
  const rangeLabel = RANGES.find((r) => r.value === range)?.label.toLowerCase();

  const downloadCsv = () => {
    const blob = new Blob([monthsToCsv(report.months)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyvel-report-${range === 'all' ? 'all-time' : `last-${range}-days`}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PlatformLayout title="Reports">
      <div className="p-2 sm:p-8 space-y-6 max-w-6xl mx-auto">
        <div className="max-w-full overflow-x-auto">
          <SegmentedControl ariaLabel="Report period" size="sm" value={range} onChange={setRange} options={RANGES} />
        </div>

        {!report ? (
          <div className="card p-10 text-center text-sm text-slate-500 dark:text-slate-400">Loading report…</div>
        ) : loadError ? (
          <div className="card p-6 flex flex-col sm:flex-row sm:items-center gap-3" role="alert">
            <AlertTriangle size={18} className="text-error-500 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">Couldn&apos;t load the report: {loadError}</p>
            <Button size="sm" variant="secondary" onClick={load}>Retry</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard label="Findings submitted" value={report.findingsSubmitted} icon={FileSearch} iconColor="brand"
                trendCaption={`${report.byStatus.waiting} waiting for review`} />
              <StatCard label="Acceptance rate"
                value={report.acceptanceRate === null ? '—' : `${Math.round(report.acceptanceRate * 100)}%`}
                icon={CheckCircle2} iconColor="success"
                trendCaption={`${report.byStatus.accepted} accepted · ${report.byStatus.rejected} rejected`} />
              <StatCard label="Median time to review" value={formatDuration(report.medianReviewHours)} icon={Clock}
                iconColor="warning" trendCaption="Submission to latest decision" />
              <StatCard label="Paid out" value={`$${report.paidTotal.toLocaleString()}`} icon={DollarSign} iconColor="success"
                trendCaption={`${report.paidCount} payout${report.paidCount === 1 ? '' : 's'}`} />
            </div>

            {report.findingsSubmitted === 0 && report.paidCount === 0 ? (
              <div className="card">
                <EmptyState icon={BarChart3} title={`No activity ${rangeLabel}`} description="Try a longer period." />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="card p-3 sm:p-6" aria-labelledby="severity-heading">
                  <h2 id="severity-heading" className="font-display font-semibold text-base text-slate-900 dark:text-slate-50 mb-4">
                    Findings by severity
                  </h2>
                  <ul className="space-y-3">
                    {SEVERITY_COLORS.map(({ key, name, color }) => {
                      const count = report.bySeverity[key];
                      const pct = report.findingsSubmitted ? (count / report.findingsSubmitted) * 100 : 0;
                      return (
                        <li key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700 dark:text-slate-300">{name}</span>
                            <span className="tabular-nums text-slate-600 dark:text-slate-400">{count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
                            <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section className="card p-0 overflow-hidden" aria-labelledby="companies-heading">
                  <h2 id="companies-heading" className="font-display font-semibold text-base text-slate-900 dark:text-slate-50 p-3 sm:p-6 pb-0 sm:pb-0">
                    Companies by accepted findings
                  </h2>
                  {report.companies.length ? (
                    <TableScrollArea>
                      <table className="w-full data-table">
                        <thead>
                          <tr><th>Company</th><th>Submitted</th><th>Accepted</th></tr>
                        </thead>
                        <tbody>
                          {report.companies.map((c) => (
                            <tr key={c.name}>
                              <td className="font-medium text-slate-800 dark:text-slate-200">{c.name}</td>
                              <td data-label="Submitted" className="tabular-nums">{c.submitted}</td>
                              <td data-label="Accepted" className="tabular-nums">{c.accepted}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TableScrollArea>
                  ) : (
                    <p className="p-3 sm:p-6 text-sm text-slate-500 dark:text-slate-400">No findings in this period.</p>
                  )}
                </section>

                <section className="card p-0 overflow-hidden lg:col-span-2" aria-labelledby="monthly-heading">
                  <div className="p-3 sm:p-6 pb-0 sm:pb-0 flex items-center justify-between gap-3">
                    <h2 id="monthly-heading" className="font-display font-semibold text-base text-slate-900 dark:text-slate-50">By month</h2>
                    <Button size="sm" variant="secondary" icon={<Download size={14} />} onClick={downloadCsv}>
                      Download CSV
                    </Button>
                  </div>
                  <TableScrollArea>
                    <table className="w-full data-table">
                      <thead>
                        <tr><th>Month</th><th>Findings submitted</th><th>Findings accepted</th><th>Paid out</th></tr>
                      </thead>
                      <tbody>
                        {report.months.map((m) => (
                          <tr key={m.key}>
                            <td className="font-medium text-slate-800 dark:text-slate-200">{m.label}</td>
                            <td data-label="Submitted" className="tabular-nums">{m.submitted}</td>
                            <td data-label="Accepted" className="tabular-nums">{m.accepted}</td>
                            <td data-label="Paid out" className="tabular-nums">${m.paid.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TableScrollArea>
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </PlatformLayout>
  );
}
