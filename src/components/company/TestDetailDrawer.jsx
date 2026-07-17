import React from 'react';
import Button from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import DetailDrawer from '../admin/DetailDrawer';

/**
 * TestDetailDrawer — company-facing test inspector.
 * Shared between the Dashboard's "Recent Tests" table and the full My Tests
 * page so a row click means the same thing in both places.
 */
export default function TestDetailDrawer({ test, onClose }) {
  return (
    <DetailDrawer
      open={test !== null}
      onClose={onClose}
      title={test?.name || ''}
      subtitle={test ? `${test.id} · ${test.type}` : ''}
      fields={
        test
          ? [
              { label: 'Status', value: <StatusBadge status={test.status} /> },
              { label: 'Platforms', value: test.platform.join(', ') },
              {
                label: 'Testers',
                value: (
                  <div className="flex items-center gap-2 justify-end">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 w-16">
                      <div
                        className="h-1.5 rounded-full bg-brand-500"
                        style={{ width: `${test.target ? (test.testers / test.target) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="tabular-nums">{test.testers}/{test.target}</span>
                  </div>
                ),
              },
              {
                label: 'Issues found',
                value: (
                  <span>
                    {test.issues}
                    {test.criticalIssues > 0 && (
                      <span className="ml-1.5 text-error-600 dark:text-error-400 font-semibold">
                        ({test.criticalIssues} critical)
                      </span>
                    )}
                  </span>
                ),
              },
              { label: 'Due date', value: test.dueDate },
            ]
          : []
      }
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    />
  );
}
