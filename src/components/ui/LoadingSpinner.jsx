import React from 'react';

/**
 * LoadingSpinner — animated loading indicator
 * Available sizes: xs, sm, md, lg, xl
 * Available variants: primary (brand color), neutral (slate color)
 */
export default function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  className = '',
  ariaLabel = 'Loading',
}) {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const colorMap = {
    primary: 'text-brand-600 dark:text-brand-400',
    neutral: 'text-slate-600 dark:text-slate-400',
    white: 'text-white',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    error: 'text-error-600 dark:text-error-400',
  };

  const sizeClass = sizeMap[size] || sizeMap.md;
  const colorClass = colorMap[variant] || colorMap.primary;

  return (
    <svg
      className={`animate-spin ${sizeClass} ${colorClass} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label={ariaLabel}
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/**
 * LoadingContainer — wrapper with centered spinner
 */
export function LoadingContainer({ message, size = 'lg' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <LoadingSpinner size={size} />
      {message && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      )}
    </div>
  );
}

/**
 * LoadingOverlay — full-screen loading state
 */
export function LoadingOverlay({ message, transparent = false }) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        transparent
          ? 'bg-black/20 dark:bg-black/40'
          : 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm'
      }`}
    >
      <LoadingContainer message={message} size="lg" />
    </div>
  );
}
