import React, { useState, useCallback } from 'react';
import { Save, Bell, Lock, Globe, Zap, AlertCircle } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import Button from '../components/ui/Button';
import {
  validatePlatformName,
  validateRateLimit,
  validateTimeout,
  validateConcurrentTests,
  safeProp,
} from '../utils/validation';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platform: {
      name: 'Nyvel Platform',
      timezone: 'UTC',
      maintenanceMode: false,
      allowSignups: true,
    },
    notifications: {
      criticalAlerts: true,
      testUpdates: true,
      companyReports: true,
      weeklyDigest: true,
      emailNotifications: true,
    },
    features: {
      betaFeatures: false,
      advancedReporting: true,
      apiAccess: true,
      customIntegrations: true,
      whiteLabel: false,
    },
    limits: {
      maxTestsPerCompany: '∞',
      maxTestersPerTest: '5000',
      maxUploadSize: '500 MB',
      sessionTimeout: '24 hours',
    },
    advanced: {
      apiRateLimit: 1000,
      webhookTimeout: 30,
      maxConcurrentTests: 5000,
    },
  });

  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const validateSettings = useCallback(() => {
    const newErrors = {};

    // Validate platform name
    const nameError = validatePlatformName(settings.platform.name);
    if (nameError) newErrors.platformName = nameError;

    // Validate API rate limit
    const rateLimitError = validateRateLimit(settings.advanced.apiRateLimit);
    if (rateLimitError) newErrors.apiRateLimit = rateLimitError;

    // Validate webhook timeout
    const timeoutError = validateTimeout(settings.advanced.webhookTimeout);
    if (timeoutError) newErrors.webhookTimeout = timeoutError;

    // Validate concurrent tests
    const concurrentError = validateConcurrentTests(settings.advanced.maxConcurrentTests);
    if (concurrentError) newErrors.maxConcurrentTests = concurrentError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [settings]);

  const handleSave = useCallback(() => {
    if (validateSettings()) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }, [validateSettings]);

  const toggleSetting = useCallback((category, key) => {
    try {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: !safeProp(prev, `${category}.${key}`, false),
        },
      }));
      // Clear error for this field when user interacts
      if (errors[key]) {
        setErrors(prev => ({ ...prev, [key]: undefined }));
      }
    } catch (err) {
      console.error('Error toggling setting:', err);
    }
  }, [errors]);

  const updateSetting = useCallback((category, key, value) => {
    try {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      }));
      // Clear error for this field when user interacts
      if (errors[key]) {
        setErrors(prev => ({ ...prev, [key]: undefined }));
      }
    } catch (err) {
      console.error('Error updating setting:', err);
    }
  }, [errors]);

  return (
    <PlatformLayout title="Settings">
      <div className="p-6 space-y-6">
        {/* Error Alert */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Validation Errors</p>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                {Object.entries(errors).map(([key, error]) => (
                  error && <li key={key}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">Platform Settings</h2>
            <p className="text-sm text-slate-500 mt-0.5">Configure platform behavior, features, and constraints</p>
          </div>
          <Button
            variant="primary"
            icon={<Save size={16} />}
            onClick={handleSave}
            disabled={Object.keys(errors).length > 0}
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>

        {/* Platform Settings */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-brand-600" />
            Platform Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Platform Name</label>
              <input
                type="text"
                value={settings.platform.name}
                onChange={(e) => updateSetting('platform', 'name', e.target.value)}
                onBlur={() => {
                  const error = validatePlatformName(settings.platform.name);
                  setErrors(prev => ({ ...prev, platformName: error }));
                }}
                className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                  errors.platformName
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-slate-200 focus:ring-brand-500'
                }`}
              />
              {errors.platformName && (
                <p className="text-sm text-red-600 mt-1">{errors.platformName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Default Timezone</label>
              <select
                value={settings.platform.timezone}
                onChange={(e) => updateSetting('platform', 'timezone', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option>UTC</option>
                <option>EST</option>
                <option>CST</option>
                <option>MST</option>
                <option>PST</option>
                <option>GMT</option>
                <option>IST</option>
              </select>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="font-medium text-slate-700">Maintenance Mode</p>
                <p className="text-xs text-slate-500 mt-1">Temporarily disable platform access</p>
              </div>
              <button
                onClick={() => toggleSetting('platform', 'maintenanceMode')}
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.platform.maintenanceMode
                    ? 'bg-red-500'
                    : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-all ${
                    settings.platform.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="font-medium text-slate-700">Allow New Signups</p>
                <p className="text-xs text-slate-500 mt-1">Enable registration for new users</p>
              </div>
              <button
                onClick={() => toggleSetting('platform', 'allowSignups')}
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.platform.allowSignups
                    ? 'bg-emerald-500'
                    : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-all ${
                    settings.platform.allowSignups ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Bell size={20} className="text-cyan-600" />
            Notifications & Alerts
          </h3>
          <div className="space-y-3">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
                <button
                  onClick={() => toggleSetting('notifications', key)}
                  className={`w-10 h-6 rounded-full transition-all ${
                    value ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-all ${
                      value ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-amber-600" />
            Feature Flags
          </h3>
          <div className="space-y-3">
            {Object.entries(settings.features).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
                <button
                  onClick={() => toggleSetting('features', key)}
                  className={`w-10 h-6 rounded-full transition-all ${
                    value ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-all ${
                      value ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Limits */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Lock size={20} className="text-red-600" />
            Platform Limits & Quotas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(settings.limits).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateSetting('limits', key, e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Advanced Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">API Rate Limit (requests/min)</label>
              <input
                type="number"
                value={settings.advanced.apiRateLimit}
                onChange={(e) => updateSetting('advanced', 'apiRateLimit', Number(e.target.value))}
                onBlur={() => {
                  const error = validateRateLimit(settings.advanced.apiRateLimit);
                  setErrors(prev => ({ ...prev, apiRateLimit: error }));
                }}
                className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                  errors.apiRateLimit
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-slate-200 focus:ring-brand-500'
                }`}
                min="1"
                max="100000"
              />
              {errors.apiRateLimit && (
                <p className="text-sm text-red-600 mt-1">{errors.apiRateLimit}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">Valid range: 1 - 100,000 requests/min</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Webhook Timeout (seconds)</label>
              <input
                type="number"
                value={settings.advanced.webhookTimeout}
                onChange={(e) => updateSetting('advanced', 'webhookTimeout', Number(e.target.value))}
                onBlur={() => {
                  const error = validateTimeout(settings.advanced.webhookTimeout);
                  setErrors(prev => ({ ...prev, webhookTimeout: error }));
                }}
                className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                  errors.webhookTimeout
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-slate-200 focus:ring-brand-500'
                }`}
                min="1"
                max="3600"
              />
              {errors.webhookTimeout && (
                <p className="text-sm text-red-600 mt-1">{errors.webhookTimeout}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">Valid range: 1 - 3600 seconds (1 hour max)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Concurrent Tests</label>
              <input
                type="number"
                value={settings.advanced.maxConcurrentTests}
                onChange={(e) => updateSetting('advanced', 'maxConcurrentTests', Number(e.target.value))}
                onBlur={() => {
                  const error = validateConcurrentTests(settings.advanced.maxConcurrentTests);
                  setErrors(prev => ({ ...prev, maxConcurrentTests: error }));
                }}
                className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                  errors.maxConcurrentTests
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-slate-200 focus:ring-brand-500'
                }`}
                min="1"
                max="100000"
              />
              {errors.maxConcurrentTests && (
                <p className="text-sm text-red-600 mt-1">{errors.maxConcurrentTests}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">Valid range: 1 - 100,000 tests</p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-6">
          <h3 className="font-semibold text-red-900 mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-900">Clear Cache</p>
                <p className="text-xs text-red-700 mt-1">Remove all cached data</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Clear Cache
              </button>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-red-200">
              <div>
                <p className="font-medium text-red-900">Reset Analytics</p>
                <p className="text-xs text-red-700 mt-1">Clear all analytics data (irreversible)</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        {saved && (
          <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Settings saved successfully!
          </div>
        )}
      </div>
    </PlatformLayout>
  );
}
