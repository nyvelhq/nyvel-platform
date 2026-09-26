import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MotionConfig, AnimatePresence, motion } from 'framer-motion';
import { duration, ease } from './motion/tokens';
import { ACCESS_PASSWORD, ACCESS_QUERY_PARAM } from './utils/accessGate';
import { supabase } from './lib/supabaseClient';
import { loadTesterProfile, saveTesterProfile, hasTesterProfileFields } from './lib/testerProfiles';

// Pages
// Admin dashboard pages implemented with comprehensive validation and error handling
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ResetPassword from './pages/ResetPassword';
import RequestAccess from './pages/RequestAccess';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyTests from './pages/CompanyTests';
import CreateTest from './pages/CreateTest';
import CompanyTestDetail from './pages/CompanyTestDetail';
import TesterTestDetail from './pages/TesterTestDetail';
import TesterDashboard from './pages/TesterDashboard';
import TesterOnboarding from './pages/TesterOnboarding';
import TesterProfile from './pages/TesterProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminPayouts from './pages/AdminPayouts';
import AdminUsers from './pages/AdminUsers';
import AdminTests from './pages/AdminTests';
import AdminReports from './pages/AdminReports';
import AdminRequests from './pages/AdminRequests';
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

// Build the app-facing user object from a Supabase auth user + their
// public.profiles row. role/client_id come from the server (F-02 — never
// chosen by the client). Testers also get their public.tester_profiles
// fields (UX-05, migration 0013).
const buildUser = (authUser, profileRow, testerProfile) => ({
  id: authUser.id,
  email: profileRow?.email || authUser.email,
  name: profileRow?.name || '',
  role: profileRow?.role || 'tester',
  clientId: profileRow?.client_id || null,
  createdAt: profileRow?.created_at || authUser.created_at || null,
  ...(testerProfile || {}),
});

const fetchProfile = async (userId) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) {
    console.error('Failed to load profile:', error.message);
    return null;
  }
  return data;
};

// Profile row plus, for testers, their saved onboarding answers. A failed
// tester-profile load leaves those fields unset rather than blocking sign-in.
const loadUser = async (authUser) => {
  const profile = await fetchProfile(authUser.id);
  let testerProfile = null;
  if ((profile?.role || 'tester') === 'tester') {
    const result = await loadTesterProfile(authUser.id);
    if (result.error) console.error('Failed to load tester profile:', result.error.message);
    testerProfile = result.profile;
  }
  return buildUser(authUser, profile, testerProfile);
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
        const nextUser = await loadUser(session.user);
        if (mounted) setUser(nextUser);
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
      const nextUser = await loadUser(session.user);
      if (mounted) setUser(nextUser);
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
      const nextUser = await loadUser(data.session.user);
      role = nextUser.role;
      setUser(nextUser);
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

  // Saves profile edits to the server, then updates `user`. Resolves to
  // { error } so callers can tell the person when a save failed; nothing
  // changes locally unless every write succeeded.
  const updateUser = async (patch) => {
    if (!user?.id) return { error: { message: 'You are signed out.' } };
    if (hasTesterProfileFields(patch)) {
      const { error } = await saveTesterProfile(user.id, patch);
      if (error) {
        console.error('Failed to save tester profile:', error.message);
        return { error };
      }
    }
    if (typeof patch.name === 'string' && patch.name.trim() && patch.name !== user.name) {
      const { error } = await supabase.from('profiles').update({ name: patch.name.trim() }).eq('id', user.id);
      if (error) {
        console.error('Failed to save name:', error.message);
        return { error };
      }
    }
    setUser((u) => (u ? { ...u, ...patch } : u));
    return { error: null };
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
  const publicRoutes = ['/', '/login', '/reset-password', '/request-access'];
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
        <Route path="/request-access" element={<RequestAccess />} />

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
        {/* Users/Tests/Reports/Security/Settings rendered mockData.js and
            fake actions; they stay unrouted until wired to real data. */}
        <Route path="/admin/users" element={guarded('admin', <AdminUsers />)} />
        <Route path="/admin/tests" element={guarded('admin', <AdminTests />)} />
        <Route path="/admin/reports" element={guarded('admin', <AdminReports />)} />
        <Route path="/admin/security" element={guarded('admin', <ComingSoon title="Security" />)} />
        <Route path="/admin/payouts" element={guarded('admin', <AdminPayouts />)} />
        <Route path="/admin/requests" element={guarded('admin', <AdminRequests />)} />
        <Route path="/admin/settings" element={guarded('admin', <ComingSoon title="Settings" />)} />

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
