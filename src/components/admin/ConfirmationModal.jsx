import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';
import MotionModal from '../ui/MotionModal';
import Button from '../ui/Button';

/**
 * ConfirmationModal — confirm/cancel dialog for destructive or bulk actions.
 *
 * Built on MotionModal: AnimatePresence owns enter/exit (no setTimeout
 * choreography), Escape/backdrop close, focus is managed, and the panel
 * uses the semantic card + button system so dark mode works throughout.
 * Public API is unchanged from the previous implementation.
 */
export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
  isLoading = false,
  itemCount = null,
}) {
  return (
    <MotionModal open={isOpen} onClose={onCancel} labelledBy="confirmation-modal-title">
      {/* Icon */}
      <div
        className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full
          ${isDangerous
            ? 'bg-error-50/70 dark:bg-error-900/20 text-error-600 dark:text-error-400'
            : 'bg-warning-50/70 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400'}`}
        aria-hidden="true"
      >
        {isDangerous ? <Trash2 size={24} /> : <AlertCircle size={24} />}
      </div>

      {/* Title */}
      <h2
        id="confirmation-modal-title"
        className="text-xl font-bold text-slate-900 dark:text-slate-50 text-center mb-2"
      >
        {title}
      </h2>

      {/* Message */}
      <p className="text-slate-600 dark:text-slate-400 text-center mb-4">{message}</p>

      {/* Item count badge */}
      {itemCount !== null && (
        <div
          className={`text-center mb-4 px-3 py-2 rounded-lg border
            ${isDangerous
              ? 'bg-error-50/70 dark:bg-error-900/20 border-error-200/70 dark:border-error-800/50 text-error-700 dark:text-error-300'
              : 'bg-warning-50/70 dark:bg-warning-900/20 border-warning-200/70 dark:border-warning-800/50 text-warning-700 dark:text-warning-300'}`}
        >
          <p className="text-sm font-semibold">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} will be affected
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={isDangerous ? 'danger' : 'primary'}
          className="flex-1"
          onClick={onConfirm}
          disabled={isLoading}
          loading={isLoading}
        >
          {isLoading ? 'Processing…' : confirmText}
        </Button>
      </div>
    </MotionModal>
  );
}
