import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Building2, UserRound } from 'lucide-react';
import NyvelMark from '../components/ui/NyvelMark';
import Button from '../components/ui/Button';
import { EMPTY_REQUEST, validateAccessRequest, submitAccessRequest } from '../lib/accessRequests';

const COPY = {
  company: {
    title: 'Request access',
    intro: 'Tell us what you want to test. Nyvel is in private beta, and we review every request by hand.',
    panelTitle: 'Test with real people',
    panelBody: 'Post a test, choose vetted testers who apply, and review their findings in one place.',
    messageLabel: 'What do you want to test?',
    messagePlaceholder: 'e.g. The checkout flow in our iOS app before launch',
    submit: 'Request access',
  },
  tester: {
    title: 'Apply to test',
    intro: "Get paid to test products before they launch. Tell us a little about you and we'll be in touch.",
    panelTitle: 'Get paid to test',
    panelBody: 'Companies post tests with a fixed payment. Apply to the ones that fit, report what you find, and get paid for accepted findings.',
    messageLabel: 'Your testing experience (optional)',
    messagePlaceholder: 'e.g. Two years of QA on mobile banking apps',
    submit: 'Apply to test',
  },
};

const inputClass =
  'form-input bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:ring-brand-500';

function Field({ id, label, error, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className="form-label text-slate-300">
        {label}
        {optional && <span className="text-slate-400 font-normal"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-error-400 mt-1">{error}</p>
      )}
    </div>
  );
}

export default function RequestAccess() {
  const [searchParams, setSearchParams] = useSearchParams();
  const kind = searchParams.get('type') === 'tester' ? 'tester' : 'company';
  const copy = COPY[kind];

  const [form, setForm] = useState(EMPTY_REQUEST);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [sentTo, setSentTo] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const switchKind = (next) => {
    setErrors({});
    setSubmitError('');
    setSearchParams(next === 'tester' ? { type: 'tester' } : {}, { replace: true });
  };
  const fieldProps = (key) => ({
    id: `ra-${key}`,
    value: form[key],
    onChange: set(key),
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `ra-${key}-error` : undefined,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const found = validateAccessRequest(kind, form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    const { error } = await submitAccessRequest(kind, form);
    setSubmitting(false);
    if (error) {
      setSubmitError(error.message || 'Something went wrong. Please try again.');
      return;
    }
    setSentTo(form.email.trim());
    setForm(EMPTY_REQUEST);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-gradient-to-br from-slate-900 to-slate-950 border-r border-white/10 p-12">
        <div>
          <Link to="/" className="flex items-center gap-2.5 mb-16">
            <NyvelMark size={36} className="rounded-xl shadow-glow" />
            <span className="font-display font-bold text-white text-xl">
              Ny<span className="text-brand-400">vel</span>
            </span>
          </Link>
          <h2 className="font-display text-3xl font-bold text-white leading-tight mb-4">{copy.panelTitle}</h2>
          <p className="text-slate-400 text-base leading-relaxed">{copy.panelBody}</p>
        </div>
        <p className="text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-12 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <NyvelMark size={32} className="rounded-lg" />
            <span className="font-display font-bold text-white text-lg">
              Ny<span className="text-brand-400">vel</span>
            </span>
          </Link>

          {sentTo ? (
            <div>
              <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mb-5">
                <CheckCircle2 size={24} className="text-brand-400" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Thanks, we&apos;ve got it</h1>
              <p className="text-slate-400 text-sm mb-8">
                We review requests by hand and will reply to <span className="text-slate-200">{sentTo}</span>.
                There&apos;s no automatic confirmation email yet.
              </p>
              <Link to="/" className="text-sm text-brand-400 hover:text-brand-300 font-medium">Back to the home page</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 p-1 mb-8 rounded-xl bg-slate-900 border border-white/10" role="group" aria-label="I am a">
                {[
                  { id: 'company', label: 'Company', icon: Building2 },
                  { id: 'tester', label: 'Tester', icon: UserRound },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={kind === id}
                    onClick={() => switchKind(id)}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      kind === id ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon size={15} aria-hidden="true" /> {label}
                  </button>
                ))}
              </div>

              <h1 className="font-display text-2xl font-bold text-white mb-1">{copy.title}</h1>
              <p className="text-slate-400 text-sm mb-8">{copy.intro}</p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Field id="ra-name" label="Your name" error={errors.name}>
                  <input type="text" autoComplete="name" className={inputClass} {...fieldProps('name')} />
                </Field>
                <Field id="ra-email" label={kind === 'company' ? 'Work email' : 'Email'} error={errors.email}>
                  <input type="email" autoComplete="email" className={inputClass} {...fieldProps('email')} />
                </Field>

                {kind === 'company' ? (
                  <>
                    <Field id="ra-companyName" label="Company" error={errors.companyName}>
                      <input type="text" autoComplete="organization" className={inputClass} {...fieldProps('companyName')} />
                    </Field>
                    <Field id="ra-website" label="Website" optional>
                      <input type="url" autoComplete="url" placeholder="https://" className={inputClass} {...fieldProps('website')} />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field id="ra-country" label="Country" optional>
                      <input type="text" autoComplete="country-name" className={inputClass} {...fieldProps('country')} />
                    </Field>
                    <Field id="ra-devices" label="Devices you can test on" optional error={errors.devices}>
                      <input type="text" placeholder="e.g. iPhone 14, Windows laptop" className={inputClass} {...fieldProps('devices')} />
                    </Field>
                  </>
                )}

                <Field id="ra-message" label={copy.messageLabel} error={errors.message}>
                  <textarea rows={3} placeholder={copy.messagePlaceholder} className={`${inputClass} resize-none`} {...fieldProps('message')} />
                </Field>

                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="ra-nickname">Leave this empty</label>
                  <input id="ra-nickname" type="text" tabIndex={-1} autoComplete="off" value={form.nickname} onChange={set('nickname')} />
                </div>

                {submitError && <p className="text-sm text-error-400" role="alert">{submitError}</p>}

                <Button type="submit" className="w-full mt-2" size="lg" loading={submitting}
                  iconRight={!submitting && <ArrowRight size={18} />}>
                  {copy.submit}
                </Button>
                <p className="text-xs text-slate-400">
                  We only use these details to reply to your request.
                </p>
              </form>

              <p className="lg:hidden mt-8 text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
