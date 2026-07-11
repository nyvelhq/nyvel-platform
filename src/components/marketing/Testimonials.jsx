import React from 'react';
import { Bug, Gauge, CreditCard } from 'lucide-react';

// Honest, illustrative use cases — NOT attributed customer endorsements.
const useCases = [
  {
    icon: Bug,
    tag: 'Bug Hunt · Mobile',
    title: 'Catch crashes before the app store does',
    desc: 'Put a pre-release build in front of vetted testers on real devices and surface the critical, reproducible defects your team should fix first.',
  },
  {
    icon: Gauge,
    tag: 'Load Test · Web',
    title: 'Find the bottleneck staging hides',
    desc: 'Run a coordinated, many-tester session against your infrastructure to expose the failures that only show up under real concurrent load.',
  },
  {
    icon: CreditCard,
    tag: 'Fintech · Payments',
    title: 'Validate payment flows in the real world',
    desc: 'Exercise real-environment payment and edge-case paths with NDA-bound testers, so you ship money-moving features with confidence.',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-eyebrow mb-4">What Nyvel is for</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mt-2">
            Built for teams that ship{' '}
            <span className="gradient-text">high-quality products</span>
          </h2>
          <p className="mt-4 text-sm text-slate-500 max-w-xl mx-auto">
            Illustrative examples of how teams use the platform. We&apos;ll feature real
            customer stories here as our first cohort completes their tests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map(({ icon: Icon, tag, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                <Icon size={20} className="text-brand-600" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-600 mb-2">
                {tag}
              </p>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-3">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
