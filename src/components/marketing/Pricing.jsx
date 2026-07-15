import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pricingPlans } from '../../data/mockData';
import Button from '../ui/Button';

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-eyebrow mb-4">Pricing</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mt-2">
            Transparent pricing,{' '}
            <span className="gradient-text">real results</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
            Start with a free trial. No setup fees. Tester compensation is included in your plan.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl flex flex-col transition-all duration-300
                ${plan.highlighted
                  ? 'bg-brand-600 text-white shadow-glow scale-[1.03] border-2 border-brand-400'
                  : 'bg-white border border-slate-200 hover:border-brand-200 hover:shadow-lg'
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-accent-500 text-white text-xs font-bold rounded-full shadow-sm">
                    <Sparkles size={12} />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8 flex-1">
                <h3 className={`font-display font-bold text-xl mb-1 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-brand-200' : 'text-slate-500'}`}>
                  {plan.tagline}
                </p>

                <div className="mb-8">
                  {plan.price ? (
                    <div className="flex items-end gap-1">
                      <span className={`font-display text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                        ${plan.price}
                      </span>
                      <span className={`text-sm font-medium mb-2 ${plan.highlighted ? 'text-brand-200' : 'text-slate-400'}`}>
                        / {plan.period}
                      </span>
                    </div>
                  ) : (
                    <span className={`font-display text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                      Custom
                    </span>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check
                        size={16}
                        className={`flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-accent-300' : 'text-brand-500'}`}
                      />
                      <span className={plan.highlighted ? 'text-brand-100' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 pt-0">
                <Button
                  variant="outline"
                  className={`w-full ${plan.highlighted ? '!bg-white !border-white' : ''}`}
                  textColor={plan.highlighted ? '!text-slate-900' : ''}
                  onClick={() => navigate('/login')}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400 mt-10">
          All plans include a 14-day free trial. No credit card required.
          Tester compensation handled automatically by Nyvel.
        </p>
      </div>
    </section>
  );
}
