import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Briefcase, Edit, CheckCircle, Monitor } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import { Badge, StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAuth } from '../App';
import { useAppData } from '../context/DataContext';
import { testerStats } from '../data/mockData';

const fallbackSkills = ['Mobile Testing', 'Web Testing', 'API Testing', 'Fintech', 'E-Commerce', 'Accessibility'];
const fallbackDevices = ['iPhone 15 Pro (iOS 17)', 'Samsung Galaxy S24 (Android 14)', 'MacBook Pro M3', 'Windows 11 PC'];
const certifications = ['Nyvel Verified Tester', 'Fintech Testing Certified', 'Accessibility Specialist'];

export default function TesterProfile() {
  const { user } = useAuth();
  const { myApplications } = useAppData();
  const navigate = useNavigate();

  const skills = user?.skills?.length ? user.skills : fallbackSkills;
  const devices = user?.devices?.length ? [...user.devices, ...(user.osVersions || [])] : fallbackDevices;

  return (
    <PlatformLayout title="My Profile">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-slate-900 via-brand-900 to-slate-900" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-5 -mt-10 mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                {user?.name?.split(' ').map((n) => n[0]).join('') || 'MJ'}
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-display font-bold text-2xl text-slate-900">{user?.name}</h2>
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-amber-600">{user?.rating || '4.9'}</span>
                  </div>
                  <Badge label="Top Tester" color="violet" />
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} /> {user?.city ? `${user.city}, ${user.country}` : 'San Francisco, CA'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={13} /> {user?.occupation || 'Software Engineer'}
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

            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              {user?.bio ||
                'Experienced QA engineer and beta tester with 5+ years testing mobile and web applications across fintech, e-commerce, and healthcare. Passionate about finding edge cases and delivering detailed, actionable bug reports.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Stats */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Tests Completed', value: user?.testsCompleted || testerStats.completed, color: 'text-brand-600' },
                { label: 'Total Earned', value: `$${testerStats.totalEarned.toLocaleString()}`, color: 'text-emerald-600' },
                { label: 'Avg. Rating', value: `${user?.rating || '4.9'} / 5.0`, color: 'text-amber-600' },
                { label: 'Acceptance Rate', value: '94%', color: 'text-brand-600' },
                { label: 'Bugs Reported', value: '1,204', color: 'text-red-500' },
                { label: 'Member Since', value: 'Jan 2024', color: 'text-slate-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills & devices */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Testing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s} label={s} color="violet" />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Monitor size={16} className="text-slate-400" />
                Devices & Platforms
              </h3>
              <div className="space-y-2">
                {devices.map((d) => (
                  <div key={d} className="flex items-center gap-2.5 text-sm text-slate-600 py-1.5 border-b border-slate-50 last:border-0">
                    <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    {d}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {certifications.map((c) => (
                  <div key={c} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700">
                    <CheckCircle size={12} className="text-emerald-500" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent test history */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Test History</h3>
          </div>
          <div className="overflow-x-auto">
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
              {myApplications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <p className="font-medium text-slate-800">{app.testName}</p>
                    <p className="text-xs text-slate-400">{app.company}</p>
                  </td>
                  <td><StatusBadge status={app.status} /></td>
                  <td className="font-semibold text-emerald-600">${app.compensation}</td>
                  <td className="text-slate-500 text-xs">{app.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}
