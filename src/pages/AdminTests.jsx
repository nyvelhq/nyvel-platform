import React, { useState, useMemo } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PlatformLayout from '../components/platform/PlatformLayout';
import { Badge } from '../components/ui/Badge';
import { adminTests } from '../data/mockData';
import { validateTests, safeProp } from '../utils/validation';

const statusColors = {
  'Active': 'cyan',
  'In Progress': 'amber',
  'Completed': 'emerald',
  default: 'slate',
};

const typeColors = {
  'Bug Hunt': 'red',
  'Usability': 'violet',
  'Fintech': 'emerald',
  'Multi-Day': 'blue',
  'Global QA': 'purple',
  default: 'slate',
};

const getStatusColor = (status) => statusColors[status] || statusColors.default;
const getTypeColor = (type) => typeColors[type] || typeColors.default;

export default function AdminTests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);

  // Validate tests data
  const validatedTests = useMemo(() => {
    try {
      if (!Array.isArray(adminTests)) {
        throw new Error('Test data is not available');
      }
      return validateTests(adminTests);
    } catch (err) {
      setError('Failed to load test data. Please refresh the page.');
      console.error('Test data validation error:', err);
      return [];
    }
  }, []);

  const filteredTests = useMemo(() => {
    try {
      return validatedTests.filter(test => {
        const name = safeProp(test, 'name', '').toLowerCase();
        const company = safeProp(test, 'company', '').toLowerCase();
        const id = safeProp(test, 'id', '').toLowerCase();
        const status = safeProp(test, 'status', '');

        const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                             company.includes(searchTerm.toLowerCase()) ||
                             id.includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || status === filterStatus;
        return matchesSearch && matchesStatus;
      });
    } catch (err) {
      console.error('Filter error:', err);
      return [];
    }
  }, [validatedTests, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    try {
      return {
        active: validatedTests.filter(t => safeProp(t, 'status') === 'Active').length,
        completed: validatedTests.filter(t => safeProp(t, 'status') === 'Completed').length,
        inProgress: validatedTests.filter(t => safeProp(t, 'status') === 'In Progress').length,
        totalIssues: validatedTests.reduce((sum, t) => sum + (safeProp(t, 'issues', 0) || 0), 0),
        totalCritical: validatedTests.reduce((sum, t) => sum + (safeProp(t, 'critical', 0) || 0), 0),
      };
    } catch (err) {
      console.error('Stats calculation error:', err);
      return { active: 0, completed: 0, inProgress: 0, totalIssues: 0, totalCritical: 0 };
    }
  }, [validatedTests]);

  const progressData = [
    { name: '0-25%', count: 1 },
    { name: '25-50%', count: 2 },
    { name: '50-75%', count: 3 },
    { name: '75-100%', count: 4 },
  ];

  const issuesData = [
    { type: 'Critical', count: stats.totalCritical },
    { type: 'High', count: Math.floor(stats.totalIssues * 0.3) },
    { type: 'Medium', count: Math.floor(stats.totalIssues * 0.4) },
    { type: 'Low', count: Math.floor(stats.totalIssues * 0.3) },
  ];

  return (
    <PlatformLayout title="Tests">
      <div className="p-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">{error}</p>
              <p className="text-sm text-red-700 mt-1">Please try refreshing the page or contact support if the issue persists.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">All Tests</h2>
          <p className="text-sm text-slate-500 mt-0.5">Monitor and manage platform-wide testing campaigns</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Active Tests</p>
            <p className="font-display text-3xl font-bold text-cyan-600">{stats.active}</p>
            <p className="text-xs text-slate-400 mt-1.5">Currently running</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">In Progress</p>
            <p className="font-display text-3xl font-bold text-amber-600">{stats.inProgress}</p>
            <p className="text-xs text-slate-400 mt-1.5">Awaiting completion</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Completed</p>
            <p className="font-display text-3xl font-bold text-emerald-600">{stats.completed}</p>
            <p className="text-xs text-slate-400 mt-1.5">Total finished</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Issues Reported</p>
            <p className="font-display text-3xl font-bold text-red-600">{stats.totalIssues}</p>
            <p className="text-xs text-slate-400 mt-1.5">{stats.totalCritical} critical</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Tests by Completion %</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="count" fill="#17a897" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Issues by Severity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={issuesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="count" fill="#ef4444" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search tests by ID, name, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'Active', 'In Progress', 'Completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Tests Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Test Name</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Testers</th>
                  <th>Issues</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.length > 0 ? (
                  filteredTests.map((test) => {
                    const testId = safeProp(test, 'id', 'unknown');
                    const testName = safeProp(test, 'name', 'Unknown Test');
                    const company = safeProp(test, 'company', 'N/A');
                    const type = safeProp(test, 'type', 'Unknown');
                    const status = safeProp(test, 'status', 'Unknown');
                    const progress = safeProp(test, 'progress', 0);
                    const testers = safeProp(test, 'testers', 0);
                    const target = safeProp(test, 'target', 0);
                    const issues = safeProp(test, 'issues', 0);
                    const critical = safeProp(test, 'critical', 0);

                    // Validate progress is 0-100
                    const validProgress = Math.min(Math.max(progress, 0), 100);

                    return (
                      <tr key={testId}>
                        <td className="font-mono text-sm font-bold text-slate-600">{testId}</td>
                        <td className="font-medium text-slate-800">{testName}</td>
                        <td className="text-sm text-slate-600">{company}</td>
                        <td>
                          <Badge
                            label={type}
                            color={getTypeColor(type)}
                          />
                        </td>
                        <td>
                          <Badge
                            label={status}
                            color={getStatusColor(status)}
                          />
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-500 transition-all"
                                style={{ width: `${validProgress}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 w-8">{validProgress}%</span>
                          </div>
                        </td>
                        <td className="text-sm font-semibold text-slate-700">
                          {testers}/{target}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            {critical > 0 && (
                              <>
                                <AlertCircle size={14} className="text-red-500" />
                                <span className="text-xs font-bold text-red-600">{critical}</span>
                                <span className="text-slate-300">•</span>
                              </>
                            )}
                            <span className="text-xs font-semibold text-slate-600">{issues}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-500">
                      {validatedTests.length === 0 ? 'No tests available' : 'No tests found matching your criteria'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <p>Showing {filteredTests.length} of {adminTests.length} tests</p>
          <p>Last updated: 1 minute ago</p>
        </div>
      </div>
    </PlatformLayout>
  );
}
