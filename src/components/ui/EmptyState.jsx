import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  actionVariant = 'primary',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-4">
        <Icon size={22} className="text-slate-400 dark:text-slate-500" aria-hidden="true" />
      </div>
      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-5">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button size="sm" variant={actionVariant} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
