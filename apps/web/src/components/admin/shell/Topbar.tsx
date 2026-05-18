'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PanelLeft, Search, HelpCircle, Bell } from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';
import { formatRelative } from '@/lib/intl';
import type { DashboardNotification } from '@/lib/admin-api';
import { cn } from '@/lib/cn';

type TopbarProps = {
  currentLabel: string;
  notifications: DashboardNotification[];
  onToggleSidebar: () => void;
  onOpenCmdK: () => void;
};

export default function Topbar({
  currentLabel,
  notifications,
  onToggleSidebar,
  onOpenCmdK,
}: TopbarProps) {
  const router = useRouter();
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [localUnread, setLocalUnread] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(notifications.map((n) => [n.id, n.unread]))
  );
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalUnread(
      Object.fromEntries(notifications.map((n) => [n.id, n.unread]))
    );
  }, [notifications]);

  useEffect(() => {
    if (!notifsOpen) return;
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setNotifsOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [notifsOpen]);

  const hasUnread = Object.values(localUnread).some(Boolean);

  const markAllRead = async () => {
    setLocalUnread(
      Object.fromEntries(notifications.map((n) => [n.id, false]))
    );
    await fetch('/api/admin/notifications/mark-read', { method: 'POST' });
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-admin-border bg-admin-bg-elev px-4">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-md p-1.5 text-admin-text-muted hover:bg-admin-bg-sunken hover:text-admin-text"
        title="Replier la barre latérale"
        aria-label="Replier la barre latérale"
      >
        <Icon icon={PanelLeft} size={17} />
      </button>

      <nav
        className="flex items-center gap-1.5 text-[0.8125rem]"
        aria-label="Fil d'ariane"
      >
        <span className="text-admin-text-muted">Back office</span>
        <span className="text-admin-text-muted" aria-hidden="true">
          /
        </span>
        <span className="font-medium text-admin-text">{currentLabel}</span>
      </nav>

      <button
        type="button"
        onClick={onOpenCmdK}
        className={cn(
          'ml-auto flex h-9 min-w-[260px] max-w-[420px] items-center gap-2 rounded-lg border border-admin-border bg-admin-bg px-3 text-[0.8125rem] text-admin-text-muted',
          'hover:border-admin-brand/40 hover:bg-admin-bg-elev',
          'max-md:min-w-0 max-md:flex-1'
        )}
      >
        <Icon icon={Search} size={15} />
        <span className="flex-1 text-left max-md:hidden">
          Rechercher partout…
        </span>
        <span
          className="rounded border border-admin-border bg-admin-bg-elev px-1.5 py-0.5 font-mono text-[0.6875rem] text-admin-text-muted max-md:hidden"
          aria-hidden="true"
        >
          ⌘K
        </span>
      </button>

      <button
        type="button"
        className="rounded-md p-1.5 text-admin-text-muted hover:bg-admin-bg-sunken hover:text-admin-text"
        title="Aide"
        aria-label="Aide"
      >
        <Icon icon={HelpCircle} size={17} />
      </button>

      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setNotifsOpen((o) => !o)}
          className="relative rounded-md p-1.5 text-admin-text-muted hover:bg-admin-bg-sunken hover:text-admin-text"
          title="Notifications"
          aria-label={
            hasUnread ? 'Notifications (non lues)' : 'Notifications'
          }
          aria-expanded={notifsOpen}
        >
          <Icon icon={Bell} size={17} />
          {hasUnread ? (
            <span
              className="absolute right-1 top-1 h-2 w-2 rounded-full bg-admin-red ring-2 ring-admin-bg-elev"
              aria-hidden="true"
            />
          ) : null}
        </button>

        {notifsOpen ? (
          <div
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 top-full z-30 mt-2 w-[360px] overflow-hidden rounded-lg border border-admin-border bg-admin-bg-elev shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-admin-border-soft px-4 py-3">
              <div className="text-[0.875rem] font-semibold text-admin-text">
                Notifications
              </div>
              {hasUnread ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[0.75rem] text-admin-brand hover:underline"
                >
                  Tout marquer comme lu
                </button>
              ) : null}
            </div>

            <ul className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="px-4 py-6 text-center text-[0.8125rem] text-admin-text-muted">
                  Aucune notification.
                </li>
              ) : (
                notifications.map((n) => {
                  const unread = localUnread[n.id] ?? false;
                  return (
                    <li
                      key={n.id}
                      className={cn(
                        'border-b border-admin-border-soft px-4 py-3 last:border-b-0',
                        unread && 'bg-admin-brand-soft/50'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {unread ? (
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-admin-brand"
                            aria-hidden="true"
                          />
                        ) : (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0" aria-hidden="true" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="text-[0.8125rem] font-medium leading-snug text-admin-text">
                              {n.title}
                            </div>
                            <time
                              dateTime={n.at}
                              className="shrink-0 text-[0.6875rem] text-admin-text-muted"
                            >
                              {formatRelative(n.at)}
                            </time>
                          </div>
                          <div className="mt-0.5 text-[0.75rem] text-admin-text-muted">
                            {n.body}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </header>
  );
}
