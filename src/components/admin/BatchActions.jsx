import React, { useState } from 'react';
import { X, Trash2, Download, CheckCircle, ChevronDown } from 'lucide-react';

export function BatchActionsBar({ selectedCount, onClearSelection, onDelete, onExport, onStatusChange, statusOptions = [], isLoading = false }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/50 rounded-lg p-4 mb-4 flex items-center gap-4">
      <div className="flex-1">
        <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {onStatusChange && statusOptions.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              disabled={isLoading}
              className="px-3 py-2 text-sm font-medium bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded hover:bg-success-100 dark:hover:bg-success-900/50 transition-all disabled:opacity-50 flex items-center gap-1"
            >
              <CheckCircle size={14} />
              Change Status
              <ChevronDown size={14} />
            </button>
            {showStatusMenu && (
              <div className="absolute top-full mt-1 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg dark:shadow-elevation-dark-md z-10 min-w-max">
                {statusOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      onStatusChange(option);
                      setShowStatusMenu(false);
                    }}
                    disabled={isLoading}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 first:rounded-t-lg last:rounded-b-lg disabled:opacity-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {onExport && (
          <button
            onClick={onExport}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-1">
              <Download size={14} />
              Export
            </div>
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-300 rounded hover:bg-error-100 dark:hover:bg-error-900/50 transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-1">
              <Trash2 size={14} />
              Delete
            </div>
          </button>
        )}
        <button
          onClick={onClearSelection}
          disabled={isLoading}
          className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all disabled:opacity-50"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// Wrapped in a padded label rather than enlarging the checkbox itself —
// keeps the visual size right for a dense table while giving mobile a
// tap target closer to the 44px minimum (labels forward clicks to the
// input they wrap, so this doesn't change the click behavior).
export function SelectAllCheckbox({ checked, indeterminate, onToggle, disabled = false }) {
  return (
    <label className="inline-flex items-center justify-center w-11 h-11 -m-[14px] cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate;
        }}
        onChange={onToggle}
        disabled={disabled}
        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 dark:text-brand-500 focus:ring-brand-500 disabled:opacity-50 cursor-pointer"
      />
    </label>
  );
}

export function RowCheckbox({ checked, onToggle, disabled = false }) {
  return (
    <label className="inline-flex items-center justify-center w-11 h-11 -m-[14px] cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        disabled={disabled}
        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 dark:text-brand-500 focus:ring-brand-500 disabled:opacity-50 cursor-pointer"
      />
    </label>
  );
}
