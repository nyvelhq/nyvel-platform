import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Button from './Button';

/**
 * PrivateAccess — Gate dashboard routes with a password
 * Public marketing pages (/, /login) are always accessible
 */
export default function PrivateAccess({ children }) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('nyvel_authenticated') === 'true';
  });

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const CORRECT_PASSWORD = process.env.REACT_APP_PASSWORD || 'nyvel2024';

  // Public routes that don't require password authentication
  const publicRoutes = ['/', '/login'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((res) => setTimeout(res, 600));

    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('nyvel_authenticated', 'true');
      setPassword('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }

    setLoading(false);
  };

  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-950 dark:to-slate-900">
        <div className="w-full max-w-md px-6 py-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-brand-500 mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white font-display">Nyvel</h1>
            <p className="text-slate-400 mt-1">Private Platform</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="form-label text-white">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoFocus
                  disabled={loading}
                  className="form-input bg-slate-800 border-slate-700 text-white placeholder-slate-500 pr-11 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="form-error mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!password || loading}
              loading={loading}
            >
              {loading ? 'Verifying...' : 'Access Platform'}
            </Button>
          </form>

          {/* Info */}
          <p className="text-center text-sm text-slate-500 mt-6">
            This is a private platform. <br />
            Contact your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
