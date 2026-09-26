import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Button from './Button';
import NyvelMark from './NyvelMark';
import { ACCESS_PASSWORD } from '../../utils/accessGate';

/**
 * PasswordGate — Gate dashboard routes with a password
 * Public marketing pages (/, /login) bypass this component entirely
 */
export default function PasswordGate({ onAuthenticate }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (password === ACCESS_PASSWORD) {
      onAuthenticate();
    } else {
      setError('Incorrect password. Please try again.');
    }
    setPassword('');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md px-6 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <NyvelMark size={56} className="block rounded-xl shadow-glow mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white font-display">
            Ny<span className="text-brand-400">vel</span>
          </h1>
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
                className="form-input bg-slate-800 border-slate-700 text-white placeholder-slate-500 pr-11 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p className="form-error mt-2" role="alert">{error}</p>
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
    </main>
  );
}
