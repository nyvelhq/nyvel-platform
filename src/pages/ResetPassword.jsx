import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import NyvelMark from '../components/ui/NyvelMark';
import { useAuth } from '../App';
import Button from '../components/ui/Button';

// Reached via the link Supabase emails from requestPasswordReset (App.js).
// Supabase puts the caller into a temporary "recovery" session when that
// link is opened, so updatePassword() here is just a normal authenticated
// password change — no token handling needed on our side.
export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await updatePassword(password);
    setLoading(false);

    if (updateError) {
      setError('This reset link may have expired. Please request a new one from the sign-in page.');
      return;
    }
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-10">
          <NyvelMark size={32} className="rounded-lg" />
          <span className="font-display font-bold text-white text-lg">
            Ny<span className="text-brand-400">vel</span>
          </span>
        </Link>

        {done ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mb-5 mx-auto">
              <CheckCircle2 size={24} className="text-brand-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">Password updated</h1>
            <p className="text-slate-400 text-sm mb-8">You can now sign in with your new password.</p>
            <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
              Go to sign in
            </Button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-white mb-1 text-center">Set a new password</h1>
            <p className="text-slate-400 text-sm mb-8 text-center">Choose a new password for your account.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label text-slate-300">New password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input bg-slate-900 border-white/10 text-white placeholder-slate-600 pr-11"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label text-slate-300">Confirm new password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input bg-slate-900 border-white/10 text-white placeholder-slate-600"
                  required
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="text-sm text-error-400" role="alert">{error}</p>
              )}

              <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
                {loading ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
