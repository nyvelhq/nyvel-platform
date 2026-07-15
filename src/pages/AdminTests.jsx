import React, { useState, useMemo } from 'react';
import { Search, AlertCircle, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PlatformLayout from '../components/platform/PlatformLayout';
import { Badge } from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import { SkeletonStats, SkeletonTable } from '../components/ui/Skeleton';
import { AdvancedFilters } from '../components/admin/AdvancedFilters';
import { BatchActionsBar, SelectAllCheckbox, RowCheckbox } from '../components/admin/BatchActions';
import { InlineEditCell } from '../components/admin/InlineEdit';
import { RealTimeRefresh, useAutoRefresh } from '../components/admin/RealTimeRefresh';
import { ConfirmationModal } from '../components/admin/ConfirmationModal';
import { adminTests } from '../data/mockData';
import { validateTests, safeProp } from '../utils/validation';
import { useToast } from '../context/ToastContext';

const typeColors = {
  'Bug Hunt': 'red',
  'Usability': 'violet',
  'Fintech': 'emerald',
  'Multi-Day': 'blue',
  'Global QA': 'purple',
  default: 'slate',
};

const getTypeColor = (type) => typeColors[type] || typeColors.default;

export default function AdminTests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: '',
    dateTo: '',
    statuses: [],
  });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editedTests, setEditedTests] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null });
  const { addToast } = useToast();
  const itemsPerPage = 10;

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentPage(1);
      setSelectedIds(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  const refreshState = useAutoRefresh(handleRefresh, {
    autoRefreshEnabled: false,
    refreshInterval: 30000,
  });

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
      let filtered = validatedTests.filter(test => {
        const name = safeProp(test, 'name', '').toLowerCase();
        const company = safeProp(test, 'company', '').toLowerCase();
        const id = safeProp(test, 'id', '').toLowerCase();
        const status = safeProp(test, 'status', '');
        const dueDate = safeProp(test, 'dueDate', '');

        const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                             company.includes(searchTerm.toLowerCase()) ||
                             id.includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || status === filterStatus;

        // Advanced filters
        let matchesDateRange = true;
        if (advancedFilters.dateFrom || advancedFilters.dateTo) {
          const testDate = new Date(dueDate);
          if (advancedFilters.dateFrom && testDate < new Date(advancedFilters.dateFrom)) {
            matchesDateRange = false;
          }
          if (advancedFilters.dateTo && testDate > new Date(advancedFilters.dateTo)) {
            matchesDateRange = false;
          }
        }

        let matchesAdvancedStatus = true;
        if (advancedFilters.statuses.length > 0) {
          matchesAdvancedStatus = advancedFilters.statuses.includes(status);
        }

        return matchesSearch && matchesStatus && matchesDateRange && matchesAdvancedStatus;
      });

      filtered.sort((a, b) => {
        let aVal, bVal;
        switch (sortBy) {
          case 'name':
            aVal = safeProp(a, 'name', '').toLowerCase();
            bVal = safeProp(b, 'name', '').toLowerCase();
            break;
          case 'company':
            aVal = safeProp(a, 'company', '').toLowerCase();
            bVal = safeProp(b, 'company', '').toLowerCase();
            break;
          case 'status':
            aVal = safeProp(a, 'status', '').toLowerCase();
            bVal = safeProp(b, 'status', '').toLowerCase();
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      return filtered;
    } catch (err) {
      console.error('Filter error:', err);
      return [];
    }
  }, [validatedTests, searchTerm, filterStatus, sortBy, sortOrder, advancedFilters]);

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

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const paginatedTests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTests.slice(start, start + itemsPerPage);
  }, [filteredTests, currentPage]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleSelectTest = (testId) => {
    const updated = new Set(selectedIds);
    if (updated.has(testId)) {
      updated.delete(testId);
    } else {
      updated.add(testId);
    }
    setSelectedIds(updated);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedTests.length && paginatedTests.length > 0) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(paginatedTests.map(t => safeProp(t, 'id', 'unknown')));
      setSelectedIds(allIds);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmModal({
      isOpen: true,
      action: 'delete',
    });
  };

  const confirmBatchDelete = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      addToast(`Deleted ${selectedIds.size} tests`, 'success');
      setSelectedIds(new Set());
      setConfirmModal({ isOpen: false, action: null });
    } catch (err) {
      addToast('Failed to delete tests', 'error');
    }
  };

  const handleBatchStatusChange = (status) => {
    if (selectedIds.size === 0) return;
    setConfirmModal({
      isOpen: true,
      action: 'status',
      status,
    });
  };

  const confirmBatchStatusChange = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      addToast(`Updated status to ${confirmModal.status} for ${selectedIds.size} tests`, 'success');
      setSelectedIds(new Set());
      setConfirmModal({ isOpen: false, action: null });
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleBatchExport = () => {
    if (selectedIds.size === 0) return;
    try {
      const selected = filteredTests.filter(t => selectedIds.has(safeProp(t, 'id', 'unknown')));
      const csv = [
        ['ID', 'Test Name', 'Company', 'Type', 'Status', 'Progress'].join(','),
        ...selected.map(test =>
          [
            safeProp(test, 'id', 'N/A'),
            safeProp(test, 'name', 'N/A'),
            safeProp(test, 'company', 'N/A'),
            safeProp(test, 'type', 'N/A'),
            safeProp(test, 'status', 'N/A'),
            `${safeProp(test, 'progress', 0)}%`,
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tests-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      addToast(`${selectedIds.size} tests exported successfully`, 'success');
    } catch (err) {
      addToast('Failed to export tests', 'error');
      console.error('Export error:', err);
    }
  };

  const handleInlineEdit = (testId, field, value) => {
    setEditedTests(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [field]: value,
      },
    }));
    addToast(`${field} updated`, 'success');
  };

  const handleExport = () => {
    try {
      const csv = [
        ['ID', 'Test Name', 'Company', 'Type', 'Status', 'Progress'].join(','),
        ...filteredTests.map(test =>
          [
            safeProp(test, 'id', 'N/A'),
            safeProp(test, 'name', 'N/A'),
            safeProp(test, 'company', 'N/A'),
            safeProp(test, 'type', 'N/A'),
            safeProp(test, 'status', 'N/A'),
            `${safeProp(test, 'progress', 0)}%`,
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tests-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      addToast('Tests exported successfully', 'success');
    } catch (err) {
      addToast('Failed to export tests', 'error');
      console.error('Export error:', err);
    }
  };

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
        {isLoading ? (
          <SkeletonStats columns={4} />
        ) : (
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
        )}

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

        {/* Real-time Refresh */}
        <RealTimeRefresh
          isEnabled={refreshState.isEnabled}
          onToggle={refreshState.onToggle}
          lastUpdated={refreshState.lastUpdated}
          onRefresh={refreshState.onRefresh}
          isLoading={isLoading || refreshState.isLoading}
        />

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search tests by ID, name, or company..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Active', 'In Progress', 'Completed'].map(status => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
            <AdvancedFilters
              onFilterChange={(filters) => {
                setAdvancedFilters(filters);
                setCurrentPage(1);
              }}
              filterOptions={{
                statuses: ['Active', 'In Progress', 'Completed'],
              }}
            />
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all"
            >
              Export
            </button>
          </div>
        </div>

        {/* Batch Actions Bar */}
        {!isLoading && (
          <BatchActionsBar
            selectedCount={selectedIds.size}
            onClearSelection={() => setSelectedIds(new Set())}
            onDelete={handleBatchDelete}
            onExport={handleBatchExport}
            onStatusChange={handleBatchStatusChange}
            statusOptions={['Active', 'In Progress', 'Completed']}
          />
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={
            confirmModal.action === 'delete'
              ? 'Delete Tests?'
              : 'Change Test Status?'
          }
          message={
            confirmModal.action === 'delete'
              ? 'This action cannot be undone. All selected tests will be permanently deleted.'
              : `All selected tests will be marked as ${confirmModal.status}.`
          }
          confirmText={confirmModal.action === 'delete' ? 'Delete' : 'Update'}
          onConfirm={
            confirmModal.action === 'delete'
              ? confirmBatchDelete
              : confirmBatchStatusChange
          }
          onCancel={() => setConfirmModal({ isOpen: false, action: null })}
          isDangerous={confirmModal.action === 'delete'}
          itemCount={selectedIds.size}
        />

        {/* Tests Table */}
        {isLoading ? (
          <SkeletonTable rows={itemsPerPage} columns={9} />
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="w-12">
                      <SelectAllCheckbox
                        checked={selectedIds.size === paginatedTests.length && paginatedTests.length > 0}
                        indeterminate={selectedIds.size > 0 && selectedIds.size < paginatedTests.length}
                        onToggle={handleSelectAll}
                      />
                    </th>
                    <th>ID</th>
                    <th className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2">
                        Test Name
                        {sortBy === 'name' && <ArrowUpDown size={14} />}
                      </div>
                    </th>
                    <th className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('company')}>
                      <div className="flex items-center gap-2">
                        Company
                        {sortBy === 'company' && <ArrowUpDown size={14} />}
                      </div>
                    </th>
                    <th>Type</th>
                    <th className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-2">
                        Status
                        {sortBy === 'status' && <ArrowUpDown size={14} />}
                      </div>
                    </th>
                    <th>Progress</th>
                    <th>Testers</th>
                    <th>Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTests.length > 0 ? (
                    paginatedTests.map((test) => {
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
                        <tr key={testId} className={selectedIds.has(testId) ? 'bg-blue-50' : ''}>
                          <td className="w-12">
                            <RowCheckbox
                              checked={selectedIds.has(testId)}
                              onToggle={() => handleSelectTest(testId)}
                            />
                          </td>
                          <td className="font-mono text-sm font-bold text-slate-600">{testId}</td>
                          <td>
                            <InlineEditCell
                              value={editedTests[testId]?.name || testName}
                              onSave={(value) => handleInlineEdit(testId, 'name', value)}
                              type="text"
                            />
                          </td>
                          <td className="text-sm text-slate-600">{company}</td>
                          <td>
                            <Badge
                              label={type}
                              color={getTypeColor(type)}
                            />
                          </td>
                          <td>
                            <InlineEditCell
                              value={editedTests[testId]?.status || status}
                              onSave={(value) => handleInlineEdit(testId, 'status', value)}
                              type="select"
                              options={[
                                { label: 'Active', value: 'Active' },
                                { label: 'In Progress', value: 'In Progress' },
                                { label: 'Completed', value: 'Completed' },
                              ]}
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Footer */}
        <div className="text-sm text-slate-600">
          <p>Showing {paginatedTests.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredTests.length)} of {filteredTests.length} tests</p>
        </div>
      </div>
    </PlatformLayout>
  );
}
