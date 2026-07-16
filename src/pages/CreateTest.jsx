import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, FlaskConical, Users, Eye } from 'lucide-react';
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
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
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
  });

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

  const handleLaunch = async () => {
    setLaunching(true);
    await new Promise((res) => setTimeout(res, 1200));

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

    navigate('/company/dashboard');
  };

  return (
    <PlatformLayout title="Create New Test">
      <div className="p-6 max-w-3xl mx-auto">
        <Stepper steps={steps} currentStep={step} />

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
                {testTypeOptions.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set('type', t.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all
                      ${form.type === t.id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 dark:border-brand-400'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    <span className="text-2xl leading-none">{t.icon}</span>
                    <div>
                      <p className={`text-xs font-semibold ${form.type === t.id ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {t.label}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                ))}
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

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => goToStep(2)}
                disabled={!form.name || !form.type || !form.startDate || !form.endDate || form.endDate < form.startDate}
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
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleArray('platforms', p)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all
                      ${form.platforms.includes(p)
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Tester Expertise</label>
              <div className="flex flex-wrap gap-2">
                {expertiseOptions.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => toggleArray('expertise', e)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all
                      ${form.expertise.includes(e)
                        ? 'bg-accent-500 border-accent-500 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-accent-300 dark:hover:border-accent-700'}`}
                  >
                    {e}
                  </button>
                ))}
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

            <div className="flex justify-between pt-2">
              <Button variant="secondary" onClick={() => goToStep(1)}>Back</Button>
              <Button
                onClick={() => goToStep(3)}
                disabled={form.platforms.length === 0 || !!errors.compensation}
                iconRight={<ChevronRight size={16} />}
              >
                Review Test
              </Button>
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
      </div>
    </PlatformLayout>
  );
}
