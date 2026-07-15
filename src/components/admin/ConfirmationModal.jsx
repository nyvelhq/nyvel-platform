import React, { useState, useEffect } from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';

export function ConfirmationModal({ isOpen, title, message, confirmText, cancelText = 'Cancel', onConfirm, onCancel, isDangerous = false, isLoading = false, itemCount = null }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsExiting(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onCancel();
    }, 150);
  };

  const handleConfirm = () => {
    setIsExiting(true);
    setTimeout(() => {
      onConfirm();
    }, 150);
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50
      ${isExiting ? 'animate-fade-out' : 'animate-fade-in'}
      pointer-events-auto transition-all duration-150`}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <div className={`bg-white dark:bg-slate-900 rounded-lg shadow-elevation-lg dark:shadow-elevation-dark-md p-6 max-w-md w-full mx-4 relative
        ${isExiting ? 'animate-slide-up-out' : 'animate-scale-in'}
        transition-all duration-200`}>
        {/* Icon */}
        <div className={`flex justify-center mb-4 ${isDangerous ? 'text-red-600' : 'text-yellow-600'}`}>
          {isDangerous ? (
            <Trash2 size={32} />
          ) : (
            <AlertCircle size={32} />
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900 text-center mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-slate-600 text-center mb-4">
          {message}
        </p>

        {/* Item Count Badge */}
        {itemCount !== null && (
          <div className={`text-center mb-4 px-3 py-2 rounded-lg ${
            isDangerous
              ? 'bg-red-50 text-red-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}>
            <p className="text-sm font-semibold">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} will be affected
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.95]"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.95] ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
