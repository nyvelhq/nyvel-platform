import React from 'react';

/**
 * FormGroup — wrapper for form fields with consistent spacing
 * Ensures proper alignment and spacing between form elements
 */
export function FormGroup({ children, className = '', ...props }) {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * FormFieldset — wrapper for grouped form fields
 * Useful for related fields like billing address
 */
export function FormFieldset({ children, legend, className = '', ...props }) {
  return (
    <fieldset className={`space-y-4 ${className}`} {...props}>
      {legend && (
        <legend className="text-base font-semibold text-slate-900 dark:text-slate-50">
          {legend}
        </legend>
      )}
      {children}
    </fieldset>
  );
}

/**
 * FormRow — layout for multiple fields on one row
 */
export function FormRow({ children, className = '', columns = 2 }) {
  return (
    <div
      className={`grid gap-4 ${
        columns === 1 ? 'grid-cols-1' :
        columns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
        columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
        'grid-cols-1'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * FormHelp — helper text below form field
 */
export function FormHelp({ children, className = '' }) {
  return (
    <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}

/**
 * FormError — error message for form field
 */
export function FormError({ children, className = '' }) {
  return (
    <p className={`text-xs text-error-600 dark:text-error-400 font-medium mt-1 ${className}`} role="alert">
      {children}
    </p>
  );
}
