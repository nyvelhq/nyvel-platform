import React from 'react';

/**
 * Divider — visual separator between sections
 * Variants: line (simple), labeled (with text)
 */
export default function Divider({
  label,
  className = '',
  variant = 'line',
}) {
  if (variant === 'labeled' && label) {
    return (
      <div className={`flex items-center gap-3 my-6 ${className}`}>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/50" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
          {label}
        </span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/50" />
      </div>
    );
  }

  return (
    <div
      className={`h-px bg-slate-200 dark:bg-slate-700/50 my-6 ${className}`}
      role="separator"
      aria-label={label || 'Section divider'}
    />
  );
}

/**
 * VerticalDivider — vertical separator for side-by-side layouts
 */
export function VerticalDivider({ className = '' }) {
  return (
    <div
      className={`w-px bg-slate-200 dark:bg-slate-700/50 h-full ${className}`}
      role="separator"
    />
  );
}
