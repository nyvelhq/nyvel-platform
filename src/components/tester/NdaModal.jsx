import React, { useEffect, useState } from 'react';
import { FileLock2 } from 'lucide-react';
import MotionModal from '../ui/MotionModal';
import Button from '../ui/Button';
import { TESTER_NDA } from '../../content/testerNda';

/**
 * Shows the tester confidentiality agreement. With `onAccept`, the tester must
 * tick the checkbox before "Accept & Apply" enables; without it, it's a
 * read-only view (companies, or a tester re-reading what they accepted).
 * `onAccept(version)` resolves to `{ error }`.
 */
export default function NdaModal({ open, onClose, onAccept, testName }) {
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAgreed(false);
      setError('');
    }
  }, [open]);

  const handleAccept = async () => {
    setBusy(true);
    setError('');
    const { error: acceptError } = (await onAccept(TESTER_NDA.version)) || {};
    setBusy(false);
    if (acceptError) setError(acceptError.message || 'Could not submit your application. Please try again.');
  };

  return (
    <MotionModal open={open} onClose={busy ? undefined : onClose} labelledBy="nda-title" maxWidth="max-w-2xl">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center flex-shrink-0">
          <FileLock2 size={20} className="text-brand-600 dark:text-brand-400" aria-hidden="true" />
        </div>
        <div>
          <h2 id="nda-title" className="font-display font-bold text-lg text-slate-900 dark:text-slate-50">
            {TESTER_NDA.title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {testName ? `Required for "${testName}". ` : ''}Version {TESTER_NDA.version}
          </p>
        </div>
      </div>

      <div
        className="max-h-[35vh] sm:max-h-[50vh] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
        tabIndex={0}
        aria-label="Agreement text"
      >
        <p>{TESTER_NDA.intro}</p>
        {TESTER_NDA.sections.map((s) => (
          <div key={s.heading}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.heading}</h3>
            <p className="mt-1">{s.body}</p>
          </div>
        ))}
      </div>

      {onAccept ? (
        <>
          <label className="flex items-start gap-3 mt-4 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-brand-600"
            />
            <span>I have read and agree to the {TESTER_NDA.title}.</span>
          </label>
          {error && <p className="text-sm text-error-600 dark:text-error-400 mt-3" role="alert">{error}</p>}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-5">
            <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button onClick={handleAccept} disabled={!agreed} loading={busy} className="whitespace-nowrap">
              Accept &amp; Apply
            </Button>
          </div>
        </>
      ) : (
        <div className="flex justify-end mt-5">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      )}
    </MotionModal>
  );
}
