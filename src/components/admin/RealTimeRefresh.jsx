import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock } from 'lucide-react';

export function RealTimeRefresh({ isEnabled, onToggle, lastUpdated, onRefresh, isLoading = false }) {
  const [refreshInterval, setRefreshInterval] = useState(30000);

  // Auto-refresh effect
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      onRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isEnabled, refreshInterval, onRefresh]);

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never';

    const now = new Date();
    const diff = Math.floor((now - new Date(timestamp)) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
      {/* Auto Refresh Toggle */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={onToggle}
            disabled={isLoading}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          <span className="text-sm font-medium text-slate-700">
            Auto refresh
          </span>
        </label>
      </div>

      {/* Refresh Interval Selector */}
      {isEnabled && (
        <div className="flex items-center gap-2">
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            disabled={isLoading}
            className="px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value={10000}>Every 10s</option>
            <option value={30000}>Every 30s</option>
            <option value={60000}>Every 1m</option>
            <option value={300000}>Every 5m</option>
          </select>
        </div>
      )}

      {/* Manual Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white border border-slate-300 rounded hover:bg-slate-50 transition-all disabled:opacity-50"
        title="Refresh now"
      >
        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        Refresh
      </button>

      {/* Last Updated */}
      <div className="flex items-center gap-1.5 text-xs text-slate-600 ml-auto">
        <Clock size={12} />
        <span>Updated {formatLastUpdated(lastUpdated)}</span>
      </div>
    </div>
  );
}

export function useAutoRefresh(callback, options = {}) {
  const {
    autoRefreshEnabled: initialEnabled = false,
  } = options;

  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await callback();
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
  };

  return {
    isEnabled,
    onToggle: handleToggle,
    lastUpdated,
    onRefresh: handleRefresh,
    isLoading,
  };
}
