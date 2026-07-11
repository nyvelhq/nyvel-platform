import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, User, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import NyvelMark from '../components/ui/NyvelMark';
import { useAuth } from '../App';
import Button from '../components/ui/Button';

const roles = [
  {
    id: 'company',
    label: 'Company',
    sub: 'Run tests & get feedback',
    icon: Briefcase,
    color: 'border-brand-500 bg-brand-50 text-brand-700',
    highlight: 'bg-brand-600 text-white',
    dest: '/company/dashboard',
  },
  {
    id: 'tester',
    label: 'Beta Tester',
    sub: 'Join tests & earn money',
    icon: User,
    color: 'border-cyan-500 bg-cyan-50 text-cyan-700',
    highlight: 'bg-accent-500 text-white',
    dest: '/tester/dashboard',
  },
  {
    id: 'admin',
    label: 'Admin',
    sub: 'Manage the platform',
    icon: Shield,
    color: 'border-amber-500 bg-amber-50 text-amber-700',
    highlight: 'bg-amber-500 text-white',
    dest: '/admin/dashboard',
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('company');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotNotice, setForgotNotice] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const enterDemo = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 800));
    login(selectedRole);
    const dest = roles.find((r) => r.id === selectedRole)?.dest || '/company/dashboard';
    navigate(dest);
    // Testers land on the dashboard, where a banner guides them to
    // complete onboarding — mirroring a real first-login experience.
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await enterDemo();
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

          <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-8">Sign in to your Nyvel account</p>

          {/* Role selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Sign in as
            </label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedRole(id)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all duration-150
                    ${selectedRole === id
                      ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                      : 'border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                    }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>

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
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5 items-center relative">
                <label className="form-label text-slate-300 mb-0">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotNotice((v) => !v)}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Forgot password?
                </button>
                {forgotNotice && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 shadow-lg z-10">
                    No reset needed — this is an MVP demo, any password works.
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input bg-slate-900 border-white/10 text-white placeholder-slate-600 pr-11"
                  required
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

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={enterDemo}
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              Get started free
            </button>
          </p>

          <p className="mt-8 text-center text-xs text-slate-600">
            💡 MVP Demo: any email/password works — just select a role above
          </p>
        </div>
      </div>
    </div>
  );
}
