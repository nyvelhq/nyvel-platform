import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function AdvancedFilters({ onFilterChange, filterOptions = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    statuses: [],
    ...filterOptions.initialValues,
  });

  const handleDateChange = (field, value) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleStatusToggle = (status) => {
    const updated = {
      ...filters,
      statuses: filters.statuses.includes(status)
        ? filters.statuses.filter(s => s !== status)
        : [...filters.statuses, status],
    };
    setFilters(updated);
    onFilterChange(updated);
  };

  const hasActiveFilters = filters.dateFrom || filters.dateTo || filters.statuses.length > 0;
  const activeFilterCount = (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0) + filters.statuses.length;

  const clearFilters = () => {
    const cleared = {
      dateFrom: '',
      dateTo: '',
      statuses: [],
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 hover:scale-105 active:scale-95 ${
          hasActiveFilters
            ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/40'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-brand-600 dark:bg-brand-700 text-white text-xs rounded-full font-semibold animate-bounce-in">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown size={16} className={`transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-elevation-lg dark:shadow-elevation-dark-md z-50 p-4 space-y-4 animate-slide-down">
          {/* Date Range */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
              Date Range
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-150"
                  placeholder="From"
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleDateChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-150"
                  placeholder="To"
                />
              </div>
            </div>
          </div>

          {/* Status Multi-Select */}
          {filterOptions.statuses && (
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                Status
              </label>
              <div className="space-y-2">
                {filterOptions.statuses.map((status, idx) => (
                  <label key={status} style={{ animationDelay: `${idx * 25}ms` }} className="flex items-center gap-2 cursor-pointer animate-slide-down transition-all duration-150 hover:translate-x-1">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(status)}
                      onChange={() => handleStatusToggle(status)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 dark:text-brand-500 focus:ring-brand-500 transition-all duration-150 hover:scale-110 active:scale-95"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-150 hover:scale-105 active:scale-95"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto px-4 py-2 text-sm font-medium text-white bg-brand-600 dark:bg-brand-700 rounded hover:bg-brand-700 dark:hover:bg-brand-600 transition-all duration-150 hover:scale-105 active:scale-95"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
