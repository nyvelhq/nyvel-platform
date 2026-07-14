import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, UserCheck, Layers, Timer, X } from 'lucide-react';
import { tickerItems } from '../../data/mockData';
import Button from '../ui/Button';

const statItems = [
  { value: 'QA-led', label: 'Testing run by professionals', icon: UserCheck },
  { value: 'Vetted', label: 'Screened, NDA-bound testers', icon: ShieldCheck },
  { value: 'Any type', label: 'Bugs, usability, load & more', icon: Layers },
  { value: 'Fast', label: 'Structured results, quickly', icon: Timer },
];

const ticker = [...tickerItems, ...tickerItems];

export default function Hero() {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = React.useState(true);

  return (
    <section className="relative min-h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Announcement Banner */}
      {showBanner && (
        <div className="bg-accent-500/20 border-b border-accent-500/30 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 max-w-2xl">
            <span className="text-accent-400 font-bold text-lg">✨</span>
            <p className="text-slate-100 text-sm sm:text-base">
              <span className="font-semibold">Just launched:</span> Testers in 42 countries. Create your test in 5 minutes.{' '}
              <button 
                onClick={() => navigate('/login?role=company')}
                className="font-bold text-accent-400 hover:text-accent-300 underline transition-colors"
              >
                Try free
              </button>
            </p>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
            aria-label="Close announcement"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-slate opacity-100 pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-accent-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-40">
        {/* Tagline — Above headline like ProMentor */}
        <div className="animate-fade-up mb-6" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent-400" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-accent-400">
              QA-Led · Vetted Testers · Zero Anonymity
            </span>
          </div>
        </div>

        {/* Headline — Emotional benefit with accent color */}
        <h1
          className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white text-center leading-[1.05] tracking-tight max-w-5xl animate-fade-up"
          style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          Ship confidently,
          <br />
          tested by someone
          <br />
          who's{' '}
          <span className="gradient-text">built it</span>
        </h1>

        {/* Subheadline — Reassuring benefit */}
        <p
          className="mt-6 text-lg sm:text-xl text-slate-400 text-center max-w-2xl animate-fade-up"
          style={{ animationDelay: '150ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          Get real-world feedback from vetted testers before launch. Professional QA review included.
        </p>

        {/* Key Benefits — Checkmarks */}
        <div
          className="mt-8 space-y-2 text-center max-w-xl animate-fade-up"
          style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          <p className="flex items-center justify-center gap-3 text-sm sm:text-base text-slate-300">
            <span className="text-accent-400 font-bold text-lg">✓</span>
            Bugs found by real people, not robots
          </p>
          <p className="flex items-center justify-center gap-3 text-sm sm:text-base text-slate-300">
            <span className="text-accent-400 font-bold text-lg">✓</span>
            Results in 24-48 hours, not weeks
          </p>
          <p className="flex items-center justify-center gap-3 text-sm sm:text-base text-slate-300">
            <span className="text-accent-400 font-bold text-lg">✓</span>
            Professional QA review for every test
          </p>
        </div>

        {/* Primary CTA — Make it prominent and larger */}
        <div
          className="mt-12 flex flex-col sm:flex-row gap-3 items-center animate-fade-up"
          style={{ animationDelay: '300ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          <Button
            size="xl"
            className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-slate-900 px-10 py-4 rounded-lg font-bold shadow-lg hover:shadow-2xl transition-all text-lg"
            onClick={() => navigate('/login?role=company')}
            iconRight={<ArrowRight size={20} />}
          >
            Start Testing Free
          </Button>
          <Button
            size="xl"
            variant="ghost"
            className="text-slate-300 hover:text-white hover:bg-white/10 border border-slate-500 px-8 py-4 rounded-lg font-semibold"
            onClick={() => navigate('/login?role=tester')}
          >
            Join as Tester
          </Button>
        </div>

        {/* Trust indicators below CTA */}
        <div
          className="mt-6 text-center animate-fade-up"
          style={{ animationDelay: '400ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          <p className="text-xs text-slate-500 font-medium">
            14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        {/* Live Ticker — labelled as an illustrative preview */}
        <div
          className="mt-16 w-full max-w-5xl animate-fade-up"
          style={{ animationDelay: '500ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center gap-3 px-4 py-2 border-b border-white/10 bg-slate-900/40">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-slate-500 font-mono">platform activity · live demo</span>
              <span className="ml-auto flex items-center gap-1.5 text-xs text-accent-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="ticker-wrap py-3">
              <div className="ticker-inner">
                {ticker.map((item, i) => (
                  <span key={i} className="text-sm text-slate-300 mx-8 font-mono whitespace-nowrap">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Value-prop row */}
        <div
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 w-full max-w-4xl animate-fade-up"
          style={{ animationDelay: '600ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          {statItems.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center group">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent-500/20 border border-accent-500/30 flex items-center justify-center group-hover:bg-accent-500/30 transition-colors">
                  <Icon size={18} className="text-accent-400" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-display text-white">{value}</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
