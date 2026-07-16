import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

export function InlineEditCell({ value, onSave, isEditing = false, type = 'text', options = [] }) {
  const [isEdit, setIsEdit] = useState(isEditing);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEdit && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEdit]);

  const handleSave = () => {
    if (tempValue !== value) {
      onSave(tempValue);
    }
    setIsEdit(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEdit(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEdit) {
    return (
      <div
        onClick={() => setIsEdit(true)}
        className="cursor-pointer px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm text-slate-700 dark:text-slate-300"
      >
        {type === 'select' && (
          <span className="font-medium">{options.find(o => o.value === value)?.label || value}</span>
        )}
        {type !== 'select' && <span>{value}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {type === 'select' ? (
        <select
          ref={inputRef}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 text-sm border border-brand-300 dark:border-brand-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef}
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 text-sm border border-brand-300 dark:border-brand-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      )}
      <button
        onClick={handleSave}
        className="p-1 text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/30 rounded transition-colors"
        title="Save (Enter)"
      >
        <Check size={16} />
      </button>
      <button
        onClick={handleCancel}
        className="p-1 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/30 rounded transition-colors"
        title="Cancel (Esc)"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function InlineEditableField({ value, field, onUpdate, type = 'text', options = [] }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (newValue) => {
    if (newValue === value) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      onUpdate(field, newValue);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={isLoading ? 'opacity-50' : ''}>
      <InlineEditCell
        value={value}
        onSave={handleSave}
        type={type}
        options={options}
      />
    </div>
  );
}
