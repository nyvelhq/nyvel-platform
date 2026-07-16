import React, { useState, useCallback } from 'react';
import { Save, Bell, Lock, Globe, Zap, AlertCircle } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import Button from '../components/ui/Button';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { ConfirmationModal } from '../components/admin/ConfirmationModal';
import { useToast } from '../context/ToastContext';
import {
  validatePlatformName,
  validateRateLimit,
  validateTimeout,
  validateConcurrentTests,
  safeProp,
} from '../utils/validation';

const dangerActions = {
  clearCache: {
    title: 'Clear Cache?',
    message: 'This removes all cached data platform-wide. Users may see a brief performance dip while the cache rebuilds.',
    confirmText: 'Clear Cache',
    successMessage: 'Cache cleared',
  },
  resetAnalytics: {
    title: 'Reset Analytics?',
    message: 'This permanently deletes all analytics data collected so far. This action cannot be undone.',
    confirmText: 'Reset Analytics',
    successMessage: 'Analytics data reset',
  },
};

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
  const [dangerAction, setDangerAction] = useState(null);
  const [dangerLoading, setDangerLoading] = useState(false);
  const { addToast } = useToast();

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

  const confirmDangerAction = useCallback(async () => {
    setDangerLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      addToast(dangerActions[dangerAction].successMessage, 'success');
      setDangerAction(null);
    } finally {
      setDangerLoading(false);
    }
  }, [dangerAction, addToast]);

  // Shared row shell for toggle lists
  const settingRow = 'flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg';

  return (
    <PlatformLayout title="Settings">
      <div className="p-6 space-y-6">
        {/* Error Alert */}
        {Object.keys(errors).length > 0 && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Validation Errors</p>
              <ul className="text-sm mt-2 space-y-1 opacity-90">
                {Object.entries(errors).map(([key, error]) => (
                  error && <li key={key}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">Platform Settings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure platform behavior, features, and constraints</p>
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
        <div className="card p-6 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-brand-600 dark:text-brand-400" aria-hidden="true" />
            Platform Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="form-label" htmlFor="platform-name">Platform Name</label>
              <input
                id="platform-name"
                type="text"
                value={settings.platform.name}
                onChange={(e) => updateSetting('platform', 'name', e.target.value)}
                onBlur={() => {
                  const error = validatePlatformName(settings.platform.name);
                  setErrors(prev => ({ ...prev, platformName: error }));
                }}
                className={`form-input text-sm ${errors.platformName ? 'error' : ''}`}
              />
              {errors.platformName && (
                <p className="form-error">{errors.platformName}</p>
              )}
            </div>
            <div>
              <label className="form-label" htmlFor="platform-timezone">Default Timezone</label>
              <select
                id="platform-timezone"
                value={settings.platform.timezone}
                onChange={(e) => updateSetting('platform', 'timezone', e.target.value)}
                className="form-select text-sm"
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
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-700/50">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300">Maintenance Mode</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Temporarily disable platform access</p>
              </div>
              <ToggleSwitch
                checked={settings.platform.maintenanceMode}
                onChange={() => toggleSetting('platform', 'maintenanceMode')}
                danger
                ariaLabel="Maintenance mode"
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-700/50">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300">Allow New Signups</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enable registration for new users</p>
              </div>
              <ToggleSwitch
                checked={settings.platform.allowSignups}
                onChange={() => toggleSetting('platform', 'allowSignups')}
                ariaLabel="Allow new signups"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card p-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Bell size={20} className="text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
            Notifications &amp; Alerts
          </h3>
          <div className="space-y-3">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className={settingRow}>
                <p className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <ToggleSwitch
                  checked={value}
                  onChange={() => toggleSetting('notifications', key)}
                  ariaLabel={key.replace(/([A-Z])/g, ' $1').trim()}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="card p-6 animate-fade-up" style={{ animationDelay: '220ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
            Feature Flags
          </h3>
          <div className="space-y-3">
            {Object.entries(settings.features).map(([key, value]) => (
              <div key={key} className={settingRow}>
                <p className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <ToggleSwitch
                  checked={value}
                  onChange={() => toggleSetting('features', key)}
                  ariaLabel={key.replace(/([A-Z])/g, ' $1').trim()}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Platform Limits */}
        <div className="card p-6 animate-fade-up" style={{ animationDelay: '290ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Lock size={20} className="text-error-600 dark:text-error-400" aria-hidden="true" />
            Platform Limits &amp; Quotas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(settings.limits).map(([key, value]) => (
              <div key={key}>
                <label className="form-label capitalize" htmlFor={`limit-${key}`}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  id={`limit-${key}`}
                  type="text"
                  value={value}
                  onChange={(e) => updateSetting('limits', key, e.target.value)}
                  className="form-input text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="card p-6 animate-fade-up" style={{ animationDelay: '360ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Advanced Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label" htmlFor="api-rate-limit">API Rate Limit (requests/min)</label>
              <input
                id="api-rate-limit"
                type="number"
                value={settings.advanced.apiRateLimit}
                onChange={(e) => updateSetting('advanced', 'apiRateLimit', Number(e.target.value))}
                onBlur={() => {
                  const error = validateRateLimit(settings.advanced.apiRateLimit);
                  setErrors(prev => ({ ...prev, apiRateLimit: error }));
                }}
                className={`form-input text-sm ${errors.apiRateLimit ? 'error' : ''}`}
                min="1"
                max="100000"
              />
              {errors.apiRateLimit && (
                <p className="form-error">{errors.apiRateLimit}</p>
              )}
              <p className="form-help">Valid range: 1 - 100,000 requests/min</p>
            </div>
            <div>
              <label className="form-label" htmlFor="webhook-timeout">Webhook Timeout (seconds)</label>
              <input
                id="webhook-timeout"
                type="number"
                value={settings.advanced.webhookTimeout}
                onChange={(e) => updateSetting('advanced', 'webhookTimeout', Number(e.target.value))}
                onBlur={() => {
                  const error = validateTimeout(settings.advanced.webhookTimeout);
                  setErrors(prev => ({ ...prev, webhookTimeout: error }));
                }}
                className={`form-input text-sm ${errors.webhookTimeout ? 'error' : ''}`}
                min="1"
                max="3600"
              />
              {errors.webhookTimeout && (
                <p className="form-error">{errors.webhookTimeout}</p>
              )}
              <p className="form-help">Valid range: 1 - 3600 seconds (1 hour max)</p>
            </div>
            <div>
              <label className="form-label" htmlFor="max-concurrent-tests">Max Concurrent Tests</label>
              <input
                id="max-concurrent-tests"
                type="number"
                value={settings.advanced.maxConcurrentTests}
                onChange={(e) => updateSetting('advanced', 'maxConcurrentTests', Number(e.target.value))}
                onBlur={() => {
                  const error = validateConcurrentTests(settings.advanced.maxConcurrentTests);
                  setErrors(prev => ({ ...prev, maxConcurrentTests: error }));
                }}
                className={`form-input text-sm ${errors.maxConcurrentTests ? 'error' : ''}`}
                min="1"
                max="100000"
              />
              {errors.maxConcurrentTests && (
                <p className="form-error">{errors.maxConcurrentTests}</p>
              )}
              <p className="form-help">Valid range: 1 - 100,000 tests</p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-error-200/70 dark:border-error-800/50 bg-error-50/50 dark:bg-error-900/15 p-6 animate-fade-up" style={{ animationDelay: '430ms' }}>
          <h3 className="font-semibold text-error-900 dark:text-error-200 mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-error-900 dark:text-error-200">Clear Cache</p>
                <p className="text-xs text-error-700 dark:text-error-300 mt-1">Remove all cached data</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setDangerAction('clearCache')}>Clear Cache</Button>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-error-200/70 dark:border-error-800/50">
              <div>
                <p className="font-medium text-error-900 dark:text-error-200">Reset Analytics</p>
                <p className="text-xs text-error-700 dark:text-error-300 mt-1">Clear all analytics data (irreversible)</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setDangerAction('resetAnalytics')}>Reset</Button>
            </div>
          </div>
        </div>

        <ConfirmationModal
          isOpen={dangerAction !== null}
          title={dangerAction ? dangerActions[dangerAction].title : ''}
          message={dangerAction ? dangerActions[dangerAction].message : ''}
          confirmText={dangerAction ? dangerActions[dangerAction].confirmText : ''}
          onConfirm={confirmDangerAction}
          onCancel={() => setDangerAction(null)}
          isDangerous
          isLoading={dangerLoading}
        />

        {/* Status */}
        {saved && (
          <div
            className="fixed bottom-6 right-6 bg-success-600 text-white px-6 py-3 rounded-lg shadow-elevation-lg flex items-center gap-2 animate-bounce-in"
            role="status"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" aria-hidden="true" />
            Settings saved successfully!
          </div>
        )}
      </div>
    </PlatformLayout>
  );
}
