import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, FlaskConical, Users, Eye, Circle, CheckCircle2, Square, CheckSquare, RotateCcw, Check } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import Button from '../components/ui/Button';
import Stepper from '../components/ui/Stepper';
import { useAppData } from '../context/DataContext';
import { validators } from '../utils/validation';
import { duration, ease } from '../motion/tokens';

// Step panels slide/fade in the direction of travel (forward = from the right)
const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0, transition: { duration: duration.slow, ease: ease.out } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -24 : 24, transition: { duration: duration.fast, ease: ease.in } }),
};

const testTypeOptions = [
  { id: 'bug-hunt', label: 'Bug Hunt', icon: '🐛', desc: 'Find defects & crashes', canonical: 'Bug Hunt' },
  { id: 'usability', label: 'Usability Study', icon: '🎯', desc: 'UX feedback & recordings', canonical: 'Usability' },
  { id: 'load-test', label: 'Load Test', icon: '⚡', desc: 'Performance under load', canonical: 'Load Test' },
  { id: 'multi-day', label: 'Multi-Day Study', icon: '📅', desc: 'Longitudinal feedback', canonical: 'Multi-Day' },
  { id: 'fintech', label: 'Fintech & Payments', icon: '💳', desc: 'Real transaction testing', canonical: 'Fintech' },
  { id: 'game', label: 'Game Playtesting', icon: '🎮', desc: 'Multiplayer & performance', canonical: 'Game' },
];

const platforms = ['iOS', 'Android', 'Web', 'macOS', 'Windows', 'API'];
const expertiseOptions = ['General Consumer', 'Developer', 'QA Professional', 'Domain Expert', 'Power User'];

const steps = [
  { id: 1, label: 'Test Details', icon: FlaskConical },
  { id: 2, label: 'Tester Criteria', icon: Users },
  { id: 3, label: 'Review & Launch', icon: Eye },
];

// Shared selection indicator — radio-style (single-select) or checkbox-style
// (multi-select), teal-filled + check when selected, empty grey outline when not.
// Used by both the Step 1 test-type cards and the Step 2 platform/expertise
// cards so both steps share one selection affordance instead of two.
function SelectIcon({ selected, multi = false, size = 20 }) {
  const className = selected ? 'text-brand-600 dark:text-brand-400 flex-shrink-0' : 'text-slate-300 dark:text-slate-600 flex-shrink-0';
  if (multi) {
    return selected ? <CheckSquare size={size} className={className} /> : <Square size={size} className={className} />;
  }
  return selected ? <CheckCircle2 size={size} className={className} /> : <Circle size={size} className={className} />;
}

// "a, b and c" — readable English list for the missing-fields hint
const joinReadable = (items) => {
  if (items.length <= 1) return items[0] || '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
};

