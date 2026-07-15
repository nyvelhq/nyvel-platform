import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PlatformLayout from '../components/platform/PlatformLayout';
import { adminReportsData } from '../data/mockData';

export default function AdminReports() {
  const [timeRange, setTimeRange] = useState('6months');

  const COLORS = ['#ef4444', '#a78bfa', '#fbbf24', '#94a3b8'];

  return (
    <PlatformLayout title="Reports">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">Analytics & Reports</h2>
            <p className="text-sm text-slate-500 mt-0.5">Platform performance and business metrics</p>
          </div>
          <div className="flex gap-2">
            {['7days', '30days', '6months', '1year'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {range === '7days' ? '7D' : range === '30days' ? '30D' : range === '6months' ? '6M' : '1Y'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Total Revenue</p>
            <p className="font-display text-3xl font-bold text-emerald-600">$284.9K</p>
            <p className="text-xs text-emerald-600 mt-1.5 font-semibold">↑ 8.4% vs last period</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Avg. Test Value</p>
            <p className="font-display text-3xl font-bold text-brand-600">$1,280</p>
            <p className="text-xs text-slate-400 mt-1.5">Per completed test</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Avg. Completion</p>
            <p className="font-display text-3xl font-bold text-cyan-600">91%</p>
            <p className="text-xs text-cyan-600 mt-1.5 font-semibold">↑ 9% vs last period</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Churn Rate</p>
            <p className="font-display text-3xl font-bold text-amber-600">2.3%</p>
            <p className="text-xs text-amber-600 mt-1.5 font-semibold">↓ 0.5% vs last period</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={adminReportsData.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#17a897" strokeWidth={2.5} dot={{ fill: '#17a897', r: 4 }} name="Actual" />
                <Line type="monotone" dataKey="target" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Test Completion Rate */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Test Completion Rate</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={adminReportsData.testCompletionRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`, 'Completion']} contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Line type="monotone" dataKey="completion" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Test Type Distribution */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Tests by Type</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={adminReportsData.testTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {adminReportsData.testTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Satisfaction Scores */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4">User Satisfaction Scores</h3>
            <div className="space-y-4">
              {adminReportsData.userSatisfaction.map((item) => (
                <div key={item.metric}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{item.metric}</span>
                    <span className="text-sm font-bold text-slate-900">{item.score}/5.0</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 transition-all"
                      style={{ width: `${(item.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Platform Reliability</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Uptime</span>
                  <span className="font-bold text-emerald-600">99.97%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Avg Response Time</span>
                  <span className="font-bold text-slate-900">245ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Error Rate</span>
                  <span className="font-bold text-emerald-600">0.03%</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">User Engagement</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">DAU</span>
                  <span className="font-bold text-slate-900">24,583</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">MAU</span>
                  <span className="font-bold text-slate-900">412,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Retention (30d)</span>
                  <span className="font-bold text-cyan-600">87%</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Quality Metrics</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Avg Test Quality</span>
                  <span className="font-bold text-slate-900">8.7/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Bug Detection Rate</span>
                  <span className="font-bold text-slate-900">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">False Positives</span>
                  <span className="font-bold text-emerald-600">2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}
