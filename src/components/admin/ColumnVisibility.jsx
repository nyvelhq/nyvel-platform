import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

export function ColumnVisibilityToggle({ columns, visibleColumns, onChange, storageKey }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      onChange(JSON.parse(saved));
    }
  }, [storageKey, onChange]);

  const handleToggle = (columnKey) => {
    const updated = visibleColumns.includes(columnKey)
      ? visibleColumns.filter(c => c !== columnKey)
      : [...visibleColumns, columnKey];
    onChange(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleShowAll = () => {
    const allColumns = columns.map(c => c.key);
    onChange(allColumns);
    localStorage.setItem(storageKey, JSON.stringify(allColumns));
  };

  const handleHideAll = () => {
    onChange([]);
    localStorage.setItem(storageKey, JSON.stringify([]));
  };

  const visibleCount = visibleColumns.length;
  const totalCount = columns.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1"
        title="Toggle column visibility"
      >
        <Settings size={14} />
        Columns
        <span className="ml-1 text-xs bg-slate-600 text-white rounded px-1.5">
          {visibleCount}/{totalCount}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 min-w-max">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900">Show/Hide Columns</p>
            <p className="text-xs text-slate-500 mt-1">
              {visibleCount} of {totalCount} visible
            </p>
          </div>

          {/* Column List */}
          <div className="max-h-64 overflow-y-auto">
            {columns.map(column => (
              <label
                key={column.key}
                className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(column.key)}
                  onChange={() => handleToggle(column.key)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{column.label}</span>
              </label>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <button
              onClick={handleShowAll}
              className="flex-1 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-all"
            >
              Show All
            </button>
            <button
              onClick={handleHideAll}
              className="flex-1 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-all"
            >
              Hide All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function useColumnVisibility(defaultColumns, storageKey) {
  const [visibleColumns, setVisibleColumns] = React.useState(
    defaultColumns.map(c => c.key)
  );

  const handleVisibilityChange = (newVisible) => {
    setVisibleColumns(newVisible);
  };

  return {
    visibleColumns,
    setVisibleColumns: handleVisibilityChange,
  };
}
