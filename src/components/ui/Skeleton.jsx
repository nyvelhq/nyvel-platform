import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
      <div className="h-8 bg-slate-200 rounded w-1/2 mb-3"></div>
      <div className="h-3 bg-slate-100 rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto p-5 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded flex-1"></div>
            <div className="h-4 bg-slate-200 rounded flex-1"></div>
            <div className="h-4 bg-slate-200 rounded flex-1"></div>
            <div className="h-4 bg-slate-200 rounded flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonLine({ width = 'w-full' }) {
  return <div className={`h-4 bg-slate-200 rounded ${width} animate-pulse`}></div>;
}
