import React from 'react';
import { X, Trash2, Download, CheckCircle } from 'lucide-react';

export function BatchActionsBar({ selectedCount, onClearSelection, onDelete, onExport, onStatusChange, isLoading = false }) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center gap-4">
      <div className="flex-1">
        <p className="text-sm font-semibold text-blue-900">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </p>
      </div>
      <div className="flex gap-2">
        {onStatusChange && (
          <button
            onClick={() => onStatusChange('Active')}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-1">
              <CheckCircle size={14} />
              Mark Active
            </div>
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-all disabled:opacity-50"
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
            className="px-3 py-2 text-sm font-medium bg-red-50 text-red-700 rounded hover:bg-red-100 transition-all disabled:opacity-50"
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
          className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-all disabled:opacity-50"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export function SelectAllCheckbox({ checked, indeterminate, onToggle, disabled = false }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate;
      }}
      onChange={onToggle}
      disabled={disabled}
      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
    />
  );
}

export function RowCheckbox({ checked, onToggle, disabled = false }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onToggle}
      disabled={disabled}
      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
    />
  );
}
