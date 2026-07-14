import React from 'react';
import Navbar from '../components/marketing/Navbar';
import Hero from '../components/marketing/Hero';
import TrustSignals from '../components/marketing/TrustSignals';
import Features from '../components/marketing/Features';
import HowItWorks from '../components/marketing/HowItWorks';
import Pricing from '../components/marketing/Pricing';
import Testimonials from '../components/marketing/Testimonials';
import Footer from '../components/marketing/Footer';
import { useNavigate } from 'react-router-dom';
import { testTypes } from '../data/mockData';
import Button from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';

const typeColorMap = {
  red: 'bg-red-50 border-red-100 text-red-700',
  violet: 'bg-violet-50 border-violet-100 text-violet-700',
  yellow: 'bg-amber-50 border-amber-100 text-amber-700',
  blue: 'bg-blue-50 border-blue-100 text-blue-700',
  green: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  purple: 'bg-purple-50 border-purple-100 text-purple-700',
  cyan: 'bg-cyan-50 border-cyan-100 text-cyan-700',
  orange: 'bg-orange-50 border-orange-100 text-orange-700',
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <TrustSignals />
      <Features />
      <HowItWorks />

      {/* Test Types Section */}
      <section id="test-types" className="py-24 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-eyebrow mb-4">Test Types</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mt-2">
              A test for every{' '}
              <span className="gradient-text">use case</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
              From rapid bug hunts to longitudinal studies — Nyvel has a purpose-built test type for your exact need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testTypes.map((type) => {
              const colorClass = typeColorMap[type.color] || typeColorMap.violet;
              return (
                <div
                  key={type.name}
                  className="card-interactive p-6 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 border ${colorClass}`}>
                    {type.icon}
                  </div>
                  <h3 className="font-display font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {type.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{type.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Strip — honest practices, not unearned certifications */}
      <section id="security" className="py-16 bg-slate-50 border-y border-slate-100 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">
                Security and confidentiality, built in
              </h3>
              <p className="text-slate-500 text-sm max-w-lg">
                Every tester signs an NDA before touching your product. Data is encrypted
                in transit and at rest, and our data handling is designed to support GDPR
                and CCPA requirements.
              </p>
            </div>
            <div className="flex items-center gap-8 flex-shrink-0">
              {[
                { k: 'NDA', label: 'Tester NDAs' },
                { k: 'Enc', label: 'Encrypted data' },
                { k: 'GDPR', label: 'GDPR-aligned' },
                { k: 'CCPA', label: 'CCPA-aligned' },
              ].map((item) => (
                <div key={item.k} className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-1 shadow-sm">
                    <span className="text-xs font-bold text-brand-600">{item.k}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Testimonials />
      <Pricing />

      {/* Final CTA */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate opacity-50 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-600/25 blur-[100px] rounded-full" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-5">
            Ready to ship your best product yet?
          </h2>
          <p className="text-lg text-slate-400 mb-10">
            Put professional-grade beta testing behind your next release — find bugs,
            improve UX, and launch with confidence. 14-day free trial. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 shadow-glow"
              onClick={() => navigate('/login')}
              iconRight={<ArrowRight size={18} />}
            >
              Start Your Free Trial
            </Button>
            <Button
              size="xl"
              variant="ghost"
              className="text-slate-300 hover:text-white border border-white/15 hover:bg-white/10"
              onClick={() => navigate('/login')}
            >
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
