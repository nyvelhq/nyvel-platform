import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';

export function ConfirmationModal({ isOpen, title, message, confirmText, cancelText = 'Cancel', onConfirm, onCancel, isDangerous = false, isLoading = false, itemCount = null }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
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
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg font-medium hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-all disabled:opacity-50 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
