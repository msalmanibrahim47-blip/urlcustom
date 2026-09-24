'use client';

import { type LucideIcon } from 'lucide-react';
import { cx } from '@/lib/utils/misc';
import { useEffect } from 'react';

export function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="bg-surface border rounded-2xl p-5 shadow-soft anim-fade">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted">{label}</span>
        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-accent" />
        </div>
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed rounded-2xl bg-surface anim-fade">
      <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-5">{description}</p>
      {action}
    </div>
  );
}

export function Badge({ status }: { status: 'draft' | 'published' | 'unpublished' }) {
  const styles: Record<string, string> = {
    draft: 'bg-muted/15 text-muted',
    published: 'bg-success/15 text-success',
    unpublished: 'bg-danger/15 text-danger'
  };
  const label: Record<string, string> = { draft: 'Draft', published: 'Published', unpublished: 'Unpublished' };
  return (
    <span className={cx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', styles[status])}>
      {label[status]}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('skeleton rounded-lg', className)} />;
}

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
            className={cx(
              'px-3 py-2 rounded-xl text-sm font-medium text-white transition',
              danger ? 'bg-danger hover:opacity-90' : 'bg-accent hover:opacity-90'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx('animate-spin', className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
