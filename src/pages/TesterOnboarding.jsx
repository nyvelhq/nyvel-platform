import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, User, Monitor, Code, Camera } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import Button from '../components/ui/Button';
import Stepper from '../components/ui/Stepper';
import { useAuth } from '../App';
import { useToast } from '../context/ToastContext';
import { duration, ease } from '../motion/tokens';

// Step content slides/fades in the direction of travel (forward = from the right)
const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 20 : -20 }),
  center: { opacity: 1, x: 0, transition: { duration: duration.slow, ease: ease.out } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -20 : 20, transition: { duration: duration.fast, ease: ease.in } }),
};

const deviceOptions = ['iPhone', 'iPad', 'Android Phone', 'Android Tablet', 'MacBook', 'Windows PC', 'Linux'];
const osVersions = ['iOS 17', 'iOS 16', 'Android 14', 'Android 13', 'macOS Sonoma', 'Windows 11', 'Windows 10'];
const skillOptions = ['Mobile Testing', 'Web Testing', 'API Testing', 'Accessibility', 'Performance', 'Security', 'Gaming', 'Fintech', 'Healthcare', 'E-Commerce'];
const connectionTypes = ['5G', 'LTE/4G', 'WiFi (Fast)', 'WiFi (Standard)', 'Limited/Rural'];

// "a, b and c" — readable English list for the missing-fields hint
const joinReadable = (items) => {
  if (items.length <= 1) return items[0] || '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
};

const steps = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Devices & Setup', icon: Monitor },
  { id: 3, label: 'Skills & Expertise', icon: Code },
  { id: 4, label: 'Complete Profile', icon: Camera },
];

