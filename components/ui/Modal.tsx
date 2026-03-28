"use client";

import React, { useEffect } from "react";

interface ModalProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ onClose, title, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full mx-auto max-w-3xl max-h-[95vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-40">
          <h2 className="text-xl font-bold text-stone-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <span className="text-xl text-stone-500">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="">{children}</div>
      </div>
    </div>
  );
}
