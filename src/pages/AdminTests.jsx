import React, { useState, useMemo } from 'react';
import { Search, AlertCircle, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PlatformLayout from '../components/platform/PlatformLayout';
import { Badge } from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import SegmentedControl from '../components/ui/SegmentedControl';
import EmptyState from '../components/ui/EmptyState';
import TableScrollArea from '../components/ui/TableScrollArea';
import useDarkMode from '../hooks/useDarkMode';
import { SkeletonStats, SkeletonTable } from '../components/ui/Skeleton';
import { AdvancedFilters } from '../components/admin/AdvancedFilters';
import { BatchActionsBar, SelectAllCheckbox, RowCheckbox } from '../components/admin/BatchActions';
import { InlineEditCell } from '../components/admin/InlineEdit';
import { RealTimeRefresh, useAutoRefresh } from '../components/admin/RealTimeRefresh';
import { ConfirmationModal } from '../components/admin/ConfirmationModal';
import DetailDrawer from '../components/admin/DetailDrawer';
import Button from '../components/ui/Button';
import { ColumnVisibilityToggle, useColumnVisibility } from '../components/admin/ColumnVisibility';
import { HighlightedText, SearchCounter } from '../components/admin/SearchHighlight';
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
  const [detailTest, setDetailTest] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const { addToast } = useToast();
  const isDark = useDarkMode();

  // Theme-aware chart palette (Recharts can't read Tailwind `dark:` variants)
  const chart = {
    axis: isDark ? '#64748b' : '#94a3b8',
    grid: isDark ? '#1e293b' : '#f1f5f9',
    brand: isDark ? '#38c4b0' : '#17a897',
    error: isDark ? '#f87171' : '#ef4444',
  };
  const tooltipStyle = {
    borderRadius: '10px',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    fontSize: 12,
    background: isDark ? '#0f172a' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#0f172a',
  };

  const testColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Test Name' },
    { key: 'company', label: 'Company' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'progress', label: 'Progress' },
    { key: 'testers', label: 'Testers' },
    { key: 'issues', label: 'Issues' },
  ];
  const { visibleColumns, setVisibleColumns } = useColumnVisibility(testColumns, 'adminTestsColumns');
  const itemsPerPage = pageSize;

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
  }, [filteredTests, currentPage, itemsPerPage]);

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
          <div className="alert alert-error" role="alert">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-sm mt-1 opacity-90">Please try refreshing the page or contact support if the issue persists.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="animate-fade-up">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">All Tests</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Monitor and manage platform-wide testing campaigns</p>
        </div>

        {/* Stats */}
        {isLoading ? (
          <SkeletonStats columns={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: 'Active Tests', value: stats.active, sub: 'Currently running', color: 'text-cyan-600 dark:text-cyan-400' },
              { label: 'In Progress', value: stats.inProgress, sub: 'Awaiting completion', color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Completed', value: stats.completed, sub: 'Total finished', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Issues Reported', value: stats.totalIssues, sub: `${stats.totalCritical} critical`, color: 'text-error-600 dark:text-error-400' },
            ].map(({ label, value, sub, color }, i) => (
              <div key={label} className="card p-5 animate-fade-up" style={{ animationDelay: `${80 + i * 70}ms` }}>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                <p className={`font-display text-3xl font-bold ${color}`}>
                  <AnimatedCounter value={value} />
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5 animate-fade-up" style={{ animationDelay: '360ms' }}>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Tests by Completion %</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.12)' }} contentStyle={tooltipStyle} labelStyle={{ color: chart.axis }} />
                <Bar dataKey="count" fill={chart.brand} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5 animate-fade-up" style={{ animationDelay: '430ms' }}>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Issues by Severity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={issuesData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.12)' }} contentStyle={tooltipStyle} labelStyle={{ color: chart.axis }} />
                <Bar dataKey="count" fill={chart.error} radius={[5, 5, 0, 0]} />
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
              className="form-input pl-9 text-sm"
            />
            <SearchCounter
              searchTerm={searchTerm}
              matchCount={filteredTests.length}
              totalItems={validatedTests.length}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <SegmentedControl
              ariaLabel="Filter by test status"
              value={filterStatus}
              onChange={(v) => {
                setFilterStatus(v);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All' },
                { value: 'Active', label: 'Active' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Completed', label: 'Completed' },
              ]}
            />
            <AdvancedFilters
              onFilterChange={(filters) => {
                setAdvancedFilters(filters);
                setCurrentPage(1);
              }}
              filterOptions={{
                statuses: ['Active', 'In Progress', 'Completed'],
              }}
            />
            <ColumnVisibilityToggle
              columns={testColumns}
              visibleColumns={visibleColumns}
              onChange={setVisibleColumns}
              storageKey="adminTestsColumns"
            />
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-success-50/70 dark:bg-success-900/20 text-success-700 dark:text-success-300 border border-success-200/70 dark:border-success-800/50 hover:bg-success-100 dark:hover:bg-success-900/40 transition-all"
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

        {/* Row detail drawer */}
        <DetailDrawer
          open={detailTest !== null}
          onClose={() => setDetailTest(null)}
          title={safeProp(detailTest, 'name', 'Unknown Test')}
          subtitle={safeProp(detailTest, 'company', '')}
          fields={
            detailTest
              ? [
                  { label: 'Test ID', value: <span className="font-mono text-xs">{safeProp(detailTest, 'id', '—')}</span> },
                  { label: 'Type', value: <Badge label={safeProp(detailTest, 'type', 'Unknown')} color={getTypeColor(safeProp(detailTest, 'type'))} /> },
                  { label: 'Status', value: <span className={safeProp(detailTest, 'status') === 'Completed' ? 'badge badge-success' : 'badge badge-info'}>{safeProp(detailTest, 'status', 'Unknown')}</span> },
                  {
                    label: 'Progress',
                    value: (
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500" style={{ width: `${Math.min(Math.max(safeProp(detailTest, 'progress', 0), 0), 100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold">{safeProp(detailTest, 'progress', 0)}%</span>
                      </div>
                    ),
                  },
                  { label: 'Testers', value: `${safeProp(detailTest, 'testers', 0)} / ${safeProp(detailTest, 'target', 0)}` },
                  {
                    label: 'Issues',
                    value: (
                      <span>
                        {safeProp(detailTest, 'issues', 0)}
                        {safeProp(detailTest, 'critical', 0) > 0 && (
                          <span className="ml-2 text-xs font-bold text-error-600 dark:text-error-400">
                            {safeProp(detailTest, 'critical', 0)} critical
                          </span>
                        )}
                      </span>
                    ),
                  },
                  { label: 'Launched', value: safeProp(detailTest, 'launchDate', '—') },
                  { label: 'Due', value: safeProp(detailTest, 'dueDate', '—') },
                ]
              : []
          }
          footer={
            <Button variant="secondary" onClick={() => setDetailTest(null)}>
              Close
            </Button>
          }
        />

        {/* Tests Table */}
        {isLoading ? (
          <SkeletonTable rows={itemsPerPage} columns={9} />
        ) : (
          <div className="card overflow-hidden">
            <TableScrollArea>
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
                    {visibleColumns.includes('id') && <th>ID</th>}
                    {visibleColumns.includes('name') && (
                      <th className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-2">
                          Test Name
                          {sortBy === 'name' && <ArrowUpDown size={14} />}
                        </div>
                      </th>
                    )}
                    {visibleColumns.includes('company') && (
                      <th className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40" onClick={() => handleSort('company')}>
                        <div className="flex items-center gap-2">
                          Company
                          {sortBy === 'company' && <ArrowUpDown size={14} />}
                        </div>
                      </th>
                    )}
                    {visibleColumns.includes('type') && <th>Type</th>}
                    {visibleColumns.includes('status') && (
                      <th className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40" onClick={() => handleSort('status')}>
                        <div className="flex items-center gap-2">
                          Status
                          {sortBy === 'status' && <ArrowUpDown size={14} />}
                        </div>
                      </th>
                    )}
                    {visibleColumns.includes('progress') && <th>Progress</th>}
                    {visibleColumns.includes('testers') && <th>Testers</th>}
                    {visibleColumns.includes('issues') && <th>Issues</th>}
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
                        <tr
                          key={testId}
                          onClick={(e) => {
                            // Interactive controls (checkbox, inline edit) keep their own behavior
                            if (e.target.closest('button, input, select, a, [role="button"]')) return;
                            setDetailTest(test);
                          }}
                          className={`table-row-enter cursor-pointer ${selectedIds.has(testId) ? 'bg-brand-50/50 dark:bg-brand-900/20' : ''}`}
                        >
                          <td className="w-12">
                            <RowCheckbox
                              checked={selectedIds.has(testId)}
                              onToggle={() => handleSelectTest(testId)}
                            />
                          </td>
                          {visibleColumns.includes('id') && (
                            <td className="font-mono text-sm font-bold text-slate-600 dark:text-slate-400">
                              <HighlightedText text={testId} searchTerm={searchTerm} />
                            </td>
                          )}
                          {visibleColumns.includes('name') && (
                            <td>
                              <InlineEditCell
                                value={editedTests[testId]?.name || testName}
                                onSave={(value) => handleInlineEdit(testId, 'name', value)}
                                type="text"
                              />
                            </td>
                          )}
                          {visibleColumns.includes('company') && (
                            <td className="text-sm text-slate-600 dark:text-slate-400">
                              <HighlightedText text={company} searchTerm={searchTerm} />
                            </td>
                          )}
                          {visibleColumns.includes('type') && (
                            <td>
                              <Badge
                                label={type}
                                color={getTypeColor(type)}
                              />
                            </td>
                          )}
                          {visibleColumns.includes('status') && (
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
                          )}
                          {visibleColumns.includes('progress') && (
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-brand-500 transition-all"
                                    style={{ width: `${validProgress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-8">{validProgress}%</span>
                              </div>
                            </td>
                          )}
                          {visibleColumns.includes('testers') && (
                            <td className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {testers}/{target}
                            </td>
                          )}
                          {visibleColumns.includes('issues') && (
                            <td>
                              <div className="flex items-center gap-1">
                                {critical > 0 && (
                                  <>
                                    <AlertCircle size={14} className="text-error-500 dark:text-error-400" />
                                    <span className="text-xs font-bold text-error-600 dark:text-error-400">{critical}</span>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                  </>
                                )}
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{issues}</span>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={visibleColumns.length + 1}>
                        {validatedTests.length === 0 ? (
                          <EmptyState title="No tests available" />
                        ) : (
                          <EmptyState
                            icon={Search}
                            title="No tests found"
                            description="Nothing matches your current search and filters."
                            actionLabel="Clear Filters"
                            actionVariant="secondary"
                            onAction={() => {
                              setSearchTerm('');
                              setFilterStatus('all');
                              setAdvancedFilters({ dateFrom: '', dateTo: '', statuses: [] });
                            }}
                          />
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableScrollArea>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            storageKey="adminTestsPageSize"
          />
        )}

        {/* Footer */}
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <p>Showing {paginatedTests.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredTests.length)} of {filteredTests.length} tests</p>
        </div>
      </div>
    </PlatformLayout>
  );
}
