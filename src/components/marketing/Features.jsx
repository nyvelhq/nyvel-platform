import React from 'react';
import { Users, BarChart3, Shield, Globe, Clock, Zap } from 'lucide-react';

const features = [
  {
    icon: Users,
    color: 'teal',
    title: 'Recruit the Right Testers',
    desc: 'Target testers by device, OS, demographics, profession, and experience — so feedback comes from people who match your real users, not a random crowd.',
  },
  {
    icon: Zap,
    color: 'amber',
    title: 'Run Any Type of Test',
    desc: 'Bug hunts, usability studies, load tests, fintech flows, game playtesting, and more. Start a test in minutes with ready-made templates.',
  },
  {
    icon: BarChart3,
    color: 'teal',
    title: 'Actionable Insights, Fast',
    desc: 'Get structured bug reports, session recordings, and prioritized issues — reviewed by our QA team so you see what matters for your next release.',
  },
  {
    icon: Globe,
    color: 'amber',
    title: 'Test Where Your Users Are',
    desc: 'Reach testers in the markets you care about, testing in their own language, on their local device, in their real network environment.',
  },
  {
    icon: Clock,
    color: 'teal',
    title: 'Results in Days, Not Weeks',
    desc: 'Run rapid pre-launch checks or in-depth longitudinal studies — structured and returned to you on a timeline you set.',
  },
  {
    icon: Shield,
    color: 'amber',
    title: 'Confidential by Default',
    desc: 'Every tester signs an NDA. Data is encrypted in transit and at rest, with handling designed to support GDPR and CCPA. Your unreleased product stays confidential.',
  },
];

const colorMap = {
  teal: {
    wrap: 'bg-brand-50 group-hover:bg-brand-100',
    icon: 'text-brand-600',
    border: 'group-hover:border-brand-200',
  },
  amber: {
    wrap: 'bg-accent-50 group-hover:bg-accent-100',
    icon: 'text-accent-600',
    border: 'group-hover:border-accent-200',
  },
};

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-eyebrow mb-4">Platform Capabilities</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mt-2">
            Everything you need to ship{' '}
            <span className="gradient-text">with confidence</span>
          </h2>
          <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto">
            From tester recruiting to structured reporting, Nyvel handles the complexity
            so your team can focus on building.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, color, title, desc }) => {
            const c = colorMap[color];
            return (
              <div
                key={title}
                className={`group relative bg-white rounded-2xl border border-slate-100 p-7 hover:shadow-lg transition-all duration-300 ${c.border}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${c.wrap}`}>
                  <Icon size={22} className={c.icon} />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
