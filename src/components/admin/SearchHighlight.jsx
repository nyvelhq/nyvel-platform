import React from 'react';

export function HighlightedText({ text, searchTerm }) {
  if (!searchTerm || !text) {
    return <span>{text}</span>;
  }

  const parts = text.toString().split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 font-semibold">{part}</mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

export function SearchCounter({ searchTerm, matchCount, totalItems }) {
  if (!searchTerm) return null;

  return (
    <div className="text-xs text-slate-600 ml-2">
      {matchCount > 0 ? (
        <span>
          <span className="font-semibold text-blue-600">{matchCount}</span> of{' '}
          <span className="font-semibold">{totalItems}</span> match{matchCount !== 1 ? 'es' : ''}
        </span>
      ) : (
        <span className="text-red-600">No matches found</span>
      )}
    </div>
  );
}
