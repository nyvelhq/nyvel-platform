import React, { useState } from 'react';
import { Briefcase, User, ArrowRight } from 'lucide-react';

const companySteps = [
  {
    num: '01',
    title: 'Define Your Test',
    desc: 'Choose a test type, set your target criteria (device, OS, demographics, expertise), and configure what feedback you need. Use a template or build custom.',
  },
  {
    num: '02',
    title: 'We Recruit Testers',
    desc: 'Nyvel surfaces your test to qualified, vetted testers within minutes. Most tests reach full capacity within 24 hours.',
  },
  {
    num: '03',
    title: 'Testers Work in the Real World',
    desc: 'Testers use your product on their own devices, in their real environment. No simulators. No staged conditions.',
  },
  {
    num: '04',
    title: 'Get Structured Results',
    desc: 'Receive prioritized bug reports, usability videos, survey responses, and annotated feedback — all organized in your Nyvel dashboard.',
  },
];

const testerSteps = [
  {
    num: '01',
    title: 'Create Your Tester Profile',
    desc: 'Tell us your devices, platforms, expertise, and interests. The more complete your profile, the better tests we match you with.',
  },
  {
    num: '02',
    title: 'Browse & Apply to Tests',
    desc: 'See available tests matched to your profile. Apply in one click — no lengthy proposals or vetting interviews.',
  },
  {
    num: '03',
    title: 'Test Real Products',
    desc: 'Receive access to the product and your test instructions. Complete the test at your own pace within the given timeframe.',
  },
];

export default function HowItWorks() {
  const [tab, setTab] = useState('company');
  const steps = tab === 'company' ? companySteps : testerSteps;

  return (
    <section id="how-it-works" className="py-24 bg-slate-950 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-eyebrow mb-4">Process</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mt-2">
            How <span className="gradient-text">Nyvel</span> works
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
            Simple for companies. Rewarding for testers. Fast for everyone.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-14">
          <div className="flex bg-slate-900 border border-white/10 rounded-xl p-1 gap-1">
            <button
              onClick={() => setTab('company')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150
                ${tab === 'company' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <Briefcase size={16} />
              For Companies
            </button>
            <button
              onClick={() => setTab('tester')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150
                ${tab === 'tester' ? 'bg-accent-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <User size={16} />
              For Testers
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, idx) => (
            <div key={step.num} className="relative group">
              {/* Connector arrow */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full z-10 -translate-x-1/2">
                  <ArrowRight size={18} className="text-slate-700" />
                </div>
              )}
              <div className="glass-card rounded-2xl p-6 h-full hover:border-brand-500/30 transition-colors">
                <div className={`font-mono text-4xl font-bold mb-4 ${tab === 'company' ? 'text-brand-500/40' : 'text-accent-500/40'}`}>
                  {step.num}
                </div>
                <h3 className="font-display font-bold text-white text-base mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
