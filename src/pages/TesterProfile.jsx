import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Briefcase, Edit, CheckCircle, Monitor, Check, X } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import { Badge, StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import TableScrollArea from '../components/ui/TableScrollArea';
import { useAuth } from '../App';
import { useAppData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { testerStats } from '../data/mockData';

const fallbackSkills = ['Mobile Testing', 'Web Testing', 'API Testing', 'Fintech', 'E-Commerce', 'Accessibility'];
const fallbackDevices = ['iPhone 15 Pro (iOS 17)', 'Samsung Galaxy S24 (Android 14)', 'MacBook Pro M3', 'Windows 11 PC'];
const certifications = ['Nyvel Verified Tester', 'Fintech Testing Certified', 'Accessibility Specialist'];
const fallbackBio = 'Experienced QA engineer and beta tester with 5+ years testing mobile and web applications across fintech, e-commerce, and healthcare. Passionate about finding edge cases and delivering detailed, actionable bug reports.';

export default function TesterProfile() {
  const { user, updateUser } = useAuth();
  const { myApplications } = useAppData();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');

  const startEditingBio = () => {
    setBioDraft(user?.bio || fallbackBio);
    setIsEditingBio(true);
  };

  const saveBio = () => {
    updateUser({ bio: bioDraft });
    setIsEditingBio(false);
    addToast('Bio updated', 'success');
  };

  const skills = user?.skills?.length ? user.skills : fallbackSkills;
  const devices = user?.devices?.length ? [...user.devices, ...(user.osVersions || [])] : fallbackDevices;

  const stats = [
    { label: 'Tests Completed', value: user?.testsCompleted || testerStats.completed, color: 'text-brand-600 dark:text-brand-400' },
    { label: 'Total Earned', value: `$${testerStats.totalEarned.toLocaleString()}`, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Avg. Rating', value: `${user?.rating || '4.9'} / 5.0`, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Acceptance Rate', value: '94%', color: 'text-brand-600 dark:text-brand-400' },
    { label: 'Bugs Reported', value: '1,204', color: 'text-error-500 dark:text-error-400' },
    { label: 'Member Since', value: 'Jan 2024', color: 'text-slate-500 dark:text-slate-400' },
  ];

  return (
    <PlatformLayout title="My Profile">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Profile header */}
        <div className="card rounded-2xl overflow-hidden animate-fade-up">
          <div className="h-24 bg-gradient-to-r from-slate-900 via-brand-900 to-slate-900" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-5 -mt-10 mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-slate-900 shadow-elevation-lg">
                {user?.name?.split(' ').map((n) => n[0]).join('') || 'MJ'}
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-50">{user?.name}</h2>
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-2.5 py-1 rounded-full">
                    <Star size={13} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{user?.rating || '4.9'}</span>
                  </div>
                  <Badge label="Top Tester" color="violet" />
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} aria-hidden="true" /> {user?.city ? `${user.city}, ${user.country}` : 'San Francisco, CA'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={13} aria-hidden="true" /> {user?.occupation || 'Software Engineer'}
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
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
                  className="form-input text-sm resize-none"
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsEditingBio(false);
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" icon={<Check size={14} />} onClick={saveBio}>Save</Button>
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
                  {user?.bio || fallbackBio}
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
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s} label={s} color="violet" />
                ))}
              </div>
            </div>

            <div className="card rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Monitor size={16} className="text-slate-400 dark:text-slate-500" aria-hidden="true" />
                Devices &amp; Platforms
              </h3>
              <div className="space-y-2">
                {devices.map((d) => (
                  <div key={d} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <CheckCircle size={14} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" aria-hidden="true" />
                    {d}
                  </div>
                ))}
              </div>
            </div>

            <div className="card rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '260ms' }}>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {certifications.map((c) => (
                  <div key={c} className="flex items-center gap-1.5 px-3 py-1.5 bg-success-50/70 dark:bg-success-900/20 border border-success-200/70 dark:border-success-800/50 rounded-lg text-xs font-semibold text-success-700 dark:text-success-300">
                    <CheckCircle size={12} className="text-success-500 dark:text-success-400" aria-hidden="true" />
                    {c}
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
                      <p className="text-xs text-slate-400 dark:text-slate-500">{app.company}</p>
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                    <td className="font-semibold text-emerald-600 dark:text-emerald-400">${app.compensation}</td>
                    <td className="text-slate-500 dark:text-slate-400 text-xs">{app.dueDate}</td>
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
