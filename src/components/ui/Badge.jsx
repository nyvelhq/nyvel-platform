import React from 'react';

// Unified semantic color system for badges
const colorMap = {
  // Brand/Info
  brand: 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800',
  // Success/Approved
  success: 'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-800',
  // Warning/Pending
  warning: 'bg-warning-50 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-800',
  // Error/Rejected
  error: 'bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-300 border border-error-200 dark:border-error-800',
  // Neutral
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
};

const dotMap = {
  brand: 'bg-brand-500 dark:bg-brand-400',
  success: 'bg-success-500 dark:bg-success-400',
  warning: 'bg-warning-500 dark:bg-warning-400',
  error: 'bg-error-500 dark:bg-error-400',
  slate: 'bg-slate-400 dark:bg-slate-500',
};

// Semantic status mapping to unified color system
const statusColors = {
  Active: 'success',
  Completed: 'slate',
  Pending: 'warning',
  Rejected: 'error',
  Open: 'brand',
  Closed: 'slate',
  Paused: 'warning',
  Processing: 'warning',
  Failed: 'error',
  Success: 'success',
  Draft: 'slate',
  Published: 'success',
};

// Test type mapping to semantic colors
const typeColors = {
  'Bug Hunt': 'error',
  Usability: 'brand',
  'Load Test': 'warning',
  'Multi-Day': 'slate',
  Fintech: 'success',
  Game: 'brand',
  'Global QA': 'brand',
  Accessibility: 'brand',
  QA: 'slate',
  Security: 'error',
  Performance: 'warning',
};

/**
 * Badge component — semantic label with optional indicator dot
 * Uses unified color system: brand, success, warning, error, slate
 */
export function Badge({ label, color, dot = false, className = '' }) {
  const resolvedColor = color || statusColors[label] || 'slate';
  const colorClass = colorMap[resolvedColor] || colorMap.slate;
  const dotClass = dotMap[resolvedColor] || dotMap.slate;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${colorClass} ${className}`}
      role="status"
      aria-label={`${label} status`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} aria-hidden="true" />}
      {label}
    </span>
  );
}

/**
 * StatusBadge — displays status with indicator dot
 */
export function StatusBadge({ status }) {
  return <Badge label={status} dot role="status" aria-label={`Status: ${status}`} />;
}

/**
 * TypeBadge — displays test/item type
 */
export function TypeBadge({ type }) {
  return <Badge label={type} color={typeColors[type]} role="term" aria-label={`Type: ${type}`} />;
}

/**
 * SeverityBadge — displays issue count with semantic severity color
 * Green (0), Yellow (1-5), Orange (6-20), Red (21+)
 */
export function SeverityBadge({ count, type = 'issues' }) {
  let color = 'success';
  if (count > 20) color = 'error';
  else if (count > 5) color = 'warning';
  else if (count > 0) color = 'warning';

  return (
    <Badge
      label={`${count} ${type}`}
      color={color}
      dot
      role="status"
      aria-label={`${count} ${type} found`}
    />
  );
}

/**
 * PriorityBadge — displays priority level (Low, Medium, High, Critical)
 */
export function PriorityBadge({ priority }) {
  const priorityMap = {
    Low: 'success',
    Medium: 'warning',
    High: 'warning',
    Critical: 'error',
  };
  return (
    <Badge
      label={priority}
      color={priorityMap[priority]}
      dot
      role="status"
      aria-label={`Priority: ${priority}`}
    />
  );
}
