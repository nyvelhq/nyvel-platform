import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange, pageSize = 10, onPageSizeChange, storageKey = 'pageSize' }) {
  useEffect(() => {
    if (onPageSizeChange) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        onPageSizeChange(Number(saved));
      }
    }
  }, [onPageSizeChange, storageKey]);

  const handlePageSizeChange = (size) => {
    if (onPageSizeChange) {
      onPageSizeChange(size);
      localStorage.setItem(storageKey, String(size));
    }
  };
  const pages = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between mt-6 gap-4">
      <div className="flex items-center gap-4">
        <p className="text-sm text-slate-600">
          Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
        </p>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-150"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-150 hover:scale-110 active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-150 hover:scale-105 active:scale-95"
            >
              1
            </button>
            {startPage > 2 && <span className="text-slate-400 dark:text-slate-600">...</span>}
          </>
        )}

        {pages.map((page, idx) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{ animationDelay: `${idx * 25}ms` }}
            className={`px-3 py-1 rounded-lg transition-all duration-150 animate-bounce-in ${
              page === currentPage
                ? 'bg-brand-600 dark:bg-brand-700 text-white hover:bg-brand-700 dark:hover:bg-brand-600 hover:scale-105 active:scale-95'
                : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-slate-400 dark:text-slate-600">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-150 hover:scale-105 active:scale-95"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-150 hover:scale-110 active:scale-95"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
