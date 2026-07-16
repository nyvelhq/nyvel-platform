import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig, AnimatePresence, motion } from 'framer-motion';
import { duration, ease } from './motion/tokens';

// Pages
// Admin dashboard pages implemented with comprehensive validation and error handling
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CompanyDashboard from './pages/CompanyDashboard';
import CreateTest from './pages/CreateTest';
import TesterDashboard from './pages/TesterDashboard';
import TesterOnboarding from './pages/TesterOnboarding';
import TesterProfile from './pages/TesterProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTests from './pages/AdminTests';
import AdminReports from './pages/AdminReports';
import AdminSecurity from './pages/AdminSecurity';
import AdminSettings from './pages/AdminSettings';
import ComingSoon from './pages/ComingSoon';

// Components & Providers
import ErrorBoundary from './components/ui/ErrorBoundary';
import PasswordGate from './components/ui/PasswordGate';
import Toast from './components/ui/Toast';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const STORAGE_KEY = 'nyvel_user';
const ROLE_STORAGE_KEY = 'nyvel_users_by_role';
const AUTH_FLAG_KEY = 'nyvel_authenticated';

const mockUsers = {
  company: {
    id: 'usr_comp_001',
    name: 'Sarah Chen',
    email: 'sarah@techcorp.io',
    role: 'company',
    company: 'TechCorp Inc.',
    avatar: null,
    plan: 'Professional',
  },
  tester: {
    id: 'usr_test_042',
    name: 'Marcus Johnson',
    email: 'marcus@email.com',
    role: 'tester',
    avatar: null,
    rating: 4.9,
    testsCompleted: 127,
    profileComplete: false,
  },
  admin: {
    id: 'usr_admin_001',
    name: 'Nyvel Admin',
    email: 'admin@nyvel.co',
    role: 'admin',
    avatar: null,
  },
};

export function AuthProvider({ children }) {
  const [usersByRole, setUsersByRole] = useState(() => {
    try {
      const saved = sessionStorage.getItem(ROLE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : { ...mockUsers };
    } catch {
      return { ...mockUsers };
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Single source of truth for "has this session cleared the site-wide
  // gate" — shared by PasswordGate's own password entry AND by picking a
  // role on LoginPage. Previously LoginPage's login() never set this flag,
  // so completing sign-in bounced straight back into PasswordGate.
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem(AUTH_FLAG_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const persistUsersByRole = (next) => {
    setUsersByRole(next);
    try {
      sessionStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // sessionStorage unavailable — role state will not survive refresh
    }
  };

  const login = (role) => {
    const nextUser = usersByRole[role] || mockUsers[role];
    setUser(nextUser);
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      sessionStorage.setItem(AUTH_FLAG_KEY, 'true');
    } catch {
      // sessionStorage unavailable — auth will not survive refresh
    }
  };

  // Entering the site-wide password on PasswordGate also counts as
  // clearing the gate — same flag login() sets, so neither path has to
  // satisfy the other a second time.
  const authenticate = () => {
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem(AUTH_FLAG_KEY, 'true');
    } catch {
      // no-op
    }
  };

  const logout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // no-op
    }
  };

  const updateUser = (patch) => {
    setUser((u) => {
      const next = { ...u, ...patch };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // no-op
      }
      persistUsersByRole({ ...usersByRole, [next.role]: next });
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser, authenticate }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
}

// Helper to reduce route boilerplate
const guarded = (role, element) => (
  <ProtectedRoute role={role}>{element}</ProtectedRoute>
);

// Password gate wrapper that checks routes
function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated, authenticate } = useAuth();

  // Public routes that don't require password
  const publicRoutes = ['/', '/login'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const needsAuth = !isAuthenticated && !isPublicRoute;

  if (needsAuth) {
    return <PasswordGate onAuthenticate={authenticate} />;
  }

  return (
    // Route transitions: AnimatePresence crossfades between locations.
    // The exiting page keeps rendering (Routes receives the animated
    // location) while the next one fades in — no artificial delay like
    // the old setTimeout-based wrapper. Opacity-only on purpose: a
    // transformed page wrapper would become the containing block for
    // position:fixed children (toasts, modals).
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: duration.slow, ease: ease.out } }}
        exit={{ opacity: 0, transition: { duration: duration.fast, ease: ease.in } }}
      >
        <Routes location={location}>
        {/* Marketing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Company routes */}
        <Route path="/company/dashboard" element={guarded('company', <CompanyDashboard />)} />
        <Route path="/company/create-test" element={guarded('company', <CreateTest />)} />
        <Route path="/company/tests" element={guarded('company', <ComingSoon title="My Tests" />)} />
        <Route path="/company/tests/:id" element={guarded('company', <ComingSoon title="Test Details" />)} />
        <Route path="/company/testers" element={guarded('company', <ComingSoon title="Testers" />)} />
        <Route path="/company/reports" element={guarded('company', <ComingSoon title="Reports" />)} />
        <Route path="/company/settings" element={guarded('company', <ComingSoon title="Settings" />)} />

        {/* Tester routes */}
        <Route path="/tester/dashboard" element={guarded('tester', <TesterDashboard />)} />
        <Route path="/tester/onboarding" element={guarded('tester', <TesterOnboarding />)} />
        <Route path="/tester/profile" element={guarded('tester', <TesterProfile />)} />
        {/* Available Tests / My Applications / Earnings are tabs on the
            Tester Dashboard, not separate pages — redirect any direct
            or bookmarked hit on the old standalone routes there instead
            of showing a placeholder for something that already works. */}
        <Route path="/tester/tests" element={<Navigate to="/tester/dashboard?tab=available" replace />} />
        <Route path="/tester/tests/:id" element={guarded('tester', <ComingSoon title="Test Details" />)} />
        <Route path="/tester/applications" element={<Navigate to="/tester/dashboard?tab=my" replace />} />
        <Route path="/tester/applications/:id" element={guarded('tester', <ComingSoon title="Application Details" />)} />
        <Route path="/tester/earnings" element={<Navigate to="/tester/dashboard?tab=earnings" replace />} />
        <Route path="/tester/settings" element={guarded('tester', <ComingSoon title="Settings" />)} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={guarded('admin', <AdminDashboard />)} />
        <Route path="/admin/users" element={guarded('admin', <AdminUsers />)} />
        <Route path="/admin/tests" element={guarded('admin', <AdminTests />)} />
        <Route path="/admin/reports" element={guarded('admin', <AdminReports />)} />
        <Route path="/admin/security" element={guarded('admin', <AdminSecurity />)} />
        <Route path="/admin/settings" element={guarded('admin', <AdminSettings />)} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      {/* reducedMotion="user" — Framer swaps transforms for crossfades when the OS asks for reduced motion */}
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <DataProvider>
            <ToastProvider>
              <BrowserRouter>
                <AppRoutes />
                <Toast />
              </BrowserRouter>
            </ToastProvider>
          </DataProvider>
        </AuthProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
