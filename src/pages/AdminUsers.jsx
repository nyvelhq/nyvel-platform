import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Users, UserRound, Building2, AlertTriangle } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import { Badge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import SegmentedControl from '../components/ui/SegmentedControl';
import StatCard from '../components/ui/StatCard';
import TableScrollArea from '../components/ui/TableScrollArea';
import DetailDrawer from '../components/admin/DetailDrawer';
import { supabase } from '../lib/supabaseClient';
import { deriveUserRows, matchesSearch } from '../utils/adminDirectory';

const ROLE_BADGE = {
  admin: { label: 'Admin', color: 'error' },
  company: { label: 'Company', color: 'brand' },
  tester: { label: 'Tester', color: 'slate' },
};

const ROLE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'tester', label: 'Testers' },
  { value: 'company', label: 'Companies' },
  { value: 'admin', label: 'Admins' },
];

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/**
 * AdminUsers — ADM-01. Read-only directory of every account, built from
 * profiles, tester_profiles, applications, findings, payouts and tests.
 * Roles and companies are still changed in Supabase (see the note on the
 * page); there are no bulk actions until they do something real.
 */
export default function AdminUsers() {
  const [raw, setRaw] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [role, setRole] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoadError('');
    const results = await Promise.all([
      supabase.from('profiles').select('id, name, email, role, client_id, created_at, clients(company_name)'),
      supabase.from('tester_profiles').select('user_id, country, skills, completed_at'),
      supabase.from('applications').select('tester_id, status'),
      supabase.from('findings').select('tester_id, status'),
      supabase.from('payouts').select('tester_id, amount, status'),
      supabase.from('tests').select('client_id'),
    ]);
    const [profiles, testerProfiles, applications, findings, payouts, tests] = results;
    if (profiles.error) {
      console.error('AdminUsers load:', profiles.error.message);
      setLoadError(profiles.error.message || 'Could not load users.');
      setRaw({});
      return;
    }
    results.slice(1).forEach((r) => r.error && console.error('AdminUsers load (secondary):', r.error.message));
    setRaw({
      profiles: profiles.data || [],
      testerProfiles: testerProfiles.data || [],
      applications: applications.data || [],
      findings: findings.data || [],
      payouts: payouts.data || [],
      tests: tests.data || [],
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => (raw ? deriveUserRows(raw) : []), [raw]);
  const counts = useMemo(
    () => ({
      tester: rows.filter((r) => r.role === 'tester').length,
      company: rows.filter((r) => r.role === 'company').length,
      admin: rows.filter((r) => r.role === 'admin').length,
      companies: new Set(rows.filter((r) => r.clientId).map((r) => r.clientId)).size,
    }),
    [rows]
  );
  const visible = rows.filter(
    (r) => (role === 'all' || r.role === role) && matchesSearch(r, query, ['name', 'email', 'company', 'country'])
  );

  const loading = raw === null;

  return (
    <PlatformLayout title="Users">
      <div className="p-2 sm:p-8 space-y-6 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Testers" value={counts.tester} icon={UserRound} iconColor="brand"
            trendCaption={`${rows.filter((r) => r.role === 'tester' && r.profileComplete).length} with a complete profile`} />
          <StatCard label="Company users" value={counts.company} icon={Building2} iconColor="accent"
            trendCaption={`${counts.companies} ${counts.companies === 1 ? 'company' : 'companies'}`} />
          <StatCard label="Admins" value={counts.admin} icon={Users} iconColor="success" />
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Read-only for now. To add someone, invite them from Supabase Auth; to change a role or company, edit their
          row in the <code className="text-xs">profiles</code> table.
        </p>

        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="max-w-full overflow-x-auto"><SegmentedControl ariaLabel="Filter by role" size="sm" value={role} onChange={setRole} options={ROLE_FILTERS} /></div>
            <div className="relative sm:w-72">
              <Search size={16} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
              <label htmlFor="user-search" className="sr-only">Search users</label>
              <input
                id="user-search"
                type="search"
                className="form-input pl-9"
                placeholder="Name, email, company or country"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">Loading users…</div>
          ) : loadError ? (
            <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-3" role="alert">
              <AlertTriangle size={18} className="text-error-500 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">Couldn&apos;t load users: {loadError}</p>
              <Button size="sm" variant="secondary" onClick={load}>Retry</Button>
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={Users}
              title={rows.length ? 'No users match' : 'No users yet'}
              description={rows.length ? 'Try another search or role.' : 'Accounts appear here once people are invited.'}
            />
          ) : (
            <TableScrollArea>
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Company / country</th>
                    <th>Activity</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => {
                    const badge = ROLE_BADGE[r.role] || ROLE_BADGE.tester;
                    return (
                      <tr key={r.id}>
                        <td>
                          <button
                            type="button"
                            onClick={() => setSelected(r)}
                            className="text-left font-medium text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400"
                          >
                            {r.name || 'Unnamed user'}
                          </button>
                          <div className="text-xs text-slate-500 dark:text-slate-400 break-all">{r.email}</div>
                        </td>
                        <td data-label="Role"><Badge label={badge.label} color={badge.color} /></td>
                        <td data-label={r.role === 'tester' ? 'Country' : 'Company'} className="text-sm text-slate-600 dark:text-slate-400">
                          {(r.role === 'tester' ? r.country : r.company) || '—'}
                        </td>
                        <td data-label="Activity" className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {r.role === 'tester'
                            ? `${r.applications} applied · ${r.acceptedFindings} accepted finding${r.acceptedFindings === 1 ? '' : 's'}`
                            : r.role === 'company'
                              ? `${r.companyTests} test${r.companyTests === 1 ? '' : 's'}`
                              : '—'}
                        </td>
                        <td data-label="Joined" className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(r.joined)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableScrollArea>
          )}
        </div>
      </div>

      <DetailDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name || 'Unnamed user'}
        subtitle={selected?.email}
        fields={
          selected
            ? [
                { label: 'Role', value: (ROLE_BADGE[selected.role] || ROLE_BADGE.tester).label },
                { label: 'Joined', value: formatDate(selected.joined) },
                ...(selected.role === 'tester'
                  ? [
                      { label: 'Profile', value: selected.profileComplete ? 'Complete' : 'Not finished' },
                      { label: 'Country', value: selected.country || '—' },
                      { label: 'Skills', value: selected.skills.length ? selected.skills.join(', ') : '—' },
                      { label: 'Applications', value: `${selected.applications} (${selected.acceptedApplications} accepted)` },
                      { label: 'Accepted findings', value: selected.acceptedFindings },
                      { label: 'Paid out', value: `$${selected.paid.toLocaleString()}` },
                    ]
                  : []),
                ...(selected.role === 'company'
                  ? [
                      { label: 'Company', value: selected.company || 'No company assigned' },
                      { label: 'Tests', value: selected.companyTests },
                    ]
                  : []),
              ]
            : []
        }
      />
    </PlatformLayout>
  );
}
