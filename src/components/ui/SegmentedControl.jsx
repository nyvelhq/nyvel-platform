import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { spring } from '../../motion/tokens';

/**
 * SegmentedControl — tab-style option switcher with a shared-element pill.
 *
 * The active background springs between options via Framer's layoutId
 * (Linear-style). layoutId is namespaced with useId so multiple controls
 * can coexist on one page.
 *
 * @param {Array<{value: string, label: string}>} options
 * @param {string}   value      Currently selected option value.
 * @param {Function} onChange   Called with the newly selected value.
 * @param {string}   ariaLabel  Accessible name for the group.
 * @param {'sm'|'md'} size      Density (sm = compact chart toggles).
 */
export default function SegmentedControl({ options, value, onChange, ariaLabel, size = 'md' }) {
  const id = useId();
  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm';

  return (
    <div
      className="inline-flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1"
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.value)}
            className={`relative rounded-md font-semibold transition-colors duration-200 ${sizeClasses}
              ${selected
                ? 'text-slate-800 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            {selected && (
              <motion.span
                layoutId={`${id}-pill`}
                className="absolute inset-0 rounded-md bg-white dark:bg-slate-700 shadow-elevation-xs"
                transition={spring.snappy}
                aria-hidden="true"
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
