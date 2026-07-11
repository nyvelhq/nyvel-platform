import React from 'react';

const variants = {
  // Primary action — high emphasis
  primary: 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white shadow-elevation-sm hover:shadow-elevation-md',
  // Secondary action — medium emphasis
  secondary: 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 shadow-elevation-xs',
  // Tertiary — low emphasis
  ghost: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700',
  // Destructive action
  danger: 'bg-error-600 hover:bg-error-700 active:bg-error-800 dark:bg-error-700 dark:hover:bg-error-600 text-white shadow-elevation-sm hover:shadow-elevation-md',
  // Outlined variant
  outline: 'border-2 border-brand-500 dark:border-brand-400 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 active:bg-brand-100 dark:active:bg-brand-900/50',
  // Dark background variant
  dark: 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 active:bg-slate-950 dark:active:bg-slate-600 text-white shadow-elevation-sm hover:shadow-elevation-md',
  // Accent/success actions
  accent: 'bg-accent-500 hover:bg-accent-600 active:bg-accent-700 dark:bg-accent-600 dark:hover:bg-accent-500 text-white shadow-elevation-sm hover:shadow-elevation-md',
  // Success/approval actions
  success: 'bg-success-600 hover:bg-success-700 active:bg-success-800 dark:bg-success-700 dark:hover:bg-success-600 text-white shadow-elevation-sm hover:shadow-elevation-md',
  // Warning actions
  warning: 'bg-warning-600 hover:bg-warning-700 active:bg-warning-800 dark:bg-warning-700 dark:hover:bg-warning-600 text-white shadow-elevation-sm hover:shadow-elevation-md',
};

const sizes = {
  xs: 'px-2 py-1 text-xs rounded-md gap-1',
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-md gap-2',
  lg: 'px-5 py-2.5 text-base rounded-lg gap-2',
  xl: 'px-6 py-3 text-base rounded-lg gap-2.5',
  '2xl': 'px-8 py-4 text-lg rounded-lg gap-3',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  type = 'button',
  'aria-label': ariaLabel,
  ...props
}) {
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  const isDisabled = loading || disabled;

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-150 ease-out
        disabled:opacity-60 disabled:cursor-not-allowed
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 dark:focus-visible:ring-brand-400
        ${variantClasses}
        ${sizeClasses}
        ${className}
      `}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin flex-shrink-0 w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0 w-4 h-4" aria-hidden="true">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="flex-shrink-0 w-4 h-4" aria-hidden="true">{iconRight}</span>
      )}
    </button>
  );
}
