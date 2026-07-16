import React from 'react';
import { motion } from 'framer-motion';
import { spring } from '../../motion/tokens';

/**
 * ToggleSwitch — accessible switch with a spring-animated knob.
 *
 * The knob slides via Framer's layout animation (position swap animated
 * with a snappy spring). Uses role="switch" + aria-checked semantics.
 *
 * @param {boolean}  checked
 * @param {Function} onChange   Called on click (no arguments — controlled).
 * @param {boolean}  danger     Red track when on (destructive settings).
 * @param {string}   ariaLabel  Accessible name for the switch.
 */
export default function ToggleSwitch({ checked, onChange, danger = false, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`relative flex items-center w-11 h-6 px-0.5 rounded-full transition-colors duration-200 flex-shrink-0
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500
        ${checked
          ? danger
            ? 'bg-error-500 dark:bg-error-600'
            : 'bg-success-500 dark:bg-success-600'
          : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <motion.span
        layout
        transition={spring.snappy}
        className={`w-5 h-5 rounded-full bg-white shadow-elevation-xs ${checked ? 'ml-auto' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
}
