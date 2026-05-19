'use client';

import { useEffect, useRef, type ReactNode } from 'react';
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

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Drawer({
  open,
  onClose,
  title,
  description,
  footer,
  width = 480,
  children,
}: DrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Mémorise l'élément actif avant ouverture, restitue le focus au close (PR8 a11y).
  useEffect(() => {
    if (!open) return;
    triggerRef.current = (document.activeElement as HTMLElement | null) ?? null;
    // Focus initial sur le premier focusable du drawer après le tick.
    const t = setTimeout(() => {
      const node = drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      node?.focus();
    }, 50);
    return () => {
      clearTimeout(t);
      // Restitution focus au déclencheur si toujours dans le DOM.
      if (triggerRef.current && document.contains(triggerRef.current)) {
        try {
          triggerRef.current.focus();
        } catch {
          /* perdu, on accepte */
        }
      }
    };
  }, [open]);

  // Esc ferme + focus trap au Tab.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const root = drawerRef.current;
      if (!root) return;
      const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
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
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width: `min(${width}px, 100vw)` }}
        data-admin-anim="drawer"
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
            className="rounded-md p-1 text-admin-text-muted hover:bg-admin-bg-sunken hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-brand-ring"
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
