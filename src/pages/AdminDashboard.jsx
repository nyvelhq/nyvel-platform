import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, FlaskConical, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';
import SegmentedControl from '../components/ui/SegmentedControl';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import PlatformLayout from '../components/platform/PlatformLayout';
import StatCard from '../components/ui/StatCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import useDarkMode from '../hooks/useDarkMode';
import { supabase } from '../lib/supabaseClient';

// Categorical accent per activity type — saturated 500s read cleanly on both themes.
const activityDot = {
  company: 'bg-brand-500',
  test: 'bg-cyan-500',
  payment: 'bg-emerald-500',
  alert: 'bg-error-500',
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Last 6 calendar months including the current one, oldest first.
function lastSixMonths() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }) });
  }
  return months;
}
const monthKey = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
};

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

// All platform metrics derived from real rows the page fetched — nothing
// here is a placeholder or a guessed number (see F-08: this page used to
// render src/data/mockData.js's fabricated adminStats/platformGrowthData/
// recentPlatformActivity/topCompanies). Exported as a pure function, kept
// out of the component, so the aggregation math can be unit-tested without
// mounting the page or mocking Supabase/router/auth.
export function deriveAdminStats(raw) {
  if (!raw) return null;
  const { profiles, tests, payouts, findings, clients, applications } = raw;
  const sevenDaysAgo = Date.now() - 7 * DAY_MS;
  const testById = new Map(tests.map((t) => [t.id, t]));

  const totalUsers = profiles.length;
  const newUsers7d = profiles.filter((p) => new Date(p.created_at).getTime() >= sevenDaysAgo).length;

  const activeTests = tests.filter((t) => ['open', 'in_review'].includes(t.status)).length;
  const newTests7d = tests.filter((t) => new Date(t.created_at).getTime() >= sevenDaysAgo).length;

  const paidPayouts = payouts.filter((p) => p.status === 'paid');
  const totalPaidOut = paidPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const acceptedFindings = findings.filter((f) => f.status === 'accepted');
  const criticalAccepted = acceptedFindings.filter((f) => f.severity === 'critical').length;
  const openFindings = findings.filter((f) => f.status === 'open').length;

  // Growth — cumulative users/tests reached by end of each month, plus
  // that month's paid-out total (the "Payouts" chart view).
  let cumUsers = 0;
  let cumTests = 0;
  const growth = lastSixMonths().map(({ key, label }) => {
    cumUsers += profiles.filter((p) => monthKey(p.created_at) === key).length;
    cumTests += tests.filter((t) => monthKey(t.created_at) === key).length;
    const payoutsThisMonth = paidPayouts
      .filter((p) => p.paid_at && monthKey(p.paid_at) === key)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    return { month: label, users: cumUsers, tests: cumTests, payouts: payoutsThisMonth };
  });

  // Top companies by amount actually paid out to testers on their tests.
  const byClient = new Map(); // client_id -> { name, tests, spend }
  tests.forEach((t) => {
    if (!t.client_id) return;
    const entry = byClient.get(t.client_id) || { name: t.clients?.company_name || 'Unknown company', tests: 0, spend: 0 };
    entry.tests += 1;
    byClient.set(t.client_id, entry);
  });
  paidPayouts.forEach((p) => {
    const test = testById.get(p.test_id);
    const entry = test?.client_id && byClient.get(test.client_id);
    if (entry) entry.spend += Number(p.amount) || 0;
  });
  const topCompanies = [...byClient.values()].sort((a, b) => b.spend - a.spend).slice(0, 5);

  // Test fill rate — accepted testers vs. the test's target, over tests
  // that actually have a target to hit.
  const acceptedByTest = new Map();
  applications.forEach((a) => {
    if (a.status !== 'accepted') return;
    acceptedByTest.set(a.test_id, (acceptedByTest.get(a.test_id) || 0) + 1);
  });
  const testsWithTarget = tests.filter((t) => t.target_tester_count > 0);
  const filledTests = testsWithTarget.filter(
    (t) => (acceptedByTest.get(t.id) || 0) >= t.target_tester_count
  ).length;
  const fillRate = testsWithTarget.length > 0 ? (filledTests / testsWithTarget.length) * 100 : null;

  // Avg. time from a test's creation to its first tester submission, over
  // tests that have received at least one finding.
  const firstSubmissionByTest = new Map();
  findings.forEach((f) => {
    const existing = firstSubmissionByTest.get(f.test_id);
    const submitted = new Date(f.submitted_at).getTime();
    if (!existing || submitted < existing) firstSubmissionByTest.set(f.test_id, submitted);
  });
  const timeToFirstResultHrs = [...firstSubmissionByTest.entries()]
    .map(([testId, submittedAt]) => {
      const test = testById.get(testId);
      if (!test) return null;
      const hrs = (submittedAt - new Date(test.created_at).getTime()) / (60 * 60 * 1000);
      return hrs >= 0 ? hrs : null;
    })
    .filter((h) => h !== null);
  const avgTimeToFirstResult = timeToFirstResultHrs.length > 0
    ? timeToFirstResultHrs.reduce((sum, h) => sum + h, 0) / timeToFirstResultHrs.length
    : null;

  // Live activity — most recent events across tests, findings, payouts and
  // new companies, merged and sorted.
  const activity = [
    ...tests
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map((t) => ({
        id: `test-${t.id}`,
        event: 'Test launched',
        detail: `${t.title} · ${t.clients?.company_name || 'Unknown company'}`,
        at: t.created_at,
        type: 'test',
      })),
    ...findings
      .filter((f) => f.severity === 'critical')
      .slice()
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
      .slice(0, 5)
      .map((f) => ({
        id: `finding-${f.id}`,
        event: 'Critical bug reported',
        detail: `${testById.get(f.test_id)?.title || 'Unknown test'} — ${f.title}`,
        at: f.submitted_at,
        type: 'alert',
      })),
    ...paidPayouts
      .filter((p) => p.paid_at)
      .slice()
      .sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at))
      .slice(0, 5)
      .map((p) => ({
        id: `payout-${p.test_id}-${p.tester_id}`,
        event: 'Payout processed',
        detail: `$${(Number(p.amount) || 0).toLocaleString()} to a tester on ${testById.get(p.test_id)?.title || 'a test'}`,
        at: p.paid_at,
        type: 'payment',
      })),
    ...clients
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map((c) => ({
        id: `client-${c.id}`,
        event: 'New company registered',
        detail: c.company_name,
        at: c.created_at,
        type: 'company',
      })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8);

  return {
    totalUsers, newUsers7d, activeTests, newTests7d,
    totalPaidOut, paidCount: paidPayouts.length,
    acceptedFindingsCount: acceptedFindings.length, criticalAccepted, openFindings,
    growth, topCompanies, fillRate, avgTimeToFirstResult, activity,
  };
}

