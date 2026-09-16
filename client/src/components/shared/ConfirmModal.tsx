// This file is for: ConfirmModal — reusable confirmation dialog
// Module: Shared UI Components (Module 12)
// Owner: Developer 3 (Mobile Frontend Engineer)
//
// What goes here:
// - Modal overlay with dark backdrop (--color-surface-modal)
// - Title, message, confirm button, cancel button
// - Props: isOpen, onConfirm, onCancel, title, message, confirmText?, variant?
// - Variant: 'danger' (red confirm) or 'default' (accent confirm)
// - Keyboard: Escape to close, Enter to confirm
// - Focus trap inside modal

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Check } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'danger' | 'default';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  variant = 'default',
}) => {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Focus the confirm button so Enter triggers it natively
    confirmRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && e.target !== confirmRef.current) {
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  const confirmColor = variant === 'danger' ? 'var(--color-error)' : 'var(--color-accent)';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'var(--color-surface-modal)', zIndex: 10000 }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 animate-scale-in"
        style={{ background: 'var(--color-surface-card)', boxShadow: 'var(--shadow-modal)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="p-2.5 rounded-xl shrink-0"
            style={{
              background: variant === 'danger' ? 'rgba(239,68,68,0.08)' : 'rgba(255,107,44,0.08)',
              color: confirmColor,
            }}
          >
            {variant === 'danger' ? <AlertTriangle size={20} /> : <Check size={20} />}
          </div>
          <div className="pt-0.5">
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
            <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 min-h-[44px]"
            style={{
              background: 'var(--color-surface-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 min-h-[44px]"
            style={{
              background: confirmColor,
              boxShadow: `0 4px 14px ${variant === 'danger' ? 'rgba(239,68,68,0.3)' : 'rgba(255,107,44,0.3)'}`,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