export default function TesterOnboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  // Editing an already-complete profile should start from what's actually
  // saved, not a blank form — otherwise re-opening this wizard silently
  // wipes fields the user never touched this time around.
  const [form, setForm] = useState(() => {
    const [firstName = '', ...rest] = (user?.name || '').split(' ');
    return {
      firstName,
      lastName: rest.join(' '),
      country: user?.country || 'United States',
      city: user?.city || '',
      age: user?.age || '',
      occupation: user?.occupation || '',
      devices: user?.devices || [],
      osVersions: user?.osVersions || [],
      connection: user?.connection || '',
      skills: user?.skills || [],
      yearsExp: user?.yearsExp || '1-3 years',
      bio: user?.bio || '',
      linkedin: user?.linkedin || '',
    };
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const toggleArr = (key, val) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((v) => v !== val) : [...f[key], val],
    }));

  const linkedinInvalid = form.linkedin.trim() !== '' && !/^https?:\/\/\S+$/i.test(form.linkedin.trim());

  const step1Missing = [];
  if (!form.firstName) step1Missing.push('your first name');
  if (!form.lastName) step1Missing.push('your last name');

  const handleComplete = async () => {
    setSubmitting(true);
    const { error } = await updateUser({
      profileComplete: true,
      name: `${form.firstName} ${form.lastName}`.trim(),
      country: form.country,
      city: form.city,
      age: form.age,
      occupation: form.occupation,
      devices: form.devices,
      osVersions: form.osVersions,
      connection: form.connection,
      skills: form.skills,
      yearsExp: form.yearsExp,
      bio: form.bio,
      linkedin: form.linkedin,
    });
    setSubmitting(false);
    if (error) {
      addToast(`Couldn't save your profile: ${error.message || 'please try again.'}`, 'error');
      return;
    }
    addToast('Profile saved', 'success');
    navigate('/tester/dashboard');
  };

  return (
    <PlatformLayout title="Complete Your Profile">
      <div className="p-2 sm:p-6 max-w-2xl mx-auto">
        <Stepper steps={steps} currentStep={step} variant="compact" />

        <div className="card rounded-2xl p-6">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div key={step} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit">

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-50 mb-5">Tell us about yourself</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ob-first" className="form-label">First Name *</label>
                  <input id="ob-first" className="form-input" placeholder="Jane" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="ob-last" className="form-label">Last Name *</label>
                  <input id="ob-last" className="form-input" placeholder="Smith" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ob-country" className="form-label">Country</label>
                  <input id="ob-country" className="form-input" value={form.country} onChange={(e) => set('country', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="ob-city" className="form-label">City</label>
                  <input id="ob-city" className="form-input" placeholder="San Francisco" value={form.city} onChange={(e) => set('city', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ob-age" className="form-label">Age</label>
                  <select id="ob-age" className="form-input" value={form.age} onChange={(e) => set('age', e.target.value)}>
                    <option value="">Select age range</option>
                    {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="ob-occupation" className="form-label">Occupation</label>
                  <input id="ob-occupation" className="form-input" placeholder="Software Engineer" value={form.occupation} onChange={(e) => set('occupation', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-50 mb-5">Your devices & setup</h2>
              <div>
                <p id="ob-devices" className="form-label">Devices you own (select all that apply)</p>
                <div role="group" aria-labelledby="ob-devices" className="flex flex-wrap gap-2">
                  {deviceOptions.map((d) => (
                    <button key={d} type="button" aria-pressed={form.devices.includes(d)} onClick={() => toggleArr('devices', d)}
                      className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-all
                        ${form.devices.includes(d) ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p id="ob-os" className="form-label">OS Versions available</p>
                <div role="group" aria-labelledby="ob-os" className="flex flex-wrap gap-2">
                  {osVersions.map((o) => (
                    <button key={o} type="button" aria-pressed={form.osVersions.includes(o)} onClick={() => toggleArr('osVersions', o)}
                      className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-all
                        ${form.osVersions.includes(o) ? 'bg-accent-500 border-accent-500 text-slate-950' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-accent-300 dark:hover:border-accent-700'}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p id="ob-connection" className="form-label">Primary Internet Connection</p>
                <div role="group" aria-labelledby="ob-connection" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {connectionTypes.map((c) => (
                    <button key={c} type="button" aria-pressed={form.connection === c} onClick={() => set('connection', c)}
                      className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all text-left
                        ${form.connection === c ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 dark:border-brand-400 text-brand-700 dark:text-brand-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-50 mb-5">Skills & expertise</h2>
              <div>
                <p id="ob-skills" className="form-label">Testing specialties (select all that apply)</p>
                <div role="group" aria-labelledby="ob-skills" className="flex flex-wrap gap-2">
                  {skillOptions.map((s) => (
                    <button key={s} type="button" aria-pressed={form.skills.includes(s)} onClick={() => toggleArr('skills', s)}
                      className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-all
                        ${form.skills.includes(s) ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p id="ob-years" className="form-label">Years of testing experience</p>
                <div role="group" aria-labelledby="ob-years" className="grid grid-cols-4 gap-2">
                  {['< 1 year', '1-3 years', '3-5 years', '5+ years'].map((y) => (
                    <button key={y} type="button" aria-pressed={form.yearsExp === y} onClick={() => set('yearsExp', y)}
                      className={`py-2 text-xs rounded-lg border font-medium transition-all
                        ${form.yearsExp === y ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 dark:border-brand-400 text-brand-700 dark:text-brand-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-50 mb-5">Almost done!</h2>
              <div>
                <label htmlFor="ob-bio" className="form-label">Short Bio</label>
                <textarea
                  id="ob-bio"
                  className="form-input resize-none"
                  rows={4}
                  maxLength={2000}
                  placeholder="Tell companies a bit about yourself — your background, testing experience, and what you're passionate about..."
                  value={form.bio}
                  onChange={(e) => set('bio', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="ob-linkedin" className="form-label">LinkedIn Profile (optional)</label>
                <input
                  id="ob-linkedin"
                  className="form-input"
                  placeholder="https://linkedin.com/in/your-name"
                  maxLength={300}
                  aria-invalid={linkedinInvalid}
                  value={form.linkedin}
                  onChange={(e) => set('linkedin', e.target.value)}
                />
                {linkedinInvalid && (
                  <p className="text-xs text-error-600 dark:text-error-400 mt-1">Enter a full link starting with https://</p>
                )}
              </div>

              <div className="bg-success-50/70 dark:bg-success-900/20 border border-success-200/70 dark:border-success-800/50 rounded-xl p-4 text-sm text-success-800 dark:text-success-200">
                <p className="font-semibold mb-1">Your profile is ready to save</p>
                <p className="text-success-700 dark:text-success-300 text-xs">
                  Your profile is saved to your account. Companies see your skills, devices, country and bio when you apply to their tests. Your city, age, occupation and LinkedIn stay private.
                </p>
              </div>
            </div>
          )}

          </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-end justify-between mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-700/50">
            {step > 1 ? (
              <Button variant="secondary" onClick={() => { setDirection(-1); setStep((s) => s - 1); }}>Back</Button>
            ) : <div />}
            {step < 4 ? (
              <div className="flex flex-col items-end gap-2">
                {step === 1 && step1Missing.length > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter {joinReadable(step1Missing)} to continue.
                  </p>
                )}
                <Button
                  onClick={() => { setDirection(1); setStep((s) => s + 1); }}
                  disabled={step === 1 && step1Missing.length > 0}
                  iconRight={<ChevronRight size={16} />}
                >
                  Continue
                </Button>
              </div>
            ) : (
              <Button onClick={handleComplete} loading={submitting} disabled={linkedinInvalid}>
                {submitting ? 'Setting up...' : 'Complete Profile'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}
