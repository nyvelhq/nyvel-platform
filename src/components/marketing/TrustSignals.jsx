import React from 'react';
import { CheckCircle2, Lock, Globe, Award } from 'lucide-react';

const trustItems = [
  {
    icon: CheckCircle2,
    label: 'Vetted Testers',
    description: 'Screened & verified before platform access',
  },
  {
    icon: Lock,
    label: 'NDA Protected',
    description: 'Every tester signs binding confidentiality agreement',
  },
  {
    icon: Globe,
    label: 'Global Coverage',
    description: 'Real testers in 42+ countries, 10+ languages',
  },
  {
    icon: Award,
    label: 'QA Backed',
    description: 'Professional engineers review every result',
  },
];

export default function TrustSignals() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-900/50 to-slate-950 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {trustItems.map(({ icon: Icon, label, description }) => (
            <div key={label} className="flex flex-col items-center text-center group">
              <div className="mb-3 w-12 h-12 rounded-xl bg-accent-500/20 border border-accent-500/30 flex items-center justify-center group-hover:bg-accent-500/30 transition-colors">
                <Icon size={24} className="text-accent-400" />
              </div>
              <h3 className="font-semibold text-slate-100 text-sm font-display">{label}</h3>
              <p className="text-xs text-slate-400 mt-2">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
