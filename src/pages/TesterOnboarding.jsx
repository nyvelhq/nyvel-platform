import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, Monitor, Code, Camera } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import Button from '../components/ui/Button';
import Stepper from '../components/ui/Stepper';
import { useAuth } from '../App';

const deviceOptions = ['iPhone', 'iPad', 'Android Phone', 'Android Tablet', 'MacBook', 'Windows PC', 'Linux'];
const osVersions = ['iOS 17', 'iOS 16', 'Android 14', 'Android 13', 'macOS Sonoma', 'Windows 11', 'Windows 10'];
const skillOptions = ['Mobile Testing', 'Web Testing', 'API Testing', 'Accessibility', 'Performance', 'Security', 'Gaming', 'Fintech', 'Healthcare', 'E-Commerce'];
const connectionTypes = ['5G', 'LTE/4G', 'WiFi (Fast)', 'WiFi (Standard)', 'Limited/Rural'];

const steps = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Devices & Setup', icon: Monitor },
  { id: 3, label: 'Skills & Expertise', icon: Code },
  { id: 4, label: 'Complete Profile', icon: Camera },
];

export default function TesterOnboarding() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', country: 'United States', city: '',
    age: '', occupation: '',
    devices: [], osVersions: [], connection: '',
    skills: [], yearsExp: '1-3',
    bio: '', linkedin: '',
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const toggleArr = (key, val) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((v) => v !== val) : [...f[key], val],
    }));

  const handleComplete = async () => {
    setSubmitting(true);
    await new Promise((res) => setTimeout(res, 1000));
    updateUser({
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
    navigate('/tester/dashboard');
  };

  return (
    <PlatformLayout title="Complete Your Profile">
      <div className="p-6 max-w-2xl mx-auto">
        <Stepper steps={steps} currentStep={step} variant="compact" />

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-slate-900 mb-5">Tell us about yourself</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name *</label>
                  <input className="form-input" placeholder="Jane" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <input className="form-input" placeholder="Smith" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Country</label>
                  <input className="form-input" value={form.country} onChange={(e) => set('country', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <input className="form-input" placeholder="San Francisco" value={form.city} onChange={(e) => set('city', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Age</label>
                  <select className="form-input" value={form.age} onChange={(e) => set('age', e.target.value)}>
                    <option value="">Select age range</option>
                    {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Occupation</label>
                  <input className="form-input" placeholder="Software Engineer" value={form.occupation} onChange={(e) => set('occupation', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display font-bold text-xl text-slate-900 mb-5">Your devices & setup</h2>
              <div>
                <label className="form-label">Devices you own (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {deviceOptions.map((d) => (
                    <button key={d} type="button" onClick={() => toggleArr('devices', d)}
                      className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-all
                        ${form.devices.includes(d) ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">OS Versions available</label>
                <div className="flex flex-wrap gap-2">
                  {osVersions.map((o) => (
                    <button key={o} type="button" onClick={() => toggleArr('osVersions', o)}
                      className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-all
                        ${form.osVersions.includes(o) ? 'bg-accent-500 border-accent-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-accent-300'}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Primary Internet Connection</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {connectionTypes.map((c) => (
                    <button key={c} type="button" onClick={() => set('connection', c)}
                      className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all text-left
                        ${form.connection === c ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
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
              <h2 className="font-display font-bold text-xl text-slate-900 mb-5">Skills & expertise</h2>
              <div>
                <label className="form-label">Testing specialties (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((s) => (
                    <button key={s} type="button" onClick={() => toggleArr('skills', s)}
                      className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-all
                        ${form.skills.includes(s) ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Years of testing experience</label>
                <div className="grid grid-cols-4 gap-2">
                  {['< 1 year', '1-3 years', '3-5 years', '5+ years'].map((y) => (
                    <button key={y} type="button" onClick={() => set('yearsExp', y)}
                      className={`py-2 text-xs rounded-lg border font-medium transition-all
                        ${form.yearsExp === y ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-slate-200 text-slate-600'}`}>
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
              <h2 className="font-display font-bold text-xl text-slate-900 mb-5">Almost done!</h2>
              <div>
                <label className="form-label">Short Bio</label>
                <textarea
                  className="form-input resize-none"
                  rows={4}
                  placeholder="Tell companies a bit about yourself — your background, testing experience, and what you're passionate about..."
                  value={form.bio}
                  onChange={(e) => set('bio', e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">LinkedIn Profile (optional)</label>
                <input className="form-input" placeholder="https://linkedin.com/in/your-name" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} />
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-800">
                <p className="font-semibold mb-1">✅ Your profile is ready to launch</p>
                <p className="text-emerald-700 text-xs">
                  Once submitted, you'll be able to browse available tests and start earning. Your profile will be reviewed and verified within 24 hours.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-5 border-t border-slate-100">
            {step > 1 ? (
              <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button>
            ) : <div />}
            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 && (!form.firstName || !form.lastName)}
                iconRight={<ChevronRight size={16} />}
              >
                Continue
              </Button>
            ) : (
              <Button onClick={handleComplete} loading={submitting}>
                {submitting ? 'Setting up...' : 'Complete Profile'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}