export default function CreateTest() {
  const navigate = useNavigate();
  const { addCompanyTest } = useAppData();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const goToStep = (next) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [launchedName, setLaunchedName] = useState('');
  const [errors, setErrors] = useState({});
  const initialForm = {
    name: '',
    type: '',
    description: '',
    startDate: '',
    endDate: '',
    testerCount: 20,
    platforms: [],
    expertise: [],
    ageRange: '18-65',
    countries: 'United States',
    compensation: 35,
    nda: true,
    briefing: '',
  };
  const [form, setForm] = useState(initialForm);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    validateField(key, val);
  };

  const validateField = (field, value) => {
    let error = null;

    if (field === 'compensation') {
      error = validators.number(value, 10, 1000);
    }

    setErrors((prev) => {
      if (error) {
        return { ...prev, [field]: error };
      }
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const toggleArray = (key, val) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((v) => v !== val) : [...f[key], val],
    }));

  // Named so the disabled Continue button can explain itself instead of
  // just going gray with no indication of what's missing.
  const step1Missing = [];
  if (!form.name) step1Missing.push('a test name');
  if (!form.type) step1Missing.push('a test type');
  if (!form.startDate) step1Missing.push('a start date');
  if (!form.endDate) step1Missing.push('an end date');
  const step1DateOrderInvalid = form.startDate && form.endDate && form.endDate < form.startDate;
  const step1CanContinue = step1Missing.length === 0 && !step1DateOrderInvalid;

  const step2CanContinue = form.platforms.length > 0 && !errors.compensation;

  const handleLaunch = async () => {
    setLaunching(true);
    await new Promise((res) => setTimeout(res, 1100));

    const selectedType = testTypeOptions.find((t) => t.id === form.type);
    addCompanyTest({
      id: `NV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: form.name,
      type: selectedType?.canonical || 'Bug Hunt',
      status: 'Active',
      testers: 0,
      target: form.testerCount,
      dueDate: form.endDate,
      issues: 0,
      criticalIssues: 0,
      platform: form.platforms,
    });

    setLaunchedName(form.name || 'Your test');
    setLaunching(false);
    setLaunched(true);
  };

  const resetWizard = () => {
    setForm(initialForm);
    setErrors({});
    setLaunched(false);
    goToStep(1);
  };

  return (
    <PlatformLayout title="Create New Test">
      <div className="p-6 max-w-3xl mx-auto">
        <Stepper steps={steps} currentStep={step} />

        {launched ? (
          <div className="card rounded-2xl p-10 flex flex-col items-center text-center">
            <div className="w-[52px] h-[52px] rounded-full bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 flex items-center justify-center mb-4">
              <Check size={26} strokeWidth={2.5} />
            </div>
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-50 mb-1.5">Test launched</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
              {launchedName} is live. Matching testers are being notified now — first results usually arrive within 24 hours.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="secondary" icon={<RotateCcw size={14} />} onClick={resetWizard}>
                Create another test
              </Button>
              <Button onClick={() => navigate('/company/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        ) : (
        <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div key={step} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit">

        {/* Step 1: Test Details */}
        {step === 1 && (
          <div className="card rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-50">Test Details</h2>

            <div>
              <label className="form-label" htmlFor="test-name">Test Name *</label>
              <input
                id="test-name"
                type="text"
                className="form-input"
                placeholder="e.g., Mobile App v3.1 — Bug Hunt"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Test Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {testTypeOptions.map((t) => {
                  const selected = form.type === t.id;
                  return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set('type', t.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border-[1.5px] text-left transition-all
                      ${selected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 dark:border-brand-400'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-800/60'}`}
                  >
                    <SelectIcon selected={selected} />
                    <span className="text-2xl leading-none">{t.icon}</span>
                    <div>
                      <p className={`text-xs font-semibold ${selected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {t.label}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="test-description">Description</label>
              <textarea
                id="test-description"
                className="form-input min-h-[100px] resize-none"
                placeholder="Describe what testers should focus on, known issues to investigate, or key user flows to test..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="test-start-date">Start Date *</label>
                <input id="test-start-date" type="date" className="form-input" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </div>
              <div>
                <label className="form-label" htmlFor="test-end-date">End Date *</label>
                <input
                  id="test-end-date"
                  type="date"
                  className="form-input"
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={(e) => set('endDate', e.target.value)}
                />
              </div>
            </div>
            {form.startDate && form.endDate && form.endDate < form.startDate && (
              <p className="text-xs text-error-600 dark:text-error-400 -mt-3">End date must be on or after the start date.</p>
            )}

            <div className="flex flex-col items-end gap-2 pt-2">
              {step1Missing.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter {joinReadable(step1Missing)} to continue.
                </p>
              )}
              <Button
                onClick={() => goToStep(2)}
                disabled={!step1CanContinue}
                iconRight={<ChevronRight size={16} />}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Tester Criteria */}
        {step === 2 && (
          <div className="card rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-50">Tester Criteria</h2>

            <div>
              <label className="form-label">Number of Testers: <span className="text-brand-600 dark:text-brand-400 font-bold">{form.testerCount}</span></label>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={form.testerCount}
                onChange={(e) => set('testerCount', Number(e.target.value))}
                className="w-full accent-brand-600 mt-1"
              />
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
                <span>5</span><span>200</span>
              </div>
            </div>

            <div>
              <label className="form-label">Target Platforms *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {platforms.map((p) => {
                  const selected = form.platforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleArray('platforms', p)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-[1.5px] text-left transition-all
                        ${selected
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 dark:border-brand-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-800/60'}`}
                    >
                      <SelectIcon selected={selected} multi size={18} />
                      <span className={`text-sm font-semibold ${selected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {p}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="form-label">Tester Expertise</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {expertiseOptions.map((e) => {
                  const selected = form.expertise.includes(e);
                  return (
                    <button
                      key={e}
                      type="button"
                      onClick={() => toggleArray('expertise', e)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-[1.5px] text-left transition-all
                        ${selected
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 dark:border-brand-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-800/60'}`}
                    >
                      <SelectIcon selected={selected} multi size={18} />
                      <span className={`text-sm font-semibold ${selected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {e}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="test-countries">Country / Region</label>
                <input
                  id="test-countries"
                  type="text"
                  className="form-input"
                  value={form.countries}
                  onChange={(e) => set('countries', e.target.value)}
                  placeholder="United States, UK, Global..."
                />
              </div>
              <div>
                <label className="form-label" htmlFor="test-compensation">Tester Compensation ($)</label>
                <input
                  id="test-compensation"
                  type="number"
                  className={`form-input ${errors.compensation ? 'error' : ''}`}
                  value={form.compensation}
                  onChange={(e) => set('compensation', e.target.value ? Number(e.target.value) : '')}
                  min="10"
                  max="1000"
                  step="5"
                  placeholder="Enter amount (10-1000)"
                />
                {errors.compensation && (
                  <p className="form-error">{errors.compensation}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <input
                type="checkbox"
                id="nda"
                checked={form.nda}
                onChange={(e) => set('nda', e.target.checked)}
                className="w-4 h-4 accent-brand-600"
              />
              <label htmlFor="nda" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                Require NDA agreement from testers (recommended for unreleased products)
              </label>
            </div>

            <div className="flex items-end justify-between pt-2">
              <Button variant="secondary" onClick={() => goToStep(1)}>Back</Button>
              <div className="flex flex-col items-end gap-2">
                {form.platforms.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select at least one platform to continue.</p>
                )}
                <Button
                  onClick={() => goToStep(3)}
                  disabled={!step2CanContinue}
                  iconRight={<ChevronRight size={16} />}
                >
                  Review Test
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="card rounded-2xl p-6">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-50 mb-5">Review Your Test</h2>

              <div className="space-y-3">
                {[
                  { label: 'Test Name', value: form.name },
                  { label: 'Type', value: testTypeOptions.find((t) => t.id === form.type)?.label },
                  { label: 'Duration', value: `${form.startDate} → ${form.endDate}` },
                  { label: 'Testers Needed', value: `${form.testerCount} testers` },
                  { label: 'Platforms', value: form.platforms.join(', ') || 'Not specified' },
                  { label: 'Expertise', value: form.expertise.join(', ') || 'General' },
                  { label: 'Countries', value: form.countries },
                  { label: 'Compensation per Tester', value: `$${form.compensation}` },
                  { label: 'Estimated Total Cost', value: `$${(form.testerCount * form.compensation).toLocaleString()}` },
                  { label: 'NDA Required', value: form.nda ? 'Yes' : 'No' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-800/50 rounded-xl p-4 text-sm text-brand-800 dark:text-brand-200">
              <p className="font-semibold mb-1">Ready to launch?</p>
              <p className="text-brand-700 dark:text-brand-300">Your test will go live immediately and testers will be notified within minutes. You can pause or modify the test at any time from your dashboard.</p>
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => goToStep(2)}>Back</Button>
              <Button onClick={handleLaunch} loading={launching} size="lg">
                {launching ? 'Launching...' : '🚀 Launch Test'}
              </Button>
            </div>
          </div>
        )}
        </motion.div>
        </AnimatePresence>
        )}
      </div>
    </PlatformLayout>
  );
}
