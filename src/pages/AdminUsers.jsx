import React, { useState, useMemo } from 'react';
import { Search, Star, AlertCircle, ArrowUpDown } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import { Badge } from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import SegmentedControl from '../components/ui/SegmentedControl';
import EmptyState from '../components/ui/EmptyState';
import TableScrollArea from '../components/ui/TableScrollArea';
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
import { adminUsers } from '../data/mockData';
import { validateUsers, safeProp, formatCurrency } from '../utils/validation';
import { useToast } from '../context/ToastContext';

const planColors = {
  Enterprise: 'violet',
  Professional: 'cyan',
  Starter: 'slate',
  default: 'slate',
};

// Safely get plan color with fallback
const getPlanColor = (plan) => planColors[plan] || planColors.default;

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
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
  const [editedUsers, setEditedUsers] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null });
  const [detailUser, setDetailUser] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const { addToast } = useToast();

  const userColumns = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'joined', label: 'Joined' },
    { key: 'activity', label: 'Activity' },
  ];
  const { visibleColumns, setVisibleColumns } = useColumnVisibility(userColumns, 'adminUsersColumns');
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

  // Validate and filter users data
  const validatedUsers = useMemo(() => {
    try {
      if (!Array.isArray(adminUsers)) {
        throw new Error('User data is not available');
      }
      return validateUsers(adminUsers);
    } catch (err) {
      setError('Failed to load user data. Please refresh the page.');
      console.error('User data validation error:', err);
      return [];
    }
  }, []);

  const filteredUsers = useMemo(() => {
    try {
      let filtered = validatedUsers.filter(user => {
        const name = safeProp(user, 'name', '').toLowerCase();
        const email = safeProp(user, 'email', '').toLowerCase();
        const type = safeProp(user, 'type', '');
        const status = safeProp(user, 'status', '');
        const joined = safeProp(user, 'joined', '');

        const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                             email.includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || type.toLowerCase() === filterType.toLowerCase();

        // Advanced filters
        let matchesDateRange = true;
        if (advancedFilters.dateFrom || advancedFilters.dateTo) {
          const joinedDate = new Date(joined);
          if (advancedFilters.dateFrom && joinedDate < new Date(advancedFilters.dateFrom)) {
            matchesDateRange = false;
          }
          if (advancedFilters.dateTo && joinedDate > new Date(advancedFilters.dateTo)) {
            matchesDateRange = false;
          }
        }

        let matchesStatus = true;
        if (advancedFilters.statuses.length > 0) {
          matchesStatus = advancedFilters.statuses.includes(status);
        }

        return matchesSearch && matchesType && matchesDateRange && matchesStatus;
      });

      filtered.sort((a, b) => {
        let aVal, bVal;
        switch (sortBy) {
          case 'name':
            aVal = safeProp(a, 'name', '').toLowerCase();
            bVal = safeProp(b, 'name', '').toLowerCase();
            break;
          case 'email':
            aVal = safeProp(a, 'email', '').toLowerCase();
            bVal = safeProp(b, 'email', '').toLowerCase();
            break;
          case 'type':
            aVal = safeProp(a, 'type', '').toLowerCase();
            bVal = safeProp(b, 'type', '').toLowerCase();
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
  }, [validatedUsers, searchTerm, filterType, sortBy, sortOrder, advancedFilters]);

  const stats = useMemo(() => {
    try {
      return {
        companies: validatedUsers.filter(u => safeProp(u, 'type') === 'Company').length,
        testers: validatedUsers.filter(u => safeProp(u, 'type') === 'Tester').length,
        activeUsers: validatedUsers.filter(u => safeProp(u, 'status') === 'Active').length,
      };
    } catch (err) {
      console.error('Stats calculation error:', err);
      return { companies: 0, testers: 0, activeUsers: 0 };
    }
  }, [validatedUsers]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleSelectUser = (userId) => {
    const updated = new Set(selectedIds);
    if (updated.has(userId)) {
      updated.delete(userId);
    } else {
      updated.add(userId);
    }
    setSelectedIds(updated);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedUsers.length && paginatedUsers.length > 0) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(paginatedUsers.map(u => safeProp(u, 'id', 'unknown')));
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
      addToast(`Deleted ${selectedIds.size} users`, 'success');
      setSelectedIds(new Set());
      setConfirmModal({ isOpen: false, action: null });
    } catch (err) {
      addToast('Failed to delete users', 'error');
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
      addToast(`Updated status to ${confirmModal.status} for ${selectedIds.size} users`, 'success');
      setSelectedIds(new Set());
      setConfirmModal({ isOpen: false, action: null });
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleBatchExport = () => {
    if (selectedIds.size === 0) return;
    try {
      const selected = filteredUsers.filter(u => selectedIds.has(safeProp(u, 'id', 'unknown')));
      const csv = [
        ['Name', 'Type', 'Email', 'Status', 'Joined'].join(','),
        ...selected.map(user =>
          [
            safeProp(user, 'name', 'N/A'),
            safeProp(user, 'type', 'N/A'),
            safeProp(user, 'email', 'N/A'),
            safeProp(user, 'status', 'N/A'),
            safeProp(user, 'joined', 'N/A'),
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      addToast(`${selectedIds.size} users exported successfully`, 'success');
    } catch (err) {
      addToast('Failed to export users', 'error');
      console.error('Export error:', err);
    }
  };

  const handleInlineEdit = (userId, field, value) => {
    setEditedUsers(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }));
    addToast(`${field} updated`, 'success');
  };

  const handleExport = () => {
    try {
      const csv = [
        ['Name', 'Type', 'Email', 'Status', 'Joined'].join(','),
        ...filteredUsers.map(user =>
          [
            safeProp(user, 'name', 'N/A'),
            safeProp(user, 'type', 'N/A'),
            safeProp(user, 'email', 'N/A'),
            safeProp(user, 'status', 'N/A'),
            safeProp(user, 'joined', 'N/A'),
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      addToast('Users exported successfully', 'success');
    } catch (err) {
      addToast('Failed to export users', 'error');
      console.error('Export error:', err);
    }
  };

  return (
    <PlatformLayout title="Users">
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
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">Platform Users</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage companies and testers across the platform</p>
        </div>

        {/* Stats */}
        {isLoading ? (
          <SkeletonStats />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Companies', value: stats.companies, sub: 'Active accounts', color: 'text-violet-600 dark:text-violet-400' },
              { label: 'Total Testers', value: stats.testers, sub: 'Verified testers', color: 'text-cyan-600 dark:text-cyan-400' },
              { label: 'Active Users', value: stats.activeUsers, sub: 'Online in last 30 days', color: 'text-emerald-600 dark:text-emerald-400' },
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
            <Search size={16} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input pl-9 text-sm"
            />
            <SearchCounter
              searchTerm={searchTerm}
              matchCount={filteredUsers.length}
              totalItems={validatedUsers.length}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <SegmentedControl
              ariaLabel="Filter by user type"
              value={filterType}
              onChange={(v) => {
                setFilterType(v);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All' },
                { value: 'company', label: 'Companies' },
                { value: 'tester', label: 'Testers' },
              ]}
            />
            <AdvancedFilters
              onFilterChange={(filters) => {
                setAdvancedFilters(filters);
                setCurrentPage(1);
              }}
              filterOptions={{
                statuses: ['Active', 'Inactive'],
              }}
            />
            <ColumnVisibilityToggle
              columns={userColumns}
              visibleColumns={visibleColumns}
              onChange={setVisibleColumns}
              storageKey="adminUsersColumns"
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
            statusOptions={['Active', 'Inactive']}
          />
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={
            confirmModal.action === 'delete'
              ? 'Delete Users?'
              : 'Change User Status?'
          }
          message={
            confirmModal.action === 'delete'
              ? 'This action cannot be undone. All selected users will be permanently deleted.'
              : `All selected users will be marked as ${confirmModal.status}.`
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
          open={detailUser !== null}
          onClose={() => setDetailUser(null)}
          title={safeProp(detailUser, 'name', 'Unknown User')}
          subtitle={safeProp(detailUser, 'email', '')}
          avatar={
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {safeProp(detailUser, 'name', '?')[0]}
            </div>
          }
          fields={
            detailUser
              ? [
                  { label: 'Type', value: <Badge label={safeProp(detailUser, 'type', 'Unknown')} color={safeProp(detailUser, 'type') === 'Company' ? 'violet' : 'cyan'} /> },
                  { label: 'Status', value: <span className={safeProp(detailUser, 'status') === 'Active' ? 'badge badge-success' : 'badge badge-neutral'}>{safeProp(detailUser, 'status', 'Unknown')}</span> },
                  { label: 'User ID', value: <span className="font-mono text-xs">{safeProp(detailUser, 'id', '—')}</span> },
                  { label: 'Joined', value: safeProp(detailUser, 'joined', '—') },
                  ...(safeProp(detailUser, 'type') === 'Company'
                    ? [
                        { label: 'Plan', value: <Badge label={safeProp(detailUser, 'plan', 'Unknown')} color={getPlanColor(safeProp(detailUser, 'plan'))} /> },
                        { label: 'Tests Created', value: safeProp(detailUser, 'testsCreated', 0) },
                        { label: 'Testers Engaged', value: safeProp(detailUser, 'testers', 0) },
                      ]
                    : [
                        { label: 'Rating', value: `${(safeProp(detailUser, 'rating', 0)).toFixed(1)} / 5.0` },
                        { label: 'Tests Completed', value: safeProp(detailUser, 'testsCompleted', 0) },
                        { label: 'Total Earnings', value: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(safeProp(detailUser, 'earnings', 0))}</span> },
                      ]),
                ]
              : []
          }
          footer={
            <Button variant="secondary" onClick={() => setDetailUser(null)}>
              Close
            </Button>
          }
        />

        {/* Users Table */}
        {isLoading ? (
          <SkeletonTable rows={itemsPerPage} columns={7} />
        ) : (
          <div className="card overflow-hidden">
            <TableScrollArea>
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="w-12">
                      <SelectAllCheckbox
                        checked={selectedIds.size === paginatedUsers.length && paginatedUsers.length > 0}
                        indeterminate={selectedIds.size > 0 && selectedIds.size < paginatedUsers.length}
                        onToggle={handleSelectAll}
                      />
                    </th>
                    {visibleColumns.includes('name') && (
                      <th className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-2">
                          Name
                          {sortBy === 'name' && <ArrowUpDown size={14} />}
                        </div>
                      </th>
                    )}
                    {visibleColumns.includes('type') && (
                      <th className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40" onClick={() => handleSort('type')}>
                        <div className="flex items-center gap-2">
                          Type
                          {sortBy === 'type' && <ArrowUpDown size={14} />}
                        </div>
                      </th>
                    )}
                    {visibleColumns.includes('email') && (
                      <th className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40" onClick={() => handleSort('email')}>
                        <div className="flex items-center gap-2">
                          Email
                          {sortBy === 'email' && <ArrowUpDown size={14} />}
                        </div>
                      </th>
                    )}
                    {visibleColumns.includes('status') && (
                      <th className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40" onClick={() => handleSort('status')}>
                        <div className="flex items-center gap-2">
                          Status
                          {sortBy === 'status' && <ArrowUpDown size={14} />}
                        </div>
                      </th>
                    )}
                    {visibleColumns.includes('joined') && <th>Joined</th>}
                    {visibleColumns.includes('activity') && <th>Activity</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => {
                      const userId = safeProp(user, 'id', 'unknown');
                      const userName = safeProp(user, 'name', 'Unknown User');
                      const userEmail = safeProp(user, 'email', 'N/A');
                      const userType = safeProp(user, 'type', 'Unknown');
                      const userStatus = safeProp(user, 'status', 'Inactive');
                      const userJoined = safeProp(user, 'joined', 'N/A');
                      const isCompany = userType === 'Company';

                      return (
                        <tr
                          key={userId}
                          onClick={(e) => {
                            // Interactive controls (checkbox, inline edit, links) keep their own behavior
                            if (e.target.closest('button, input, select, a, [role="button"]')) return;
                            setDetailUser(user);
                          }}
                          className={`table-row-enter cursor-pointer ${selectedIds.has(userId) ? 'bg-brand-50/50 dark:bg-brand-900/20' : ''}`}
                        >
                          <td className="w-12">
                            <RowCheckbox
                              checked={selectedIds.has(userId)}
                              onToggle={() => handleSelectUser(userId)}
                            />
                          </td>
                          {visibleColumns.includes('name') && (
                            <td>
                              <InlineEditCell
                                value={editedUsers[userId]?.name || userName}
                                onSave={(value) => handleInlineEdit(userId, 'name', value)}
                                type="text"
                              />
                            </td>
                          )}
                          {visibleColumns.includes('type') && (
                            <td>
                              <Badge
                                label={userType}
                                color={isCompany ? 'violet' : 'cyan'}
                              />
                            </td>
                          )}
                          {visibleColumns.includes('email') && (
                            <td className="text-sm text-slate-600 dark:text-slate-400">
                              <HighlightedText text={userEmail} searchTerm={searchTerm} />
                            </td>
                          )}
                          {visibleColumns.includes('status') && (
                            <td>
                              <InlineEditCell
                                value={editedUsers[userId]?.status || userStatus}
                                onSave={(value) => handleInlineEdit(userId, 'status', value)}
                                type="select"
                                options={[
                                  { label: 'Active', value: 'Active' },
                                  { label: 'Inactive', value: 'Inactive' },
                                ]}
                              />
                            </td>
                          )}
                          {visibleColumns.includes('joined') && (
                            <td className="text-sm text-slate-600 dark:text-slate-400">{userJoined}</td>
                          )}
                          {visibleColumns.includes('activity') && (
                            <td>
                              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                                {isCompany ? (
                                  <>
                                    <span>{safeProp(user, 'testsCreated', 0)} tests</span>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                    <span>{safeProp(user, 'testers', 0)} testers</span>
                                    {safeProp(user, 'plan') && (
                                      <>
                                        <span className="text-slate-300 dark:text-slate-600">•</span>
                                        <Badge
                                          label={safeProp(user, 'plan', 'Unknown')}
                                          color={getPlanColor(safeProp(user, 'plan'))}
                                        />
                                      </>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <Star size={12} className="text-amber-500 fill-amber-500" />
                                      <span>{(safeProp(user, 'rating', 0)).toFixed(1)}</span>
                                    </div>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                    <span>{safeProp(user, 'testsCompleted', 0)} completed</span>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                      {formatCurrency(safeProp(user, 'earnings', 0))}
                                    </span>
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={visibleColumns.length + 1}>
                        {validatedUsers.length === 0 ? (
                          <EmptyState title="No users available" />
                        ) : (
                          <EmptyState
                            icon={Search}
                            title="No users found"
                            description="Nothing matches your current search and filters."
                            actionLabel="Clear Filters"
                            actionVariant="secondary"
                            onAction={() => {
                              setSearchTerm('');
                              setFilterType('all');
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
            storageKey="adminUsersPageSize"
          />
        )}

        {/* Footer */}
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <p>Showing {paginatedUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users</p>
        </div>
      </div>
    </PlatformLayout>
  );
}
