import React, { useState, useMemo } from 'react';
import { Search, Star, AlertCircle, ArrowUpDown } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import { Badge } from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import { SkeletonStats, SkeletonTable } from '../components/ui/Skeleton';
import { AdvancedFilters } from '../components/admin/AdvancedFilters';
import { BatchActionsBar, SelectAllCheckbox, RowCheckbox } from '../components/admin/BatchActions';
import { InlineEditCell } from '../components/admin/InlineEdit';
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
  const { addToast } = useToast();
  const itemsPerPage = 10;

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
  }, [filteredUsers, currentPage]);

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
    addToast(`Deleted ${selectedIds.size} users`, 'success');
    setSelectedIds(new Set());
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
          <h2 className="font-display text-xl font-bold text-slate-900">Platform Users</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage companies and testers across the platform</p>
        </div>

        {/* Stats */}
        {isLoading ? (
          <SkeletonStats />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Total Companies</p>
              <p className="font-display text-3xl font-bold text-violet-600">{stats.companies}</p>
              <p className="text-xs text-slate-400 mt-1.5">Active accounts</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Total Testers</p>
              <p className="font-display text-3xl font-bold text-cyan-600">{stats.testers}</p>
              <p className="text-xs text-slate-400 mt-1.5">Verified testers</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Active Users</p>
              <p className="font-display text-3xl font-bold text-emerald-600">{stats.activeUsers}</p>
              <p className="text-xs text-slate-400 mt-1.5">Online in last 30 days</p>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setFilterType('all');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setFilterType('company');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'company'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => {
                setFilterType('tester');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'tester'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Testers
            </button>
            <AdvancedFilters
              onFilterChange={(filters) => {
                setAdvancedFilters(filters);
                setCurrentPage(1);
              }}
              filterOptions={{
                statuses: ['Active', 'Inactive'],
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
          />
        )}

        {/* Users Table */}
        {isLoading ? (
          <SkeletonTable rows={itemsPerPage} columns={7} />
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
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
                    <th className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2">
                        Name
                        {sortBy === 'name' && <ArrowUpDown size={14} />}
                      </div>
                    </th>
                    <th className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('type')}>
                      <div className="flex items-center gap-2">
                        Type
                        {sortBy === 'type' && <ArrowUpDown size={14} />}
                      </div>
                    </th>
                    <th className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('email')}>
                      <div className="flex items-center gap-2">
                        Email
                        {sortBy === 'email' && <ArrowUpDown size={14} />}
                      </div>
                    </th>
                    <th className="cursor-pointer hover:bg-slate-50" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-2">
                        Status
                        {sortBy === 'status' && <ArrowUpDown size={14} />}
                      </div>
                    </th>
                    <th>Joined</th>
                    <th>Activity</th>
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
                        <tr key={userId} className={selectedIds.has(userId) ? 'bg-blue-50' : ''}>
                          <td className="w-12">
                            <RowCheckbox
                              checked={selectedIds.has(userId)}
                              onToggle={() => handleSelectUser(userId)}
                            />
                          </td>
                          <td>
                            <InlineEditCell
                              value={editedUsers[userId]?.name || userName}
                              onSave={(value) => handleInlineEdit(userId, 'name', value)}
                              type="text"
                            />
                          </td>
                          <td>
                            <Badge
                              label={userType}
                              color={isCompany ? 'violet' : 'cyan'}
                            />
                          </td>
                          <td className="text-sm text-slate-600">{userEmail}</td>
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
                          <td className="text-sm text-slate-600">{userJoined}</td>
                          <td>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                              {isCompany ? (
                                <>
                                  <span>{safeProp(user, 'testsCreated', 0)} tests</span>
                                  <span className="text-slate-300">•</span>
                                  <span>{safeProp(user, 'testers', 0)} testers</span>
                                  {safeProp(user, 'plan') && (
                                    <>
                                      <span className="text-slate-300">•</span>
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
                                  <span className="text-slate-300">•</span>
                                  <span>{safeProp(user, 'testsCompleted', 0)} completed</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-emerald-600 font-semibold">
                                    {formatCurrency(safeProp(user, 'earnings', 0))}
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-500">
                        {validatedUsers.length === 0 ? 'No users available' : 'No users found matching your criteria'}
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
          <p>Showing {paginatedUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users</p>
        </div>
      </div>
    </PlatformLayout>
  );
}
