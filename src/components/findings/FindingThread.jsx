import React from 'react';

const LABELS = {
  company: { question: 'You asked', reply: 'Tester replied', accepted: 'You accepted', rejected: 'You rejected' },
  tester: { question: 'The company asked', reply: 'You replied', accepted: 'Accepted', rejected: 'Rejected' },
};

const formatWhen = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';

/**
 * FindingThread — the question/reply/decision history on a finding (UX-07),
 * from finding_messages. `viewer` picks the wording ('company' or 'tester').
 * Decisions without a reason (e.g. a plain accept) are left out.
 */
export default function FindingThread({ messages, viewer }) {
  const shown = messages.filter((m) => m.kind === 'question' || m.kind === 'reply' || m.body);
  if (!shown.length) return null;
  const labels = LABELS[viewer] || LABELS.tester;
  return (
    <ol className="space-y-1.5" aria-label="Conversation">
      {shown.map((m) => (
        <li
          key={m.id}
          className={`text-xs whitespace-pre-wrap pl-2 border-l-2 ${
            m.kind === 'reply'
              ? 'border-brand-400 text-slate-700 dark:text-slate-300'
              : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
          }`}
        >
          <span className="font-semibold">{labels[m.kind]}:</span> {m.body}
          <span className="block text-[11px] text-slate-500 dark:text-slate-400">{formatWhen(m.created_at)}</span>
        </li>
      ))}
    </ol>
  );
}
