import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Edit, CheckCircle, Monitor, Check, X } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import { Badge, StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import TableScrollArea from '../components/ui/TableScrollArea';
import { useAuth } from '../App';
import { useAppData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { deriveTesterEarnings } from '../utils/dashboardStats';

export default function TesterProfile() {
  const { user, updateUser } = useAuth();
  const { myApplications, myPayouts, myAcceptedFindingTestIds } = useAppData();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');

  const startEditingBio = () => {
    setBioDraft(user?.bio || '');
    setIsEditingBio(true);
  };

  const [savingBio, setSavingBio] = useState(false);
  const saveBio = async () => {
    setSavingBio(true);
    const { error } = await updateUser({ bio: bioDraft });
    setSavingBio(false);
    if (error) {
      addToast(`Couldn't save your bio: ${error.message || 'please try again.'}`, 'error');
      return;
    }
    setIsEditingBio(false);
    addToast('Bio updated', 'success');
  };

  const skills = user?.skills || [];
  const devices = [...(user?.devices || []), ...(user?.osVersions || [])];
  const earnings = deriveTesterEarnings({
    applications: myApplications,
    payouts: myPayouts,
    acceptedFindingTestIds: myAcceptedFindingTestIds,
  });
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : '—';

  const stats = [
    { label: 'Applications', value: myApplications.length, color: 'text-slate-700 dark:text-slate-300' },
    { label: 'Tests Completed', value: earnings.completedTests, color: 'text-brand-600 dark:text-brand-400' },
    { label: 'Findings Accepted', value: earnings.acceptedFindings, color: 'text-brand-600 dark:text-brand-400' },
    { label: 'Total Earned', value: `$${earnings.totalEarned.toLocaleString()}`, color: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Member Since', value: memberSince, color: 'text-slate-500 dark:text-slate-400' },
  ];
  const emptyNote = (text) => (
    <p className="text-sm text-slate-500 dark:text-slate-400">
      {text}{' '}
      <button onClick={() => navigate('/tester/onboarding')} className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
        Complete your profile
      </button>
    </p>
  );

  return (
    <PlatformLayout title="My Profile">
      <div className="p-2 sm:p-6 max-w-4xl mx-auto space-y-6">
        {/* Profile header */}
        <div className="card rounded-2xl overflow-hidden animate-fade-up">
          <div className="h-24 bg-gradient-to-r from-slate-900 via-brand-900 to-slate-900" />
          <div className="px-6 pb-6">
            <div className="flex flex-wrap items-start gap-5 -mt-10 mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-slate-900 shadow-elevation-lg">
                {user?.name?.split(' ').map((n) => n[0]).join('') || '?'}
              </div>
              <div className="flex-1 min-w-0 pt-12">
                <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-50">{user?.name}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                  <span>{user?.email}</span>
                  {(user?.city || user?.country) && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} aria-hidden="true" /> {[user.city, user.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {user?.occupation && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={13} aria-hidden="true" /> {user.occupation}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="sm:mt-12"
                icon={<Edit size={14} />}
                onClick={() => navigate('/tester/onboarding')}
              >
                Edit Profile
              </Button>
            </div>

            {isEditingBio ? (
              <div className="max-w-2xl space-y-2">
                <textarea
                  autoFocus
                  rows={3}
                  maxLength={2000}
                  aria-label="Bio"
                  className="form-input text-sm resize-none"
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsEditingBio(false);
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" icon={<Check size={14} />} onClick={saveBio} loading={savingBio}>Save</Button>
                  <Button size="sm" variant="secondary" icon={<X size={14} />} onClick={() => setIsEditingBio(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={startEditingBio}
                onKeyDown={(e) => { if (e.key === 'Enter') startEditingBio(); }}
                className="group flex items-start gap-2 max-w-2xl cursor-pointer rounded-lg -mx-2 px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  {user?.bio || 'Add a short bio so companies know your testing background.'}
                </p>
                <Edit size={13} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors mt-1 flex-shrink-0" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Stats */}
          <div className="card rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '80ms' }}>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Stats</h3>
            <div className="space-y-3">
              {stats.map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                  <span className="text-slate-500 dark:text-slate-400">{label}</span>
                  <span className={`font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills & devices */}
          <div className="md:col-span-2 space-y-5">
            <div className="card rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '140ms' }}>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Testing Skills</h3>
              {skills.length ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <Badge key={s} label={s} color="violet" />
                  ))}
                </div>
              ) : emptyNote('No skills added yet.')}
            </div>

            <div className="card rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Monitor size={16} className="text-slate-500 dark:text-slate-400" aria-hidden="true" />
                Devices &amp; Platforms
              </h3>
              {!devices.length && emptyNote('No devices added yet.')}
              <div className="space-y-2">
                {devices.map((d) => (
                  <div key={d} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <CheckCircle size={14} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" aria-hidden="true" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent test history */}
        <div className="card overflow-hidden animate-fade-up" style={{ animationDelay: '320ms' }}>
          <div className="px-5 py-4 border-b border-slate-200/70 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Test History</h3>
          </div>
          <TableScrollArea>
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Status</th>
                  <th>Compensation</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {myApplications.map((app, i) => (
                  <tr key={app.id} className="table-row-enter" style={{ animationDelay: `${i * 60}ms` }}>
                    <td>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{app.testName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{app.company}</p>
                    </td>
                    <td data-label="Status"><StatusBadge status={app.status} /></td>
                    <td data-label="Pay" className="font-semibold text-emerald-700 dark:text-emerald-400">${app.compensation}</td>
                    <td data-label="Due" className="text-slate-500 dark:text-slate-400 text-xs">{app.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScrollArea>
        </div>
      </div>
    </PlatformLayout>
  );
}
