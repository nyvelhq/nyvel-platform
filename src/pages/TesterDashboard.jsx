import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, DollarSign, Clock, Star, ExternalLink, Filter, UserCheck, X, Search } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PlatformLayout from '../components/platform/PlatformLayout';
import StatCard from '../components/ui/StatCard';
import { StatusBadge, TypeBadge, Badge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAuth } from '../App';
import { useAppData } from '../context/DataContext';
import { testerStats, earningsData } from '../data/mockData';

export default function TesterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { availableTests, myApplications, applyToTest, hasApplied } = useAppData();
  const [activeTab, setActiveTab] = useState('available');
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const showOnboardingBanner = user?.profileComplete === false && !bannerDismissed;

  useEffect(() => {
    if (!filterOpen) return;
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [filterOpen]);

  const testTypes = ['all', ...new Set(availableTests.map((t) => t.type))];
  const filteredTests = typeFilter === 'all' ? availableTests : availableTests.filter((t) => t.type === typeFilter);

  const thisMonthEarned = earningsData[earningsData.length - 1]?.earned || 0;

  return (
    <PlatformLayout title="Tester Dashboard">
      <div className="p-6 space-y-6">
        {/* Onboarding banner */}
        {showOnboardingBanner && (
          <div className="flex items-center gap-4 bg-brand-50 border border-brand-200 rounded-xl px-5 py-4">
            <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <UserCheck size={18} className="text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-900">Complete your tester profile</p>
              <p className="text-xs text-brand-700 mt-0.5">
                Finish onboarding to unlock higher-paying tests matched to your devices and skills.
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/tester/onboarding')}>
              Complete Profile
            </Button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-brand-400 hover:text-brand-600 transition-colors p-1"
              aria-label="Dismiss banner"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Profile strip */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {user?.name?.split(' ').map((n) => n[0]).join('') || 'MJ'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 className="font-display font-bold text-white text-xl">{user?.name}</h2>
              <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-amber-400">{user?.rating}</span>
              </div>
              <Badge label="Top Tester" color="violet" />
            </div>
            <p className="text-slate-400 text-sm">{user?.email}</p>
          </div>
          <div className="flex gap-6 text-center flex-shrink-0">
            <div>
              <p className="text-2xl font-bold font-display text-white">{user?.testsCompleted}</p>
              <p className="text-xs text-slate-400 mt-0.5">Tests Done</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold font-display gradient-text">${testerStats.totalEarned.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total Earned</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Active Tests"
            value={testerStats.activeTests}
            icon={CheckCircle}
            iconColor="violet"
          />
          <StatCard
            label="Tests Completed"
            value={testerStats.completed}
            trend={testerStats.trends.completed}
            trendLabel=" this month"
            icon={Star}
            iconColor="cyan"
          />
          <StatCard
            label="Total Earned"
            value={`$${testerStats.totalEarned.toLocaleString()}`}
            trend={testerStats.trends.totalEarned}
            trendLabel=" this month"
            icon={DollarSign}
            iconColor="green"
          />
          <StatCard
            label="Pending Payout"
            value={`$${testerStats.pendingPayout}`}
            icon={Clock}
            iconColor="amber"
          />
        </div>

        {/* Tabs */}
        <div>
          <div className="flex gap-1 border-b border-slate-200 mb-5">
            {[
              { id: 'available', label: 'Available Tests' },
              { id: 'my', label: 'My Applications' },
              { id: 'earnings', label: 'Earnings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all
                  ${activeTab === tab.id
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Available tests */}
          {activeTab === 'available' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4 relative">
                <p className="text-sm text-slate-500">{filteredTests.length} tests matching your profile</p>
                <div className="relative" ref={filterRef}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Filter size={14} />}
                    onClick={() => setFilterOpen((o) => !o)}
                  >
                    Filter{typeFilter !== 'all' ? `: ${typeFilter}` : ''}
                  </Button>
                  {filterOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-10">
                      {testTypes.map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setTypeFilter(t);
                            setFilterOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm capitalize hover:bg-slate-50 ${typeFilter === t ? 'text-brand-600 font-semibold' : 'text-slate-600'}`}
                        >
                          {t === 'all' ? 'All types' : t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {filteredTests.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-100">
                  <EmptyState
                    icon={Search}
                    title="No matching tests right now"
                    description="New tests are posted daily. Complete your profile to improve your matches."
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTests.map((test, index) => (
                  <div
                    key={test.id}
                    onClick={() => navigate(`/tester/tests/${test.id}`)}
                    className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200 cursor-pointer group animate-slide-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm group-hover:text-brand-700 transition-colors">
                          {test.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{test.company}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-bold text-emerald-600">${test.compensation}</p>
                        <p className="text-[10px] text-slate-400">per test</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">{test.description}</p>

                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <TypeBadge type={test.type} />
                      {test.platforms.map((p) => (
                        <Badge key={p} label={p} color="slate" />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {test.duration}
                      </span>
                      <span>{test.slotsTotal - test.slots} / {test.slotsTotal} spots filled</span>
                      <span>Deadline: {test.deadline}</span>
                    </div>

                    {/* Slots bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                      <div
                        className="h-1.5 rounded-full bg-accent-500 transition-all"
                        style={{ width: `${test.slotsTotal ? ((test.slotsTotal - test.slots) / test.slotsTotal) * 100 : 0}%` }}
                      />
                    </div>

                    <Button
                      className="w-full"
                      size="sm"
                      variant={hasApplied(test.id) ? 'secondary' : 'outline'}
                      disabled={hasApplied(test.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        applyToTest(test);
                      }}
                    >
                      {hasApplied(test.id) ? 'Applied ✓' : 'Apply Now'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My applications */}
          {activeTab === 'my' && (
            <div className="animate-fade-in bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Compensation</th>
                    <th>Due</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {myApplications.map((app, index) => (
                    <tr key={app.id} className="animate-table-row-in" style={{ animationDelay: `${index * 75}ms` }}>
                      <td>
                        <div>
                          <p className="font-medium text-slate-800">{app.testName}</p>
                          <p className="text-xs text-slate-400">{app.company}</p>
                        </div>
                      </td>
                      <td><TypeBadge type={app.type} /></td>
                      <td><StatusBadge status={app.status} /></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-20">
                            <div
                              className={`h-1.5 rounded-full ${app.status === 'Completed' ? 'bg-emerald-500' : 'bg-brand-500'}`}
                              style={{ width: `${app.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-8 text-right">{app.progress}%</span>
                        </div>
                      </td>
                      <td className="font-semibold text-emerald-600">${app.compensation}</td>
                      <td className="text-slate-500 text-xs">{app.dueDate}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/tester/applications/${app.id}`)}
                          className="text-brand-500 hover:text-brand-700"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {/* Earnings chart */}
          {activeTab === 'earnings' && (
            <div className="animate-fade-in bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-1">Earnings History</h3>
              <p className="text-xs text-slate-500 mb-5">Last 6 months</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={earningsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [`$${v}`, 'Earned']}
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Bar dataKey="earned" fill="#17a897" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-5 grid grid-cols-3 gap-4 border-t border-slate-100 pt-5">
                <div className="text-center">
                  <p className="text-2xl font-bold font-display text-slate-900">${thisMonthEarned.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-0.5">This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-display gradient-text">${testerStats.totalEarned.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-0.5">All Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-display text-emerald-600">${testerStats.pendingPayout}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Pending Payout</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PlatformLayout>
  );
}
