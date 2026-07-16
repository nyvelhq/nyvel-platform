import React from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle, Key, Clock } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import { adminSecurityLog } from '../data/mockData';

export default function AdminSecurity() {
  const securityStatus = [
    { name: 'SSL Certificate', status: 'Valid', expiry: '2027-03-15', icon: Lock },
    { name: 'Two-Factor Auth', status: 'Enabled', coverage: '98%', icon: Shield },
    { name: 'API Keys', status: 'Monitored', keyCount: 42, icon: Key },
    { name: 'Data Encryption', status: 'AES-256', coverage: '100%', icon: Lock },
  ];

  const threats = [
    { id: 1, type: 'Brute Force Attempt', severity: 'High', count: 3, lastSeen: '2 hours ago', action: 'Blocked' },
    { id: 2, type: 'Suspicious API Activity', severity: 'Medium', count: 1, lastSeen: '5 hours ago', action: 'Monitored' },
    { id: 3, type: 'Rate Limit Exceeded', severity: 'Low', count: 8, lastSeen: '30 minutes ago', action: 'Throttled' },
  ];

  // Semantic severity styling — panel border/tint + badge, dark-mode complete
  const severityStyles = {
    High: {
      panel: 'bg-error-50/50 dark:bg-error-900/15 border-error-200/70 dark:border-error-800/50',
      badge: 'badge badge-error',
    },
    Medium: {
      panel: 'bg-warning-50/50 dark:bg-warning-900/15 border-warning-200/70 dark:border-warning-800/50',
      badge: 'badge badge-warning',
    },
    Low: {
      panel: 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/70 dark:border-slate-700/50',
      badge: 'badge badge-neutral',
    },
  };
  const getSeverity = (severity) => severityStyles[severity] || severityStyles.Low;

  return (
    <PlatformLayout title="Security">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">Security & Compliance</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Monitor platform security, threats, and audit logs</p>
        </div>

        {/* Security Status Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityStatus.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <Icon size={20} className="text-brand-600 dark:text-brand-400" />
                  <CheckCircle size={16} className="text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{item.name}</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.status}</p>
                {item.expiry && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Expires: {item.expiry}</p>}
                {item.coverage && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Coverage: {item.coverage}</p>}
                {item.keyCount && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Active: {item.keyCount}</p>}
              </div>
            );
          })}
        </div>

        {/* Active Threats */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" />
            Active Security Alerts
          </h3>
          <div className="space-y-3">
            {threats.map((threat, i) => (
              <div
                key={threat.id}
                className={`p-4 rounded-lg border animate-fade-up ${getSeverity(threat.severity).panel}`}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{threat.type}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{threat.count} incidents detected</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Last seen: {threat.lastSeen}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={getSeverity(threat.severity).badge}>{threat.severity}</span>
                    <span className="badge badge-neutral">{threat.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Compliance Status</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">GDPR</span>
                <CheckCircle size={16} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">CCPA</span>
                <CheckCircle size={16} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">SOC 2 Type II</span>
                <CheckCircle size={16} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">ISO 27001</span>
                <Clock size={16} className="text-amber-500" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Data Protection</p>
            <div className="space-y-3 text-sm">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Backup Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Good</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Last backup: 1 hour ago</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Encryption</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">AES-256</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">All data encrypted in transit & at rest</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">DLP Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Data Loss Prevention enabled</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Security Score</p>
            <div className="text-center">
              <p className="font-display text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">94/100</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Excellent security posture</p>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <p>✓ All critical patches applied</p>
                <p>✓ No active vulnerabilities</p>
                <p>✓ Compliance up-to-date</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/70 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Audit Log</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">All platform security events and administrative actions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {adminSecurityLog.map((log) => (
                  <tr key={log.id}>
                    <td className="text-sm text-slate-600 dark:text-slate-400 font-mono">{log.timestamp}</td>
                    <td className="font-medium text-slate-800 dark:text-slate-200">{log.action}</td>
                    <td className="text-sm text-slate-600 dark:text-slate-400">{log.user}</td>
                    <td className="text-sm text-slate-600 dark:text-slate-400 font-mono">{log.ip}</td>
                    <td>
                      <span className={`${
                        log.status === 'Success'
                          ? 'badge badge-success'
                          : 'badge badge-error'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="text-sm text-slate-600 dark:text-slate-400">{log.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}
