import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
      <div className="h-4 shimmer-bg rounded w-1/3 mb-3"></div>
      <div className="h-8 shimmer-bg rounded w-1/2 mb-3"></div>
      <div className="h-3 shimmer-bg rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonTableRow({ columns = 6 }) {
  return (
    <tr>
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 shimmer-bg rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 10, columns = 6 }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {[...Array(rows)].map((_, i) => (
              <SkeletonTableRow key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonLine({ width = 'w-full' }) {
  return <div className={`h-4 shimmer-bg rounded ${width}`}></div>;
}

export function SkeletonStats({ columns = 3 }) {
  const gridClass = {
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    2: 'sm:grid-cols-2',
  }[columns] || 'sm:grid-cols-3';

  return (
    <div className={`grid grid-cols-1 ${gridClass} gap-4`}>
      {[...Array(columns)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
          <div className="h-3 shimmer-bg rounded w-1/2 mb-3"></div>
          <div className="h-8 shimmer-bg rounded w-3/4 mb-3"></div>
          <div className="h-2 shimmer-bg rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}
