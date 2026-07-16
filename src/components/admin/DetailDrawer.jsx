import React from 'react';
import { X } from 'lucide-react';
import MotionDrawer from '../ui/MotionDrawer';

/**
 * DetailDrawer — right-side record inspector for admin tables.
 *
 * Generic shell on MotionDrawer: header (avatar/title/subtitle + close),
 * scrollable field list, optional footer for contextual actions.
 * Escape and backdrop click close (handled by MotionDrawer).
 *
 * @param {boolean}  open
 * @param {Function} onClose
 * @param {string}   title      Record display name.
 * @param {string}   subtitle   Secondary line under the title.
 * @param {ReactNode} avatar    Optional leading visual.
 * @param {Array<{label: string, value: ReactNode}>} fields
 * @param {ReactNode} footer    Optional action row.
 */
export default function DetailDrawer({ open, onClose, title, subtitle, avatar, fields = [], footer }) {
  return (
    <MotionDrawer open={open} onClose={onClose} labelledBy="detail-drawer-title">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-200/70 dark:border-slate-700/50">
        <div className="flex items-center gap-3 min-w-0">
          {avatar}
          <div className="min-w-0">
            <h2 id="detail-drawer-title" className="font-display text-lg font-bold text-slate-900 dark:text-slate-50 truncate">
              {title}
            </h2>
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="p-2 -m-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <dl className="space-y-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pt-0.5 flex-shrink-0">
                {label}
              </dt>
              <dd className="text-sm text-slate-800 dark:text-slate-200 text-right min-w-0">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-slate-200/70 dark:border-slate-700/50 flex gap-3 justify-end">
          {footer}
        </div>
      )}
    </MotionDrawer>
  );
}
