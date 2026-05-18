'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import Icon from './Icon';
import { cn } from '@/lib/cn';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  width?: number;
  children: ReactNode;
};

export default function Drawer({
  open,
  onClose,
  title,
  description,
  footer,
  width = 480,
  children,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/30 transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width }}
        className={cn(
          'fixed right-0 top-0 z-50 flex h-screen flex-col border-l border-admin-border bg-admin-bg-elev shadow-2xl transition-transform duration-200',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-admin-border-soft px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[1rem] font-semibold text-admin-text">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-[0.8125rem] text-admin-text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-md p-1 text-admin-text-muted hover:bg-admin-bg-sunken hover:text-admin-text"
          >
            <Icon icon={X} size={16} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-admin-border-soft px-5 py-3">
            {footer}
          </footer>
        ) : null}
      </aside>
    </>
  );
}
