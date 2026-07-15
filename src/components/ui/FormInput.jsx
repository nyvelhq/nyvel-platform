import React, { useState, useEffect } from 'react';

/**
 * FormInput — accessible text input with label, help text, and error state
 * Follows WAI-ARIA patterns and WCAG 2.1 Level AA compliance
 */
export const FormInput = React.forwardRef(({
  id,
  label,
  type = 'text',
  placeholder,
  helpText,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  ...props
}, ref) => {
  const [showShake, setShowShake] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = helpText ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  useEffect(() => {
    if (error) {
      setShowShake(true);
      const timer = setTimeout(() => setShowShake(false), 400);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className={`w-full ${showShake ? 'animate-error-shake' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="form-label transition-colors duration-200">
          {label}
          {required && <span aria-label="required" className="text-error-600 dark:text-error-400">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none flex-shrink-0 w-4 h-4 transition-colors duration-200">
            {Icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={!!error}
          className={`form-input ${Icon ? 'pl-9' : ''} ${IconRight ? 'pr-9' : ''} ${error ? 'error' : ''} transition-all duration-150 ${className}`}
          {...props}
        />
        {IconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none flex-shrink-0 w-4 h-4 transition-colors duration-200">
            {IconRight}
          </div>
        )}
      </div>
      {helpText && (
        <p id={helpId} className="form-help transition-all duration-150">{helpText}</p>
      )}
      {error && (
        <p id={errorId} className="form-error animate-slide-down" role="alert">{error}</p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

/**
 * FormTextarea — accessible textarea with label and error state
 */
export const FormTextarea = React.forwardRef(({
  id,
  label,
  placeholder,
  helpText,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = helpText ? `${textareaId}-help` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
          {required && <span aria-label="required" className="text-error-600 dark:text-error-400">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
        aria-invalid={!!error}
        className={`form-textarea ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {helpText && (
        <p id={helpId} className="form-help">{helpText}</p>
      )}
      {error && (
        <p id={errorId} className="form-error" role="alert">{error}</p>
      )}
    </div>
  );
});

FormTextarea.displayName = 'FormTextarea';

/**
 * FormSelect — accessible select dropdown
 */
export const FormSelect = React.forwardRef(({
  id,
  label,
  options = [],
  placeholder = 'Select an option...',
  helpText,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = helpText ? `${selectId}-help` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span aria-label="required" className="text-error-600 dark:text-error-400">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        disabled={disabled}
        required={required}
        aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
        aria-invalid={!!error}
        className={`form-select ${error ? 'error' : ''} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helpText && (
        <p id={helpId} className="form-help">{helpText}</p>
      )}
      {error && (
        <p id={errorId} className="form-error" role="alert">{error}</p>
      )}
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

/**
 * FormCheckbox — accessible checkbox input
 */
export const FormCheckbox = React.forwardRef(({
  id,
  label,
  helpText,
  error,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = helpText ? `${checkboxId}-help` : undefined;
  const errorId = error ? `${checkboxId}-error` : undefined;

  return (
    <div className="w-full">
      <div className="flex items-start gap-2">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          disabled={disabled}
          aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={!!error}
          className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed accent-brand-600 dark:accent-brand-500 mt-1 transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer"
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="text-sm font-medium text-slate-900 dark:text-slate-50 cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-150">
            {label}
          </label>
        )}
      </div>
      {helpText && (
        <p id={helpId} className="form-help ml-6">{helpText}</p>
      )}
      {error && (
        <p id={errorId} className="form-error ml-6 animate-slide-down" role="alert">{error}</p>
      )}
    </div>
  );
});

FormCheckbox.displayName = 'FormCheckbox';
