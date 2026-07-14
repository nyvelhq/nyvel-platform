import React from 'react';
import { CheckCircle2, Lock, Globe, Award } from 'lucide-react';

const trustItems = [
  {
    icon: CheckCircle2,
    label: 'Vetted Testers',
    description: 'All testers are screened and verified before access',
  },
  {
    icon: Lock,
    label: 'NDA Protected',
    description: 'Every tester signs an NDA to protect your product',
  },
  {
    icon: Globe,
    label: 'Global Coverage',
    description: 'Test with real users in 100+ countries',
  },
  {
    icon: Award,
    label: 'QA Backed',
    description: 'Professional QA engineers review all results',
  },
];

export default function TrustSignals() {
  return (
    <section className="py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {trustItems.map(({ icon: Icon, label, description }) => (
            <div key={label} className="flex flex-col items-center text-center group">
              <div className="mb-3 w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                <Icon size={24} className="text-brand-600" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{label}</h3>
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
