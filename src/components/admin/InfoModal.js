"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

export default function InfoModal({ open, title, message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{message}</p>

        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-brand-600 text-white hover:bg-brand-700 text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
