import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical, Users, AlertTriangle, CheckCircle, Plus, ExternalLink,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import PlatformLayout from '../components/platform/PlatformLayout';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import { StatusBadge, TypeBadge, SeverityBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ScrollReveal from '../components/ScrollReveal';
import useDarkMode from '../hooks/useDarkMode';
import { useAuth } from '../App';
import { useAppData } from '../context/DataContext';
import {
  companyStats, activityChartData, issuesBySeverity
} from '../data/mockData';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { companyTests } = useAppData();
  const isDark = useDarkMode();

  // Theme-aware chart palette (Recharts can't read Tailwind `dark:` variants)
  const chart = {
    axis: isDark ? '#64748b' : '#94a3b8',
    grid: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(203, 213, 225, 0.3)',
    brand: isDark ? '#38c4b0' : '#17a897',
    accent: isDark ? '#fbbf24' : '#f59e0b',
  };
  const tooltipStyle = {
    borderRadius: '8px',
    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#0f172a',
    fontSize: 12,
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
  };

  return (
    <PlatformLayout title="Dashboard">
      <div className="p-8 space-y-8">
        {/* Welcome bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/50">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
              Good morning, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {user?.company} · {user?.plan} Plan
            </p>
          </div>
          <Button
            icon={<Plus size={16} />}
            onClick={() => navigate('/company/create-test')}
            size="lg"
          >
            New Test
          </Button>
        </div>

        {/* Stats row */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <ScrollReveal animation="fade-in-page" staggerIndex={0} staggerDelay={100}>
              <StatCard
                label="Active Tests"
                value={companyStats.activeTests}
                animate
                trend={companyStats.trends.activeTests}
                trendLabel=" this week"
                icon={FlaskConical}
                iconColor="violet"
              />
            </ScrollReveal>
            <ScrollReveal animation="fade-in-page" staggerIndex={1} staggerDelay={100}>
              <StatCard
                label="Total Testers"
                value={companyStats.totalTesters}
                animate
                trend={companyStats.trends.totalTesters}
                trendLabel=" this month"
                icon={Users}
                iconColor="cyan"
              />
            </ScrollReveal>
            <ScrollReveal animation="fade-in-page" staggerIndex={2} staggerDelay={100}>
              <StatCard
                label="Open Issues"
                value={companyStats.openIssues}
                animate
                trend={companyStats.trends.openIssues}
                trendLabel=" since last week"
                icon={AlertTriangle}
                iconColor="amber"
                invert
              />
            </ScrollReveal>
            <ScrollReveal animation="fade-in-page" staggerIndex={3} staggerDelay={100}>
              <StatCard
                label="Completion Rate"
                value={companyStats.completionRate}
                animate
                format={(n) => `${Math.round(n)}%`}
                trend={companyStats.trends.completionRate}
                trendLabel="%"
                icon={CheckCircle}
                iconColor="green"
              />
            </ScrollReveal>
          </div>
        </div>

        {/* Analytics Section */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-4">Analytics</h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Activity line chart */}
            <div className="xl:col-span-2 card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Test Activity</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Issues found & testers active over time</p>
                </div>
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-brand-500 rounded-full inline-block" />
                  Issues
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-accent-400 rounded-full inline-block" />
                  Testers
                </span>
              </div>
            </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={activityChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: chart.axis }} />
                  <Line type="monotone" dataKey="issues" stroke={chart.brand} strokeWidth={3} dot={{ fill: chart.brand, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="testers" stroke={chart.accent} strokeWidth={3} dot={{ fill: chart.accent, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
          </div>

            {/* Issues by severity donut */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-1">Issues by Severity</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">Across all active tests</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={issuesBySeverity}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {issuesBySeverity.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {issuesBySeverity.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span>{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tests table */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/70 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Tests</h3>
            <button
              onClick={() => navigate('/company/tests')}
              className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium flex items-center gap-1"
            >
              View all <ExternalLink size={13} />
            </button>
          </div>
          {companyTests.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="No tests yet"
              description="Launch your first test to start collecting real-world feedback from vetted testers."
              actionLabel="Create Your First Test"
              onAction={() => navigate('/company/create-test')}
            />
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Test ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Testers</th>
                  <th>Issues</th>
                  <th>Due Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {companyTests.map((test) => (
                  <tr
                    key={test.id}
                    className="table-row-enter cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    onClick={() => navigate(`/company/tests/${test.id}`)}
                  >
                    <td>
                      <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{test.id}</span>
                    </td>
                    <td>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{test.name}</span>
                      <div className="flex gap-1 mt-1">
                        {test.platform.map((p) => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded font-medium">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td><TypeBadge type={test.type} /></td>
                    <td><StatusBadge status={test.status} /></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 w-16">
                          <div
                            className="h-1.5 rounded-full bg-brand-500"
                            style={{ width: `${test.target ? (test.testers / test.target) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {test.testers}/{test.target}
                        </span>
                      </div>
                    </td>
                    <td>
                      <SeverityBadge count={test.issues} type="bugs" />
                    </td>
                    <td className="text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{test.dueDate}</td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/company/tests/${test.id}`);
                        }}
                        className="text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </PlatformLayout>
  );
}
