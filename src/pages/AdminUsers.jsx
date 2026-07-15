import React, { useState, useMemo } from 'react';
import { Users, Search, Star, AlertCircle } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import { Badge } from '../components/ui/Badge';
import { adminUsers } from '../data/mockData';
import { validateUsers, safeProp, formatCurrency } from '../utils/validation';

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
      return validatedUsers.filter(user => {
        const name = safeProp(user, 'name', '').toLowerCase();
        const email = safeProp(user, 'email', '').toLowerCase();
        const type = safeProp(user, 'type', '');

        const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                             email.includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || type.toLowerCase() === filterType.toLowerCase();
        return matchesSearch && matchesType;
      });
    } catch (err) {
      console.error('Filter error:', err);
      return [];
    }
  }, [validatedUsers, searchTerm, filterType]);

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

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('company')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'company'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => setFilterType('tester')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'tester'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Testers
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const userId = safeProp(user, 'id', 'unknown');
                    const userName = safeProp(user, 'name', 'Unknown User');
                    const userEmail = safeProp(user, 'email', 'N/A');
                    const userType = safeProp(user, 'type', 'Unknown');
                    const userStatus = safeProp(user, 'status', 'Inactive');
                    const userJoined = safeProp(user, 'joined', 'N/A');
                    const isCompany = userType === 'Company';

                    return (
                      <tr key={userId}>
                        <td className="font-medium text-slate-800">{userName}</td>
                        <td>
                          <Badge
                            label={userType}
                            color={isCompany ? 'violet' : 'cyan'}
                          />
                        </td>
                        <td className="text-sm text-slate-600">{userEmail}</td>
                        <td>
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                            userStatus === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {userStatus}
                          </span>
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

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <p>Showing {filteredUsers.length} of {adminUsers.length} users</p>
          <p>Last updated: 2 minutes ago</p>
        </div>
      </div>
    </PlatformLayout>
  );
}
