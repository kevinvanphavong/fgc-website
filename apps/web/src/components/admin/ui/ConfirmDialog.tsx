'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import AdminButton from './Button';
import Icon from './Icon';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  pending?: boolean;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  destructive,
  onCancel,
  onConfirm,
  pending,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pending) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-[400px] rounded-xl border border-admin-border bg-admin-bg-elev shadow-2xl"
      >
        <div className="flex items-start gap-3 px-5 pt-5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-red-soft text-admin-red">
            <Icon icon={AlertTriangle} size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-title" className="text-[1rem] font-semibold text-admin-text">
              {title}
            </h2>
            <p className="mt-1 text-[0.8125rem] text-admin-text-muted">
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 pb-4 pt-5">
          <AdminButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={pending}
          >
            {cancelLabel}
          </AdminButton>
          <AdminButton
            type="button"
            variant={destructive ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? 'En cours…' : confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
