import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useDragGesture } from '../../hooks/useGestures';
import { spring, duration, ease } from '../../motion/tokens';

const typeStyles = {
  success: {
    bg: 'bg-success-50 dark:bg-success-900/30',
    border: 'border-success-200 dark:border-success-800/50',
    icon: 'text-success-600 dark:text-success-400',
    text: 'text-success-800 dark:text-success-200',
  },
  error: {
    bg: 'bg-error-50 dark:bg-error-900/30',
    border: 'border-error-200 dark:border-error-800/50',
    icon: 'text-error-600 dark:text-error-400',
    text: 'text-error-800 dark:text-error-200',
  },
  info: {
    bg: 'bg-brand-50 dark:bg-brand-900/30',
    border: 'border-brand-200 dark:border-brand-800/50',
    icon: 'text-brand-600 dark:text-brand-400',
    text: 'text-brand-800 dark:text-brand-200',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/30',
    border: 'border-warning-200 dark:border-warning-800/50',
    icon: 'text-warning-600 dark:text-warning-400',
    text: 'text-warning-800 dark:text-warning-200',
  },
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

// Exit continues in the direction a swipe-dismiss was heading; a plain
// fade+lift for button-close or auto-dismiss (dragDirection 0 in both).
const toastVariants = {
  hidden: { opacity: 0, y: -12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: spring.snappy },
  exit: (custom) => ({
    opacity: 0,
    x: custom?.dragDirection ? custom.dragDirection * 300 : 0,
    y: custom?.dragDirection ? 0 : -8,
    transition: { duration: duration.fast, ease: ease.in },
  }),
};

function ToastItem({ toast, onRemove }) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const style = typeStyles[toast.type] || typeStyles.info;
  const Icon = icons[toast.type] || Info;

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useDragGesture(
    ({ x }) => {
      setDragOffset(x);
      setIsDragging(true);
    },
    ({ completed }) => {
      if (completed) {
        // AnimatePresence plays the exit variant once this unmounts —
        // no local isExiting/setTimeout bookkeeping needed.
        onRemove(toast.id);
      } else {
        setDragOffset(0);
        setIsDragging(false);
      }
    }
  );

  return (
    <motion.div
      layout
      custom={{ dragDirection: Math.sign(dragOffset) }}
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`${style.bg} ${style.border} border rounded-lg p-4 flex items-start gap-3 max-w-sm pointer-events-auto`}
      style={{
        x: dragOffset,
        opacity: isDragging ? Math.max(0.3, 1 - Math.abs(dragOffset) / 200) : undefined,
      }}
    >
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${style.icon}`} aria-hidden="true" />
      <p className={`text-sm font-medium ${style.text} flex-1`}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className={`flex-shrink-0 ${style.icon} hover:opacity-70 active:scale-90 transition-all`}
        aria-label="Dismiss notification"
      >
        <X size={18} />
      </button>
    </motion.div>
  );
}

export default function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
