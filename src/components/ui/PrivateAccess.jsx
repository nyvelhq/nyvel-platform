import React, { useState } from 'react';
import Button from './Button';

/**
 * PrivateAccess — Gate the entire app with a password
 * Wraps App.js to require authentication before accessing
 */
export default function PrivateAccess({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('nyvel_authenticated') === 'true';
  });

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const CORRECT_PASSWORD = process.env.REACT_APP_PASSWORD || 'nyvel2024';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('nyvel_authenticated', 'true');
      setPassword('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
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
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className="form-input bg-slate-800 border-slate-700 text-white placeholder-slate-500"
              />
              {error && (
                <p className="form-error mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!password}
            >
              Access Platform
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
