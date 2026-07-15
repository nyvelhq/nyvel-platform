import React, { useState } from 'react';
import { Users, FlaskConical, DollarSign, Activity, ArrowRight } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import PlatformLayout from '../components/platform/PlatformLayout';
import StatCard from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import useDarkMode from '../hooks/useDarkMode';
import {
  adminStats, platformGrowthData, recentPlatformActivity, topCompanies
} from '../data/mockData';

// Categorical accent per activity type — saturated 500s read cleanly on both themes.
const activityDot = {
  company: 'bg-brand-500',
  test: 'bg-cyan-500',
  payment: 'bg-emerald-500',
  alert: 'bg-error-500',
  tester: 'bg-violet-500',
};

const planColors = {
  Enterprise: 'violet',
  Professional: 'cyan',
  Starter: 'slate',
};

const parseTrend = (s) => parseFloat(String(s).replace('%', '')) || 0;

export default function AdminDashboard() {
  const [chartView, setChartView] = useState('users');
  const navigate = useNavigate();
  const isDark = useDarkMode();

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

  const kpis = [
    { label: 'Total Users', value: adminStats.totalUsers, icon: Users, iconColor: 'violet',
      format: (n) => Math.round(n).toLocaleString(), trend: parseTrend(adminStats.trends.totalUsers) },
    { label: 'Active Tests', value: adminStats.activeTests, icon: FlaskConical, iconColor: 'cyan',
      format: (n) => Math.round(n).toLocaleString(), trend: parseTrend(adminStats.trends.activeTests) },
    { label: 'Monthly Revenue', value: adminStats.monthlyRevenue, icon: DollarSign, iconColor: 'green',
      format: (n) => `$${Math.round(n / 1000)}K`, trend: parseTrend(adminStats.trends.monthlyRevenue) },
    { label: 'Platform Uptime', value: adminStats.uptime, icon: Activity, iconColor: 'amber',
      format: (n) => `${n.toFixed(2)}%`, trend: parseTrend(adminStats.trends.uptime) },
  ];

  return (
    <PlatformLayout title="Platform Overview">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">Platform Overview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time Nyvel platform health &amp; metrics</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50/70 dark:bg-success-900/20 border border-success-200/70 dark:border-success-800/50 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
            </span>
            <span className="text-xs font-semibold text-success-700 dark:text-success-300">All Systems Operational</span>
          </div>
        </div>

        {/* KPI stats — trend now lives inside each card (was a redundant second row) */}
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
                trend={kpi.trend}
                trendLabel="%"
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
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1" role="tablist" aria-label="Chart metric">
                {['users', 'tests', 'revenue'].map((v) => (
                  <button
                    key={v}
                    role="tab"
                    aria-selected={chartView === v}
                    onClick={() => setChartView(v)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all duration-200
                      ${chartView === v
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-elevation-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              {chartView === 'revenue' ? (
                <BarChart data={platformGrowthData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.12)' }}
                    formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: chart.axis }}
                  />
                  <Bar dataKey="revenue" fill={chart.line} radius={[5, 5, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={platformGrowthData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: chart.axis }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={chartView === 'users' ? (v) => `${(v / 1000).toFixed(0)}K` : undefined}
                  />
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
            <div className="space-y-3">
              {recentPlatformActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 group">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activityDot[item.type] || activityDot.company}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{item.event}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight truncate">{item.detail}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top companies table */}
        <div className="card overflow-hidden animate-fade-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/70 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Top Companies by Spend</h3>
            <button
              onClick={() => navigate('/admin/users')}
              className="group inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors"
            >
              View all
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Company</th>
                  <th>Plan</th>
                  <th>Tests Run</th>
                  <th>Total Spend</th>
                </tr>
              </thead>
              <tbody>
                {topCompanies.map((co, idx) => (
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
                    <td>
                      <Badge label={co.plan} color={planColors[co.plan]} />
                    </td>
                    <td className="font-semibold text-slate-700 dark:text-slate-300">{co.tests}</td>
                    <td className="font-bold text-emerald-600 dark:text-emerald-400">${co.spend.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Platform health metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Test Fill Rate', value: 96.4, format: (n) => `${n.toFixed(1)}%`, sub: 'Tests reaching full tester count', color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Avg. Time to First Result', value: 18.2, format: (n) => `${n.toFixed(1)}hrs`, sub: 'From test launch to first tester submission', color: 'text-brand-600 dark:text-brand-400' },
            { label: 'Tester Satisfaction Score', value: 4.8, format: (n) => `${n.toFixed(1)} / 5.0`, sub: 'Average company rating of testers', color: 'text-amber-500 dark:text-amber-400' },
          ].map(({ label, value, format, sub, color }, i) => (
            <div
              key={label}
              className="card p-5 animate-fade-up"
              style={{ animationDelay: `${620 + i * 70}ms` }}
            >
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{label}</p>
              <p className={`font-display text-3xl font-bold ${color}`}>
                <AnimatedCounter value={value} format={format} />
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </PlatformLayout>
  );
}
