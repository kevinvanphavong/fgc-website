'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import Icon from './Icon';
import { cn } from '@/lib/cn';

type ToastKind = 'success' | 'error' | 'info';
type Toast = { id: string; kind: ToastKind; title: string; description?: string };

type ToastApi = {
  push: (t: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
};

const ToastCtx = createContext<ToastApi | null>(null);

const KIND_META: Record<
  ToastKind,
  { icon: typeof CheckCircle2; bar: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-admin-green',
    iconColor: 'text-admin-green',
  },
  error: { icon: AlertTriangle, bar: 'bg-admin-red', iconColor: 'text-admin-red' },
  info: { icon: Info, bar: 'bg-admin-brand', iconColor: 'text-admin-brand' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts((ts) => [...ts, { id, ...t }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4000);
  }, []);

  const api: ToastApi = {
    push,
    success: (title, description) => push({ kind: 'success', title, description }),
    error: (title, description) => push({ kind: 'error', title, description }),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[340px] flex-col gap-2"
      >
        {toasts.map((t) => {
          const meta = KIND_META[t.kind];
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex items-start gap-3 overflow-hidden rounded-lg border border-admin-border bg-admin-bg-elev p-3 shadow-lg"
            >
              <div className={cn('w-1 self-stretch rounded-full', meta.bar)} aria-hidden="true" />
              <Icon icon={meta.icon} size={18} className={cn('mt-0.5', meta.iconColor)} />
              <div className="min-w-0 flex-1">
                <div className="text-[0.875rem] font-medium text-admin-text">{t.title}</div>
                {t.description ? (
                  <div className="mt-0.5 text-[0.75rem] text-admin-text-muted">
                    {t.description}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
                className="text-admin-text-muted hover:text-admin-text"
                aria-label="Fermer"
              >
                <Icon icon={X} size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
