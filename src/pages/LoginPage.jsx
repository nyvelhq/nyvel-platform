import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import NyvelMark from '../components/ui/NyvelMark';
import { useAuth } from '../App';
import Button from '../components/ui/Button';

const dashboardByRole = {
  company: '/company/dashboard',
  tester: '/tester/dashboard',
  admin: '/admin/dashboard',
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const { signIn, requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError, role } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError('Incorrect email or password. Please try again.');
      return;
    }
    navigate(dashboardByRole[role] || '/tester/dashboard');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    const { error: resetError } = await requestPasswordReset(forgotEmail);
    setForgotLoading(false);
    if (resetError) {
      setForgotError('Something went wrong. Please try again.');
      return;
    }
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-gradient-to-br from-slate-900 to-slate-950 border-r border-white/10 p-12">
        <div>
          <Link to="/" className="flex items-center gap-2.5 mb-16">
            <NyvelMark size={36} className="rounded-xl shadow-glow" />
            <span className="font-display font-bold text-white text-xl">
              Ny<span className="text-brand-400">vel</span>
            </span>
          </Link>

          <h2 className="font-display text-3xl font-bold text-white leading-tight mb-4">
            The real human
            <br />
            <span className="gradient-text">beta testing platform</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Ship with confidence. Nyvel pairs vetted human testers with a professional QA
            team, so you get actionable feedback before your product goes live.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { stat: 'QA-led', label: 'Tests designed & reviewed by pros' },
            { stat: 'Vetted', label: 'Screened, NDA-bound testers' },
            { stat: 'Real-world', label: 'Real devices, real environments' },
          ].map(({ stat, label }) => (
            <div key={stat} className="flex items-center gap-4 p-4 glass-card rounded-xl">
              <span className="font-display font-bold text-2xl gradient-text">{stat}</span>
              <span className="text-sm text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <NyvelMark size={32} className="rounded-lg" />
            <span className="font-display font-bold text-white text-lg">
              Ny<span className="text-brand-400">vel</span>
            </span>
          </div>

          {showForgot ? (
            forgotSent ? (
              <div>
                <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mb-5">
                  <CheckCircle2 size={24} className="text-brand-400" />
                </div>
                <h1 className="font-display text-2xl font-bold text-white mb-1">Check your email</h1>
                <p className="text-slate-400 text-sm mb-8">
                  If an account exists for <span className="text-slate-300">{forgotEmail}</span>, we've
                  sent a link to reset your password.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotSent(false);
                    setForgotEmail('');
                  }}
                  className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <div>
                <h1 className="font-display text-2xl font-bold text-white mb-1">Reset your password</h1>
                <p className="text-slate-400 text-sm mb-8">
                  Enter your email and we'll send you a link to reset it.
                </p>
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="form-label text-slate-300">Email address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="form-input bg-slate-900 border-white/10 text-white placeholder-slate-600 focus:ring-brand-500"
                      required
                    />
                  </div>
                  {forgotError && (
                    <p className="text-sm text-error-400" role="alert">{forgotError}</p>
                  )}
                  <Button type="submit" className="w-full mt-2" size="lg" loading={forgotLoading}>
                    {forgotLoading ? 'Sending...' : 'Send reset link'}
                  </Button>
                </form>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="mt-6 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            )
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h1>
              <p className="text-slate-400 text-sm mb-8">Sign in to your Nyvel account</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="form-label text-slate-300">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="form-input bg-slate-900 border-white/10 text-white placeholder-slate-600 focus:ring-brand-500"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1.5 items-center">
                    <label className="form-label text-slate-300 mb-0">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input bg-slate-900 border-white/10 text-white placeholder-slate-600 pr-11"
                      required
                      autoComplete="current-password"
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

                {error && (
                  <p className="text-sm text-error-400" role="alert">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full mt-2"
                  size="lg"
                  loading={loading}
                  iconRight={!loading && <ArrowRight size={18} />}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <p className="mt-8 text-center text-xs text-slate-600">
                Nyvel accounts are set up by your organization's admin. Contact them if you need access.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
