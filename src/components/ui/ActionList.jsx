import React from 'react';

/**
 * ActionList — up to `limit` records that need attention, each a link-style
 * button (UX-06). Used in StatCard footers on the dashboards.
 *
 * @param {Array<{id: string, name: string, detail: string}>} items
 * @param {Function} onOpen    Called with an item's id.
 * @param {Function} onMore    Optional; shown as "+N more" when items overflow.
 * @param {string}   emptyText Shown when there's nothing to list.
 */
export default function ActionList({ items, onOpen, onMore, emptyText, limit = 3 }) {
  if (!items.length) {
    return <p className="text-xs text-slate-500 dark:text-slate-400">{emptyText}</p>;
  }
  const shown = items.slice(0, limit);
  return (
    <ul className="space-y-2">
      {shown.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onOpen(item.id)}
            className="w-full text-left group"
          >
            <span className="block text-xs font-medium text-brand-700 dark:text-brand-300 group-hover:underline line-clamp-2">
              {item.name}
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">{item.detail}</span>
          </button>
        </li>
      ))}
      {items.length > shown.length && onMore && (
        <li>
          <button type="button" onClick={onMore} className="text-xs text-slate-500 dark:text-slate-400 hover:underline">
            +{items.length - shown.length} more
          </button>
        </li>
      )}
    </ul>
  );
}
