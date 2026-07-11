import React from 'react';

/**
 * Card — semantic wrapper for grouped content
 * Supports multiple variants: default, elevated, interactive, highlight
 */
export function Card({
  children,
  variant = 'default',
  as = 'div',
  className = '',
  ...props
}) {
  const Component = as;

  const variantClasses = {
    default: 'card',
    elevated: 'card-elevated',
    interactive: 'card-interactive',
    highlight: 'card-highlight',
  };

  return (
    <Component
      className={`${variantClasses[variant] || variantClasses.default} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * CardHeader — semantic header section
 */
export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`border-b border-slate-200 dark:border-slate-700 px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * CardContent — main content area
 */
export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * CardFooter — footer section (typically for actions)
 */
export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-end gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * CardTitle — semantic card heading
 */
export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-lg font-semibold text-slate-900 dark:text-slate-50 ${className}`} {...props}>
      {children}
    </h3>
  );
}

/**
 * CardDescription — subtitle or descriptive text
 */
export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-sm text-slate-600 dark:text-slate-400 ${className}`} {...props}>
      {children}
    </p>
  );
}
