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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">Platform Overview</h2>
            <p className="text-sm text-slate-500 mt-0.5">Real-time Nyvel platform health & metrics</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">All Systems Operational</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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

        {/* Trend indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(adminStats.trends).map(([key, val]) => {
            const labels = {
              totalUsers: 'User Growth',
              activeTests: 'Test Volume',
              monthlyRevenue: 'Revenue',
              uptime: 'Uptime Change',
            };
            const isPositive = val.startsWith('+');
            return (
              <div key={key} className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold border
                ${isPositive ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                <span className="text-xs font-medium text-slate-500">{labels[key]}</span>
                <span className="flex items-center gap-1">
                  {isPositive && <ArrowUpRight size={14} />}
                  {val}
                </span>
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Platform growth chart */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-900">Platform Growth</h3>
                <p className="text-xs text-slate-500 mt-0.5">Last 6 months</p>
              </div>
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                {['users', 'tests', 'revenue'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setChartView(v)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all
                      ${chartView === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              {chartView === 'revenue' ? (
                <BarChart data={platformGrowthData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                  <Tooltip
                    formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Bar dataKey="revenue" fill="#17a897" radius={[5, 5, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={platformGrowthData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={chartView === 'users' ? (v) => `${(v/1000).toFixed(0)}K` : undefined}
                  />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey={chartView}
                    stroke="#17a897"
                    strokeWidth={2.5}
                    dot={{ fill: '#17a897', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Live Activity</h3>
            <div className="space-y-3">
              {recentPlatformActivity.map((item) => {
                const config = activityIconMap[item.type] || activityIconMap.company;
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${config.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 leading-tight">{item.event}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-tight truncate">{item.detail}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top companies table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Top Companies by Spend</h3>
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
                      <span className="font-medium text-slate-800">{co.name}</span>
                    </div>
                  </td>
                  <td>
                    <Badge label={co.plan} color={planColors[co.plan]} />
                  </td>
                  <td className="font-semibold text-slate-700">{co.tests}</td>
                  <td className="font-bold text-emerald-600">${co.spend.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Platform health metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Test Fill Rate', value: '96.4%', sub: 'Tests reaching full tester count', color: 'emerald' },
            { label: 'Avg. Time to First Result', value: '18.2hrs', sub: 'From test launch to first tester submission', color: 'brand' },
            { label: 'Tester Satisfaction Score', value: '4.8 / 5.0', sub: 'Average company rating of testers', color: 'amber' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
              <p className={`font-display text-3xl font-bold ${color === 'emerald' ? 'text-emerald-600' : color === 'amber' ? 'text-amber-500' : 'text-brand-600'}`}>
                {value}
              </p>
              <p className="text-xs text-slate-400 mt-1.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </PlatformLayout>
  );
}
