import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, ShieldCheck, UserCheck, Layers, Timer } from 'lucide-react';
import { tickerItems } from '../../data/mockData';
import Button from '../ui/Button';

// Honest, qualitative value props — no fabricated counts or certifications.
const statItems = [
  { value: 'QA-led', label: 'Testing run by professionals', icon: UserCheck },
  { value: 'Vetted', label: 'Screened, NDA-bound testers', icon: ShieldCheck },
  { value: 'Any type', label: 'Bugs, usability, load & more', icon: Layers },
  { value: 'Fast', label: 'Structured results, quickly', icon: Timer },
];

const ticker = [...tickerItems, ...tickerItems];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-slate opacity-100 pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-accent-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-40">
        {/* Eyebrow — honest, forward-looking */}
        <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
          <span className="section-eyebrow mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
            Built on a professional software-QA practice · Onboarding our first teams
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white text-center leading-[1.05] tracking-tight max-w-5xl animate-fade-up"
          style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          Beta Testing,
          <br />
          Perfected by{' '}
          <span className="gradient-text">Real People</span>
        </h1>

        {/* Subheading — honest */}
        <p
          className="mt-7 text-lg sm:text-xl text-slate-400 text-center max-w-2xl leading-relaxed animate-fade-up"
          style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          Nyvel pairs vetted human testers with an experienced QA team, so you get
          real-world feedback that actually improves your product — before it ships.
        </p>

        {/* CTAs */}
        <div
          className="mt-10 flex flex-col sm:flex-row gap-4 items-center animate-fade-up"
          style={{ animationDelay: '300ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          <Button
            size="xl"
            className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 shadow-glow"
            onClick={() => navigate('/login')}
            iconRight={<ArrowRight size={18} />}
          >
            Launch Your Test
          </Button>
          <Button
            size="xl"
            variant="ghost"
            className="text-slate-300 hover:text-white hover:bg-white/10 border border-white/15"
            onClick={() => navigate('/login')}
            icon={<Play size={18} />}
          >
            Join as Tester · Free
          </Button>
        </div>

        {/* Honest heritage line (replaces borrowed customer logos) */}
        <div
          className="mt-12 flex flex-col items-center gap-2 animate-fade-up"
          style={{ animationDelay: '400ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest text-center">
            Backed by an established software-QA team
          </span>
          <span className="text-sm text-slate-400 text-center max-w-xl">
            Every test on Nyvel is designed and reviewed by professional QA engineers —
            not just an anonymous crowd.
          </span>
        </div>

        {/* Live Ticker — labelled as an illustrative preview */}
        <div
          className="mt-14 w-full max-w-5xl animate-fade-up"
          style={{ animationDelay: '500ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center gap-3 px-4 py-2 border-b border-white/10 bg-slate-900/40">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-slate-500 font-mono">platform activity · illustrative preview</span>
              <span className="ml-auto flex items-center gap-1.5 text-xs text-accent-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                DEMO
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

        {/* Value-prop row (replaces fabricated metric grid) */}
        <div
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 w-full max-w-4xl animate-fade-up"
          style={{ animationDelay: '600ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          {statItems.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center group">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center group-hover:bg-brand-600/30 transition-colors">
                  <Icon size={18} className="text-brand-400" />
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