export default function AdminDashboard() {
  const [chartView, setChartView] = useState('users');
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState(null);
  const navigate = useNavigate();
  const isDark = useDarkMode();

  const load = useCallback(async () => {
    setLoading(true);
    const [
      { data: profiles, error: profilesError },
      { data: tests, error: testsError },
      { data: payouts, error: payoutsError },
      { data: findings, error: findingsError },
      { data: clients, error: clientsError },
      { data: applications, error: applicationsError },
    ] = await Promise.all([
      supabase.from('profiles').select('id, created_at'),
      supabase.from('tests').select('id, title, status, target_tester_count, created_at, client_id, clients(company_name)'),
      supabase.from('payouts').select('test_id, tester_id, amount, status, paid_at'),
      supabase.from('findings').select('id, title, severity, status, submitted_at, test_id'),
      supabase.from('clients').select('id, company_name, created_at'),
      supabase.from('applications').select('test_id, status'),
    ]);

    if (profilesError) console.error('AdminDashboard load (profiles):', profilesError.message);
    if (testsError) console.error('AdminDashboard load (tests):', testsError.message);
    if (payoutsError) console.error('AdminDashboard load (payouts):', payoutsError.message);
    if (findingsError) console.error('AdminDashboard load (findings):', findingsError.message);
    if (clientsError) console.error('AdminDashboard load (clients):', clientsError.message);
    if (applicationsError) console.error('AdminDashboard load (applications):', applicationsError.message);

    setRaw({
      profiles: profiles || [],
      tests: tests || [],
      payouts: payouts || [],
      findings: findings || [],
      clients: clients || [],
      applications: applications || [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Theme-aware chart palette (Recharts can't read Tailwind `dark:` variants).
  const chart = {
    axis: isDark ? '#64748b' : '#94a3b8',
    grid: isDark ? '#1e293b' : '#f1f5f9',
    line: isDark ? '#38c4b0' : '#17a897',
  };
  const tooltipStyle = {
    borderRadius: '10px',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    fontSize: 12,
    background: isDark ? '#0f172a' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#0f172a',
    boxShadow: '0 4px 8px -2px rgba(15, 23, 42, 0.12)',
  };

  const stats = useMemo(() => deriveAdminStats(raw), [raw]);

  const kpis = stats && [
    {
      label: 'Total Users', value: stats.totalUsers, icon: Users, iconColor: 'violet',
      format: (n) => Math.round(n).toLocaleString(),
      trendCaption: `+${stats.newUsers7d} in the last 7 days`,
    },
    {
      label: 'Active Tests', value: stats.activeTests, icon: FlaskConical, iconColor: 'cyan',
      format: (n) => Math.round(n).toLocaleString(),
      trendCaption: `${stats.newTests7d} launched in the last 7 days`,
    },
    {
      label: 'Total Paid Out', value: stats.totalPaidOut, icon: DollarSign, iconColor: 'green',
      format: (n) => `$${Math.round(n).toLocaleString()}`,
      trendCaption: `${stats.paidCount} payout${stats.paidCount === 1 ? '' : 's'} recorded`,
    },
    {
      label: 'Accepted Findings', value: stats.acceptedFindingsCount, icon: CheckCircle2, iconColor: 'amber',
      format: (n) => Math.round(n).toLocaleString(),
      trendCaption: `${stats.criticalAccepted} critical`,
    },
  ];

  return (
    <PlatformLayout title="Platform Overview">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">Platform Overview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Nyvel platform activity, pulled live from Supabase</p>
          </div>
        </div>

        {loading || !stats ? (
          <div className="card p-10 text-center text-sm text-slate-400 dark:text-slate-500">
            Loading platform metrics…
          </div>
        ) : (
        <>
        {/* KPI stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <div
              key={kpi.label}
              className="animate-fade-up"
              style={{ animationDelay: `${80 + i * 70}ms` }}
            >
              <StatCard
                label={kpi.label}
                value={kpi.value}
                icon={kpi.icon}
                iconColor={kpi.iconColor}
                animate
                format={kpi.format}
                trendCaption={kpi.trendCaption}
              />
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Platform growth chart */}
          <div className="xl:col-span-2 card p-5 animate-fade-up" style={{ animationDelay: '360ms' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Platform Growth</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Last 6 months</p>
              </div>
              <SegmentedControl
                ariaLabel="Chart metric"
                size="sm"
                value={chartView}
                onChange={setChartView}
                options={[
                  { value: 'users', label: 'Users' },
                  { value: 'tests', label: 'Tests' },
                  { value: 'payouts', label: 'Payouts' },
                ]}
              />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              {chartView === 'payouts' ? (
                <BarChart data={stats.growth} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}K`} />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.12)' }}
                    formatter={(v) => [`$${v.toLocaleString()}`, 'Paid out']}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: chart.axis }}
                  />
                  <Bar dataKey="payouts" fill={chart.line} radius={[5, 5, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={stats.growth} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ stroke: chart.axis, strokeWidth: 1 }}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: chart.axis }}
                  />
                  <Line
                    type="monotone"
                    dataKey={chartView}
                    stroke={chart.line}
                    strokeWidth={2.5}
                    dot={{ fill: chart.line, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Recent activity */}
          <div className="card p-5 animate-fade-up" style={{ animationDelay: '430ms' }}>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Live Activity</h3>
            {stats.activity.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.activity.map((item) => {
                  const isAlert = item.type === 'alert';
                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 group rounded-lg ${
                        isAlert ? 'bg-error-50/60 dark:bg-error-900/10 p-2 -mx-2' : ''
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activityDot[item.type] || activityDot.company}`} />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs leading-tight ${
                            isAlert
                              ? 'font-bold text-error-800 dark:text-error-300'
                              : 'font-semibold text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {item.event}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight truncate">{item.detail}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{timeAgo(item.at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top companies table */}
        <div className="card overflow-hidden animate-fade-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/70 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Top Companies by Amount Paid Out</h3>
            <button
              onClick={() => navigate('/admin/users')}
              className="group inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors"
            >
              View all
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
          {stats.topCompanies.length === 0 ? (
            <p className="p-6 text-sm text-slate-400 dark:text-slate-500">No companies with recorded payouts yet.</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Company</th>
                  <th>Tests Run</th>
                  <th>Total Paid Out</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCompanies.map((co, idx) => (
                  <tr
                    key={co.name}
                    className="table-row-enter"
                    style={{ animationDelay: `${560 + idx * 60}ms` }}
                  >
                    <td>
                      <span className={`font-mono text-sm font-bold ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-300 dark:text-slate-600'}`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {co.name[0]}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{co.name}</span>
                      </div>
                    </td>
                    <td className="font-semibold text-slate-700 dark:text-slate-300">{co.tests}</td>
                    <td className="font-bold text-emerald-600 dark:text-emerald-400">${co.spend.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Platform health metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Test Fill Rate',
              value: stats.fillRate,
              format: (n) => `${n.toFixed(1)}%`,
              sub: 'Tests that reached their full tester count',
              color: 'text-emerald-600 dark:text-emerald-400',
            },
            {
              label: 'Avg. Time to First Result',
              value: stats.avgTimeToFirstResult,
              format: (n) => `${n.toFixed(1)}hrs`,
              sub: 'From test launch to first tester submission',
              color: 'text-brand-600 dark:text-brand-400',
            },
            {
              label: 'Findings Awaiting Triage',
              value: stats.openFindings,
              format: (n) => Math.round(n).toLocaleString(),
              sub: 'Submitted but not yet reviewed',
              color: 'text-amber-500 dark:text-amber-400',
            },
          ].map(({ label, value, format, sub, color }, i) => (
            <div
              key={label}
              className="card p-5 animate-fade-up"
              style={{ animationDelay: `${620 + i * 70}ms` }}
            >
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{label}</p>
              <p className={`font-display text-3xl font-bold ${color}`}>
                {value === null ? (
                  <span className="text-slate-300 dark:text-slate-600">—</span>
                ) : (
                  <AnimatedCounter value={value} format={format} />
                )}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{sub}</p>
            </div>
          ))}
        </div>
        </>
        )}
      </div>
    </PlatformLayout>
  );
}
