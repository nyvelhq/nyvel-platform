import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MotionConfig, AnimatePresence, motion } from 'framer-motion';
import { duration, ease } from './motion/tokens';
import { ACCESS_PASSWORD, ACCESS_QUERY_PARAM } from './utils/accessGate';
import { supabase } from './lib/supabaseClient';

// Pages
// Admin dashboard pages implemented with comprehensive validation and error handling
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ResetPassword from './pages/ResetPassword';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyTests from './pages/CompanyTests';
import CreateTest from './pages/CreateTest';
import CompanyTestDetail from './pages/CompanyTestDetail';
import TesterTestDetail from './pages/TesterTestDetail';
import TesterDashboard from './pages/TesterDashboard';
import TesterOnboarding from './pages/TesterOnboarding';
import TesterProfile from './pages/TesterProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTests from './pages/AdminTests';
import AdminReports from './pages/AdminReports';
import AdminSecurity from './pages/AdminSecurity';
import AdminPayouts from './pages/AdminPayouts';
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

const AUTH_FLAG_KEY = 'nyvel_authenticated';
// Onboarding/profile fields that live only in the client for now (bio,
// skills, devices, etc.) — they aren't columns on public.profiles yet
// (that table only has id/name/email/role/client_id, see supabase/schema.sql).
// Cached per-user in sessionStorage so TesterOnboarding/TesterProfile keep
// working unchanged until a later increment adds real columns for them.
const EXTRA_STORAGE_PREFIX = 'nyvel_profile_extra_';

const loadExtra = (uid) => {
  if (!uid) return {};
  try {
    const raw = sessionStorage.getItem(EXTRA_STORAGE_PREFIX + uid);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveExtra = (uid, extra) => {
  if (!uid) return;
  try {
    sessionStorage.setItem(EXTRA_STORAGE_PREFIX + uid, JSON.stringify(extra));
  } catch {
    // sessionStorage unavailable — extra profile fields will not survive refresh
  }
};

// Build the app-facing user object from a Supabase auth user + their
// public.profiles row. role/client_id come from the server (F-02 — never
// chosen by the client), everything else is either the profile row or the
// locally-cached "extra" fields described above.
const buildUser = (authUser, profileRow) => ({
  id: authUser.id,
  email: profileRow?.email || authUser.email,
  name: profileRow?.name || '',
  role: profileRow?.role || 'tester',
  clientId: profileRow?.client_id || null,
  ...loadExtra(authUser.id),
});

const fetchProfile = async (userId) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) {
    console.error('Failed to load profile:', error.message);
    return null;
  }
  return data;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True until the initial session check (getSession) resolves, so
  // ProtectedRoute doesn't bounce an already-signed-in user to /login
  // just because Supabase hasn't answered yet on first paint/refresh.
  const [authLoading, setAuthLoading] = useState(true);

  // Single source of truth for "has this device cleared the site-wide
  // gate" — shared by PasswordGate's own password entry, the ?key= link
  // bypass, AND a successful sign-in. Stored in localStorage (not
  // sessionStorage) so beta testers/investors sent a private link don't
  // have to re-clear the gate every time they reopen the tab.
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem(AUTH_FLAG_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) setUser(buildUser(session.user, profile));
      }
      if (mounted) setAuthLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        return;
      }
      const profile = await fetchProfile(session.user.id);
      if (mounted) setUser(buildUser(session.user, profile));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Entering the site-wide password on PasswordGate, or landing on a
  // ?key=... link, also counts as clearing the gate.
  const authenticate = () => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem(AUTH_FLAG_KEY, 'true');
    } catch {
      // no-op
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };
    let role = null;
    if (data?.session?.user) {
      const profile = await fetchProfile(data.session.user.id);
      role = profile?.role || 'tester';
      setUser(buildUser(data.session.user, profile));
    }
    authenticate();
    return { error: null, role };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const requestPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  const updateUser = (patch) => {
    setUser((u) => {
      if (!u) return u;
      const next = { ...u, ...patch };
      const { id, email, name, role, clientId, ...extra } = next;
      saveExtra(id, extra);
      return next;
    });
    // Best-effort sync of the one editable field that does live server-side —
    // display name. Everything else in `patch` is a local-only extra field
    // (see buildUser/loadExtra above) until those columns exist.
    if (patch.name && user?.id) {
      supabase
        .from('profiles')
        .update({ name: patch.name })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) console.error('Failed to sync name to profile:', error.message);
        });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        isAuthenticated,
        signIn,
        logout,
        updateUser,
        authenticate,
        requestPasswordReset,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children, role }) {
  const { user, authLoading } = useAuth();
  // Session restore (getSession + profile fetch) is still in flight — wait
  // rather than bouncing a signed-in user to /login on refresh.
  if (authLoading) return null;
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
  const navigate = useNavigate();
  const { isAuthenticated, authenticate } = useAuth();

  // Private-link bypass: a shareable URL like /?key=<password> clears the
  // gate automatically (for beta testers/investors) without exposing the
  // routes publicly. The key is stripped from the URL immediately after
  // so it doesn't linger in the address bar, browser history, or get
  // re-shared accidentally.
  useEffect(() => {
    if (isAuthenticated) return;
    const params = new URLSearchParams(location.search);
    const key = params.get(ACCESS_QUERY_PARAM);
    if (key && key === ACCESS_PASSWORD) {
      authenticate();
      params.delete(ACCESS_QUERY_PARAM);
      const cleanSearch = params.toString();
      navigate(
        { pathname: location.pathname, search: cleanSearch ? `?${cleanSearch}` : '' },
        { replace: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, isAuthenticated]);

  // Public routes that don't require password. /reset-password is here too:
  // it's reached via a Supabase-emailed recovery link, and a tester/client
  // clicking that link shouldn't have to also clear the marketing gate first.
  const publicRoutes = ['/', '/login', '/reset-password'];
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
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Company routes */}
        <Route path="/company/dashboard" element={guarded('company', <CompanyDashboard />)} />
        <Route path="/company/create-test" element={guarded('company', <CreateTest />)} />
        <Route path="/company/tests" element={guarded('company', <CompanyTests />)} />
        <Route path="/company/tests/:id" element={guarded('company', <CompanyTestDetail />)} />
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
        <Route path="/tester/tests/:id" element={guarded('tester', <TesterTestDetail />)} />
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
        <Route path="/admin/payouts" element={guarded('admin', <AdminPayouts />)} />
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
