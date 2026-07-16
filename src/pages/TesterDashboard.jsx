import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, DollarSign, Clock, Star, ExternalLink, Filter, UserCheck, X, Search } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PlatformLayout from '../components/platform/PlatformLayout';
import StatCard from '../components/ui/StatCard';
import { StatusBadge, TypeBadge, Badge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAuth } from '../App';
import { useAppData } from '../context/DataContext';
import { spring } from '../motion/tokens';
import useDarkMode from '../hooks/useDarkMode';
import { testerStats, earningsData } from '../data/mockData';

export default function TesterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { availableTests, myApplications, applyToTest, hasApplied } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  // Sidebar links to "Available Tests" / "My Applications" / "Earnings"
  // point here with ?tab=... instead of to separate placeholder pages —
  // this tab state is the single source of truth those pages would
  // otherwise have duplicated. The URL is the source of truth: clicking
  // a sidebar link while already on this page doesn't remount the
  // component, so the tab has to react to searchParams changing, not
  // just read it once on mount.
  const validTabs = ['available', 'my', 'earnings'];
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState(validTabs.includes(tabParam) ? tabParam : 'available');

  useEffect(() => {
    setActiveTabState(validTabs.includes(tabParam) ? tabParam : 'available');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams(tab === 'available' ? {} : { tab }, { replace: true });
  };
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const showOnboardingBanner = user?.profileComplete === false && !bannerDismissed;
  const isDark = useDarkMode();

  // Theme-aware chart palette (Recharts can't read Tailwind `dark:` variants)
  const chart = {
    axis: isDark ? '#64748b' : '#94a3b8',
    grid: isDark ? '#1e293b' : '#f1f5f9',
    brand: isDark ? '#38c4b0' : '#17a897',
  };
  const tooltipStyle = {
    borderRadius: '10px',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    fontSize: 12,
    background: isDark ? '#0f172a' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#0f172a',
  };

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
          <div className="flex items-center gap-4 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/50 rounded-xl px-5 py-4">
            <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center flex-shrink-0">
              <UserCheck size={18} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">Complete your tester profile</p>
              <p className="text-xs text-brand-700 dark:text-brand-300 mt-0.5">
                Finish onboarding to unlock higher-paying tests matched to your devices and skills.
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/tester/onboarding')}>
              Complete Profile
            </Button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 transition-colors p-1"
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
            animate
            icon={CheckCircle}
            iconColor="violet"
          />
          <StatCard
            label="Tests Completed"
            value={testerStats.completed}
            animate
            trend={testerStats.trends.completed}
            trendLabel=" this month"
            icon={Star}
            iconColor="cyan"
          />
          <StatCard
            label="Total Earned"
            value={testerStats.totalEarned}
            animate
            format={(n) => `$${Math.round(n).toLocaleString()}`}
            trend={testerStats.trends.totalEarned}
            trendLabel=" this month"
            icon={DollarSign}
            iconColor="green"
          />
          <StatCard
            label="Pending Payout"
            value={testerStats.pendingPayout}
            animate
            format={(n) => `$${Math.round(n)}`}
            icon={Clock}
            iconColor="amber"
          />
        </div>

        {/* Tabs */}
        <div>
          <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700/60 mb-5">
            {[
              { id: 'available', label: 'Available Tests' },
              { id: 'my', label: 'My Applications' },
              { id: 'earnings', label: 'Earnings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  // Shared-element underline — springs between tabs
                  <motion.span
                    layoutId="tester-tab-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-500 dark:bg-brand-400"
                    transition={spring.snappy}
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Available tests */}
          {activeTab === 'available' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4 relative">
                <p className="text-sm text-slate-500 dark:text-slate-400">{filteredTests.length} tests matching your profile</p>
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
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-elevation-lg py-1 z-10">
                      {testTypes.map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setTypeFilter(t);
                            setFilterOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm capitalize hover:bg-slate-50 dark:hover:bg-slate-800 ${typeFilter === t ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
                        >
                          {t === 'all' ? 'All types' : t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {filteredTests.length === 0 && (
                <div className="card rounded-2xl">
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
                    className="card-interactive rounded-2xl p-5 hover:border-brand-200 dark:hover:border-brand-800/60 group animate-slide-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
                          {test.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{test.company}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${test.compensation}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">per test</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed line-clamp-2">{test.description}</p>

                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <TypeBadge type={test.type} />
                      {test.platforms.map((p) => (
                        <Badge key={p} label={p} color="slate" />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {test.duration}
                      </span>
                      <span>{test.slotsTotal - test.slots} / {test.slotsTotal} spots filled</span>
                      <span>Deadline: {test.deadline}</span>
                    </div>

                    {/* Slots bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-4">
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
            <div className="animate-fade-in card overflow-hidden">
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
                          <p className="font-medium text-slate-800 dark:text-slate-200">{app.testName}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{app.company}</p>
                        </div>
                      </td>
                      <td><TypeBadge type={app.type} /></td>
                      <td><StatusBadge status={app.status} /></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 w-20">
                            <div
                              className={`h-1.5 rounded-full ${app.status === 'Completed' ? 'bg-emerald-500' : 'bg-brand-500'}`}
                              style={{ width: `${app.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-right">{app.progress}%</span>
                        </div>
                      </td>
                      <td className="font-semibold text-emerald-600 dark:text-emerald-400">${app.compensation}</td>
                      <td className="text-slate-500 dark:text-slate-400 text-xs">{app.dueDate}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/tester/applications/${app.id}`)}
                          className="text-brand-500 hover:text-brand-700 dark:hover:text-brand-300"
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
            <div className="animate-fade-in card rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Earnings History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Last 6 months</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={earningsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [`$${v}`, 'Earned']}
                    contentStyle={tooltipStyle} labelStyle={{ color: chart.axis }}
                  />
                  <Bar dataKey="earned" fill={chart.brand} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-5 grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-700/50 pt-5">
                <div className="text-center">
                  <p className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">${thisMonthEarned.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-display gradient-text">${testerStats.totalEarned.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">All Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">${testerStats.pendingPayout}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pending Payout</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PlatformLayout>
  );
}
