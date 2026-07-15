import React, { useState } from 'react';
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'Low': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <PlatformLayout title="Security">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">Security & Compliance</h2>
          <p className="text-sm text-slate-500 mt-0.5">Monitor platform security, threats, and audit logs</p>
        </div>

        {/* Security Status Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityStatus.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <Icon size={20} className="text-brand-600" />
                  <CheckCircle size={16} className="text-emerald-500" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{item.name}</p>
                <p className="font-semibold text-slate-900">{item.status}</p>
                {item.expiry && <p className="text-xs text-slate-500 mt-2">Expires: {item.expiry}</p>}
                {item.coverage && <p className="text-xs text-slate-500 mt-2">Coverage: {item.coverage}</p>}
                {item.keyCount && <p className="text-xs text-slate-500 mt-2">Active: {item.keyCount}</p>}
              </div>
            );
          })}
        </div>

        {/* Active Threats */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" />
            Active Security Alerts
          </h3>
          <div className="space-y-3">
            {threats.map((threat) => (
              <div key={threat.id} className={`p-4 rounded-lg border ${getSeverityColor(threat.severity).replace('text-', 'border-').replace('bg-', 'border-opacity-50 bg-opacity-50 ')}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{threat.type}</p>
                    <p className="text-sm text-slate-600 mt-1">{threat.count} incidents detected</p>
                    <p className="text-xs text-slate-500 mt-2">Last seen: {threat.lastSeen}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {threat.action}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Compliance Status</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">GDPR</span>
                <CheckCircle size={16} className="text-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">CCPA</span>
                <CheckCircle size={16} className="text-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">SOC 2 Type II</span>
                <CheckCircle size={16} className="text-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">ISO 27001</span>
                <Clock size={16} className="text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Data Protection</p>
            <div className="space-y-3 text-sm">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700">Backup Status</span>
                  <span className="font-bold text-emerald-600">Good</span>
                </div>
                <p className="text-xs text-slate-500">Last backup: 1 hour ago</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700">Encryption</span>
                  <span className="font-bold text-emerald-600">AES-256</span>
                </div>
                <p className="text-xs text-slate-500">All data encrypted in transit & at rest</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700">DLP Status</span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
                <p className="text-xs text-slate-500">Data Loss Prevention enabled</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Security Score</p>
            <div className="text-center">
              <p className="font-display text-4xl font-bold text-emerald-600 mb-2">94/100</p>
              <p className="text-sm text-slate-600 mb-4">Excellent security posture</p>
              <div className="space-y-2 text-xs text-slate-600">
                <p>✓ All critical patches applied</p>
                <p>✓ No active vulnerabilities</p>
                <p>✓ Compliance up-to-date</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Audit Log</h3>
            <p className="text-xs text-slate-500 mt-0.5">All platform security events and administrative actions</p>
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
                    <td className="text-sm text-slate-600 font-mono">{log.timestamp}</td>
                    <td className="font-medium text-slate-800">{log.action}</td>
                    <td className="text-sm text-slate-600">{log.user}</td>
                    <td className="text-sm text-slate-600 font-mono">{log.ip}</td>
                    <td>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        log.status === 'Success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="text-sm text-slate-600">{log.details || '-'}</td>
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
