import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { overlayVariants, modalVariants } from '../../motion/tokens';

/**
 * MotionModal — AnimatePresence-driven modal shell.
 *
 * Handles the hard parts once so feature modals stay declarative:
 * - Enter/exit choreography (backdrop fade, panel spring) — no setTimeout juggling
 * - Escape to close, backdrop click to close
 * - Body scroll lock while open
 * - Focus moves into the dialog on open, returns to the trigger on close
 * - role="dialog" + aria-modal semantics
 *
 * @param {boolean}  open        Controls visibility (exit animation plays on false).
 * @param {Function} onClose     Called on Escape / backdrop click.
 * @param {string}   labelledBy  id of the element titling the dialog.
 * @param {string}   maxWidth    Tailwind max-w-* class for the panel.
 */
export default function MotionModal({
  open,
  onClose,
  labelledBy,
  maxWidth = 'max-w-md',
  children,
}) {
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);

  // Escape to close
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Scroll lock + focus management
  useEffect(() => {
    if (!open) return undefined;
    restoreFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the panel (or its first focusable) after the frame paints
    const id = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusable || panel).focus();
    });

    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            data-testid="modal-backdrop"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            className={`relative w-full ${maxWidth} card-elevated p-6 outline-none`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
