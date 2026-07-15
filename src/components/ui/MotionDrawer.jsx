import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { overlayVariants, drawerVariants } from '../../motion/tokens';

/**
 * MotionDrawer — edge-anchored sliding panel with AnimatePresence.
 *
 * Springs in from the chosen edge over a fading backdrop. Escape and
 * backdrop click both close. Body scroll is locked while open.
 *
 * @param {boolean}  open      Controls visibility.
 * @param {Function} onClose   Called on Escape / backdrop click.
 * @param {'right'|'left'} side  Anchor edge (default 'right').
 * @param {string}   width     Tailwind width classes for the panel.
 * @param {string}   labelledBy id of the element titling the drawer.
 */
export default function MotionDrawer({
  open,
  onClose,
  side = 'right',
  width = 'w-full max-w-md',
  labelledBy,
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const variants = drawerVariants[side] || drawerVariants.right;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={`absolute inset-y-0 ${side === 'right' ? 'right-0' : 'left-0'} ${width}
              bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700/60
              ${side === 'right' ? 'border-l' : 'border-r'} shadow-elevation-xl flex flex-col`}
            variants={variants}
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
