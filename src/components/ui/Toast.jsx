import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const typeStyles = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    text: 'text-emerald-800',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    text: 'text-red-800',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-800',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-800',
  },
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

export default function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => {
        const style = typeStyles[toast.type] || typeStyles.info;
        const Icon = icons[toast.type] || Info;

        return (
          <div
            key={toast.id}
            className={`${style.bg} ${style.border} border rounded-lg p-4 flex items-start gap-3 max-w-sm pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-300`}
          >
            <Icon size={20} className={`flex-shrink-0 mt-0.5 ${style.icon}`} />
            <p className={`text-sm font-medium ${style.text} flex-1`}>{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className={`flex-shrink-0 ${style.icon} hover:opacity-70 transition-opacity`}
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
