import React, { useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PlatformLayout from '../components/platform/PlatformLayout';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import SegmentedControl from '../components/ui/SegmentedControl';
import useDarkMode from '../hooks/useDarkMode';
import { adminReportsData } from '../data/mockData';

export default function AdminReports() {
  const [timeRange, setTimeRange] = useState('6months');
  const isDark = useDarkMode();

  // Theme-aware chart palette (Recharts can't read Tailwind `dark:` variants)
  const chart = {
    axis: isDark ? '#64748b' : '#94a3b8',
    grid: isDark ? '#1e293b' : '#f1f5f9',
    brand: isDark ? '#38c4b0' : '#17a897',
    cyan: isDark ? '#22d3ee' : '#06b6d4',
    target: isDark ? '#475569' : '#cbd5e1',
  };
  const tooltipStyle = {
    borderRadius: '10px',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    fontSize: 12,
    background: isDark ? '#0f172a' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#0f172a',
  };

  const kpis = [
    { label: 'Total Revenue', value: 284.9, format: (n) => `$${n.toFixed(1)}K`, color: 'text-emerald-600 dark:text-emerald-400', note: '↑ 8.4% vs last period', noteColor: 'text-emerald-600 dark:text-emerald-400 font-semibold' },
    { label: 'Avg. Test Value', value: 1280, format: (n) => `$${Math.round(n).toLocaleString()}`, color: 'text-brand-600 dark:text-brand-400', note: 'Per completed test', noteColor: 'text-slate-400 dark:text-slate-500' },
    { label: 'Avg. Completion', value: 91, format: (n) => `${Math.round(n)}%`, color: 'text-cyan-600 dark:text-cyan-400', note: '↑ 9% vs last period', noteColor: 'text-cyan-600 dark:text-cyan-400 font-semibold' },
    { label: 'Churn Rate', value: 2.3, format: (n) => `${n.toFixed(1)}%`, color: 'text-amber-600 dark:text-amber-400', note: '↓ 0.5% vs last period', noteColor: 'text-amber-600 dark:text-amber-400 font-semibold' },
  ];

  const summary = [
    {
      title: 'Platform Reliability',
      rows: [
        { label: 'Uptime', value: '99.97%', valueClass: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Avg Response Time', value: '245ms', valueClass: 'text-slate-900 dark:text-slate-100' },
        { label: 'Error Rate', value: '0.03%', valueClass: 'text-emerald-600 dark:text-emerald-400' },
      ],
    },
    {
      title: 'User Engagement',
      rows: [
        { label: 'DAU', value: '24,583', valueClass: 'text-slate-900 dark:text-slate-100' },
        { label: 'MAU', value: '412,847', valueClass: 'text-slate-900 dark:text-slate-100' },
        { label: 'Retention (30d)', value: '87%', valueClass: 'text-cyan-600 dark:text-cyan-400' },
      ],
    },
    {
      title: 'Quality Metrics',
      rows: [
        { label: 'Avg Test Quality', value: '8.7/10', valueClass: 'text-slate-900 dark:text-slate-100' },
        { label: 'Bug Detection Rate', value: '94%', valueClass: 'text-slate-900 dark:text-slate-100' },
        { label: 'False Positives', value: '2%', valueClass: 'text-emerald-600 dark:text-emerald-400' },
      ],
    },
  ];

  return (
    <PlatformLayout title="Reports">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 animate-fade-up">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">Analytics &amp; Reports</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Platform performance and business metrics</p>
          </div>
          <SegmentedControl
            ariaLabel="Report time range"
            value={timeRange}
            onChange={setTimeRange}
            options={[
              { value: '7days', label: '7D' },
              { value: '30days', label: '30D' },
              { value: '6months', label: '6M' },
              { value: '1year', label: '1Y' },
            ]}
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {kpis.map(({ label, value, format, color, note, noteColor }, i) => (
            <div key={label} className="card p-5 animate-fade-up" style={{ animationDelay: `${80 + i * 70}ms` }}>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{label}</p>
              <p className={`font-display text-3xl font-bold ${color}`}>
                <AnimatedCounter value={value} format={format} />
              </p>
              <p className={`text-xs mt-1.5 ${noteColor}`}>{note}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="card p-5 animate-fade-up" style={{ animationDelay: '360ms' }}>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={adminReportsData.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={tooltipStyle} labelStyle={{ color: chart.axis }} />
                <Legend wrapperStyle={{ fontSize: 12, color: chart.axis }} />
                <Line type="monotone" dataKey="revenue" stroke={chart.brand} strokeWidth={2.5} dot={{ fill: chart.brand, r: 4 }} name="Actual" />
                <Line type="monotone" dataKey="target" stroke={chart.target} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Test Completion Rate */}
          <div className="card p-5 animate-fade-up" style={{ animationDelay: '430ms' }}>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Test Completion Rate</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={adminReportsData.testCompletionRate}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`, 'Completion']} contentStyle={tooltipStyle} labelStyle={{ color: chart.axis }} />
                <Line type="monotone" dataKey="completion" stroke={chart.cyan} strokeWidth={2.5} dot={{ fill: chart.cyan, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Test Type Distribution */}
          <div className="card p-5 animate-fade-up" style={{ animationDelay: '500ms' }}>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Tests by Type</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={adminReportsData.testTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {adminReportsData.testTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Satisfaction Scores */}
          <div className="card p-5 animate-fade-up" style={{ animationDelay: '570ms' }}>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">User Satisfaction Scores</h3>
            <div className="space-y-4">
              {adminReportsData.userSatisfaction.map((item) => (
                <div key={item.metric}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.metric}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.score}/5.0</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 dark:bg-brand-400 transition-all duration-500"
                      style={{ width: `${(item.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="card p-5 animate-fade-up" style={{ animationDelay: '640ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {summary.map(({ title, rows }) => (
              <div key={title}>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">{title}</p>
                <div className="space-y-2 text-sm">
                  {rows.map(({ label, value, valueClass }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300">{label}</span>
                      <span className={`font-bold ${valueClass}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}
