'use client';

import { useEffect } from 'react';

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger,
  onConfirm,
  onCancel
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-surface border rounded-2xl shadow-soft w-full max-w-sm p-5 anim-slide">
        <h3 className="font-semibold mb-1.5">{title}</h3>
        <p className="text-sm text-muted mb-5">{description}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 rounded-xl text-sm font-medium border hover:bg-surface-2 transition">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 py-2 rounded-xl text-sm font-medium text-white transition ${
              danger ? 'bg-danger hover:opacity-90' : 'bg-accent hover:opacity-90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
