import React from 'react';
import { Check } from 'lucide-react';

export default function Stepper({ steps, currentStep, variant = 'default' }) {
  const compact = variant === 'compact';
  const doneBg = compact ? 'bg-emerald-500' : 'bg-brand-600';
  const lineDone = compact ? 'bg-emerald-400' : 'bg-brand-500';

  return (
    <div className="flex items-center mb-10">
      {steps.map((s, idx) => {
        const done = currentStep > s.id;
        const active = currentStep === s.id;
        const Icon = s.icon;
        return (
          <React.Fragment key={s.id}>
            <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
              <div
                className={`rounded-full flex items-center justify-center flex-shrink-0 transition-all
                  ${compact ? 'w-8 h-8 text-xs' : 'w-9 h-9'}
                  ${done ? `${doneBg} text-white` : active ? 'bg-brand-600 text-white shadow-glow' : 'bg-slate-100 text-slate-400'}`}
              >
                {done ? <Check size={compact ? 14 : 16} /> : <Icon size={compact ? 14 : 16} />}
              </div>
              {compact ? (
                <span className={`text-xs font-medium hidden sm:block ${active ? 'text-brand-600' : done ? 'text-slate-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              ) : (
                <div>
                  <p className={`text-xs font-semibold ${active ? 'text-brand-600' : done ? 'text-slate-700' : 'text-slate-400'}`}>
                    Step {s.id}
                  </p>
                  <p className={`text-sm font-medium hidden sm:block ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                    {s.label}
                  </p>
                </div>
              )}
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${compact ? 'mx-3' : 'mx-4'} transition-colors ${done ? lineDone : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
