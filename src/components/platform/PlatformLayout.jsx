import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FlaskConical, Users, BarChart3, Settings,
  Bell, ChevronDown, LogOut, Menu, Plus, Search, Briefcase,
  User, Shield, CheckCircle, DollarSign, X
} from 'lucide-react';
import NyvelMark from '../ui/NyvelMark';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../App';
import { useEdgeSwipe } from '../../hooks/useGestures';

const companyNav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/company/dashboard' },
  { label: 'My Tests', icon: FlaskConical, href: '/company/tests' },
  { label: 'Create Test', icon: Plus, href: '/company/create-test' },
  { label: 'Testers', icon: Users, href: '/company/testers' },
  { label: 'Reports', icon: BarChart3, href: '/company/reports' },
  { label: 'Settings', icon: Settings, href: '/company/settings' },
];

const testerNav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/tester/dashboard' },
  { label: 'Available Tests', icon: Search, href: '/tester/tests' },
  { label: 'My Applications', icon: CheckCircle, href: '/tester/applications' },
  { label: 'Earnings', icon: DollarSign, href: '/tester/earnings' },
  { label: 'My Profile', icon: User, href: '/tester/profile' },
  { label: 'Settings', icon: Settings, href: '/tester/settings' },
];

const adminNav = [
  { label: 'Overview', icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Tests', icon: FlaskConical, href: '/admin/tests' },
  { label: 'Reports', icon: BarChart3, href: '/admin/reports' },
  { label: 'Security', icon: Shield, href: '/admin/security' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

const navByRole = { company: companyNav, tester: testerNav, admin: adminNav };

const demoNotifications = [
  { id: 1, text: 'New tester applied to your active test', time: '5 min ago' },
  { id: 2, text: 'A critical issue was reported', time: '1 hr ago' },
  { id: 3, text: 'A payout was processed', time: '3 hr ago' },
];

const roleConfig = {
  company: { label: 'Company', icon: Briefcase, color: 'text-brand-400', bg: 'bg-brand-600/20' },
  tester: { label: 'Tester', icon: User, color: 'text-accent-400', bg: 'bg-accent-600/20' },
  admin: { label: 'Admin', icon: Shield, color: 'text-warning-400', bg: 'bg-warning-600/20' },
};

/**
 * Sidebar — semantic navigation component
 */
function Sidebar({ isOpen, onClose, isMobile = false }) {
  const { user, logout, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const nav = navByRole[user?.role] || companyNav;
  const rc = roleConfig[user?.role] || roleConfig.company;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const switchRole = (role) => {
    login(role);
    const destinations = { company: '/company/dashboard', tester: '/tester/dashboard', admin: '/admin/dashboard' };
    navigate(destinations[role]);
    onClose();
  };

  return (
    <aside className="flex flex-col h-full bg-slate-950 dark:bg-slate-900 border-r border-slate-700/50 dark:border-slate-800 w-64 flex-shrink-0">
      {/* Logo section */}
      <div className="flex items-center justify-between gap-2.5 px-5 h-16 border-b border-slate-800 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <NyvelMark size={28} className="rounded-lg" />
          <span className="font-display font-bold text-white text-base tracking-tight">
            Ny<span className="text-brand-400">vel</span>
          </span>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
        <div className={`hidden sm:block px-2 py-0.5 rounded-md text-xs font-semibold ${rc.bg} ${rc.color}`}>
          {rc.label}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, icon: Icon, href }) => {
          const isActive = location.pathname === href;
          return (
            <Link
              key={label}
              to={href}
              onClick={() => onClose()}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} className="flex-shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-slate-800 dark:border-slate-800 flex-shrink-0 space-y-3">
        {/* Role switcher for MVP demo */}
        <div className="px-3 py-2 rounded-lg bg-slate-800/60 dark:bg-slate-800/40">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest mb-2">
            Demo: Switch Role
          </p>
          <div className="flex gap-1">
            {['company', 'tester', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`flex-1 py-1 text-xs rounded-md font-medium transition-all capitalize
                  ${user?.role === r ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700 dark:hover:bg-slate-600'}`}
              >
                {r === 'company' ? '🏢' : r === 'tester' ? '👤' : '🛡️'}
              </button>
            ))}
          </div>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 cursor-pointer group transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.split(' ').map((n) => n[0]).join('') || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-error-400 transition-all"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

/**
 * PlatformLayout — main application shell with responsive sidebar
 */
export default function PlatformLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const mainContentRef = useRef(null);

  const { handleTouchStart, handleTouchEnd } = useEdgeSwipe(() => {
    setSidebarOpen(true);
  }, 50);

  // Close menus when clicking outside
  useEffect(() => {
    if (!userMenuOpen && !notifOpen) return;

    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [userMenuOpen, notifOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col">
        <Sidebar isOpen={true} onClose={() => {}} isMobile={false} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/60 animate-fade-in"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex flex-col animate-slide-in-left">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={true} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div
        ref={mainContentRef}
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">
          {/* Mobile sidebar toggle */}
          <button
            className="lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 p-1 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          {/* Page title */}
          <div className="flex-1">
            <h1 className="font-display font-bold text-slate-900 dark:text-slate-50 text-lg">{title}</h1>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notifications dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                aria-expanded={notifOpen}
                aria-haspopup="true"
                aria-label="View notifications"
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                <Bell size={20} />
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500"
                  aria-hidden="true"
                />
              </button>

              {notifOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-elevation-lg dark:shadow-elevation-dark-md py-1 z-20"
                  role="dialog"
                  aria-label="Notifications"
                >
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Notifications</p>
                  </div>
                  {demoNotifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{n.text}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.split(' ').map((n) => n[0]).join('') || 'U'}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden sm:block">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} className="text-slate-400 dark:text-slate-500" aria-hidden="true" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-elevation-lg dark:shadow-elevation-dark-md py-1 z-20"
                  role="dialog"
                  aria-label="User menu"
                >
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
