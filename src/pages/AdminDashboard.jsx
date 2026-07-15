import React, { useState } from 'react';
import { Users, FlaskConical, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import PlatformLayout from '../components/platform/PlatformLayout';
import StatCard from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import {
  adminStats, platformGrowthData, recentPlatformActivity, topCompanies
} from '../data/mockData';

const activityIconMap = {
  company: { color: 'bg-brand-100 text-brand-600', dot: 'bg-brand-500' },
  test: { color: 'bg-cyan-100 text-cyan-600', dot: 'bg-cyan-500' },
  payment: { color: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500' },
  alert: { color: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
  tester: { color: 'bg-violet-100 text-violet-600', dot: 'bg-violet-500' },
};

const planColors = {
  Enterprise: 'violet',
  Professional: 'cyan',
  Starter: 'slate',
};

export default function AdminDashboard() {
  const [chartView, setChartView] = useState('users');
  const navigate = useNavigate();

  return (
    <PlatformLayout title="Platform Overview">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/50">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">Platform Overview</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Real-time Nyvel platform health & metrics</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50/70 dark:bg-success-900/20 border border-success-200/70 dark:border-success-800/50 rounded-full">
            <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
            <span className="text-xs font-semibold text-success-700 dark:text-success-300">All Systems Operational</span>
          </div>
        </div>

        {/* Key Metrics Section */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            label="Total Users"
            value={adminStats.totalUsers.toLocaleString()}
            icon={Users}
            iconColor="violet"
          />
          <StatCard
            label="Active Tests"
            value={adminStats.activeTests.toLocaleString()}
            icon={FlaskConical}
            iconColor="cyan"
          />
          <StatCard
            label="Monthly Revenue"
            value={`$${(adminStats.monthlyRevenue / 1000).toFixed(0)}K`}
            icon={DollarSign}
            iconColor="green"
          />
          <StatCard
            label="Platform Uptime"
            value={`${adminStats.uptime}%`}
            icon={Activity}
            iconColor="amber"
          />
          </div>
        </div>

        {/* Trend indicators */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-4">Trends</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(adminStats.trends).map(([key, val]) => {
              const labels = {
                totalUsers: 'User Growth',
                activeTests: 'Test Volume',
                monthlyRevenue: 'Revenue',
                uptime: 'Uptime Change',
              };
              const isPositive = val.startsWith('+');
              return (
                <div key={key} className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-200
                  ${isPositive ? 'bg-success-50/70 dark:bg-success-900/20 border-success-200/70 dark:border-success-800/50 text-success-700 dark:text-success-300' : 'bg-slate-100/70 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-700/50 text-slate-600 dark:text-slate-400'}`}>
                  <span className="text-xs font-medium">{labels[key]}</span>
                  <span className="flex items-center gap-1 font-semibold">
                    {isPositive && <ArrowUpRight size={14} />}
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analytics Section */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-4">Analytics</h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Platform growth chart */}
            <div className="xl:col-span-2 card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Platform Growth</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Last 6 months</p>
                </div>
              <div className="flex gap-1 bg-slate-100/60 dark:bg-slate-800/40 rounded-lg p-1">
                {['users', 'tests', 'revenue'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setChartView(v)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all duration-200
                      ${chartView === v ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-elevation-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              {chartView === 'revenue' ? (
                <BarChart data={platformGrowthData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.3)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                  <Tooltip
                    formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#17a897" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={platformGrowthData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.3)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={chartView === 'users' ? (v) => `${(v/1000).toFixed(0)}K` : undefined}
                  />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)' }} />
                  <Line
                    type="monotone"
                    dataKey={chartView}
                    stroke="#17a897"
                    strokeWidth={3}
                    dot={{ fill: '#17a897', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

            {/* Recent activity */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-5">Live Activity</h3>
              <div className="space-y-4">
                {recentPlatformActivity.map((item) => {
                  const config = activityIconMap[item.type] || activityIconMap.company;
                  return (
                    <div key={item.id} className="flex items-start gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-700/50 last:pb-0 last:border-b-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${config.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">{item.event}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-tight truncate">{item.detail}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1">{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
        </div>

        {/* Top companies section */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-4">Performance</h2>
          {/* Top companies table */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/60 dark:border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Top Companies by Spend</h3>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              View all
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
                <tr key={co.name}>
                  <td>
                    <span className={`font-mono text-sm font-bold ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-300'}`}>
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
                  <td className="font-bold text-success-600 dark:text-success-400">${co.spend.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          </div>
        </div>

        {/* Platform health metrics */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-4">Health Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Test Fill Rate', value: '96.4%', sub: 'Tests reaching full tester count', color: 'success' },
              { label: 'Avg. Time to First Result', value: '18.2hrs', sub: 'From test launch to first tester submission', color: 'brand' },
              { label: 'Tester Satisfaction Score', value: '4.8 / 5.0', sub: 'Average company rating of testers', color: 'warning' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="card p-6">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{label}</p>
                <p className={`font-display text-3xl sm:text-4xl font-bold ${color === 'success' ? 'text-success-600 dark:text-success-400' : color === 'warning' ? 'text-warning-600 dark:text-warning-400' : 'text-brand-600 dark:text-brand-400'}`}>
                  {value}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}
