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
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
          hasActiveFilters
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
        }`}
      >
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-semibold">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border border-slate-200 shadow-lg z-50 p-4 space-y-4">
          {/* Date Range */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-2 block">
              Date Range
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="From"
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleDateChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="To"
                />
              </div>
            </div>
          </div>

          {/* Status Multi-Select */}
          {filterOptions.statuses && (
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-2 block">
                Status
              </label>
              <div className="space-y-2">
                {filterOptions.statuses.map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(status)}
                      onChange={() => handleStatusToggle(status)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition-all"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded hover:bg-slate-800 transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
