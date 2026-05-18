'use client';

import { PanelLeft, Search, HelpCircle, Bell } from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';
import { cn } from '@/lib/cn';

type TopbarProps = {
  currentLabel: string;
  onToggleSidebar: () => void;
  onOpenCmdK: () => void;
};

export default function Topbar({
  currentLabel,
  onToggleSidebar,
  onOpenCmdK,
}: TopbarProps) {
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

      {/* Breadcrumb */}
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

      {/* Search (placeholder) */}
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

      <button
        type="button"
        className="relative rounded-md p-1.5 text-admin-text-muted hover:bg-admin-bg-sunken hover:text-admin-text"
        title="Notifications"
        aria-label="Notifications"
      >
        <Icon icon={Bell} size={17} />
        <span
          className="absolute right-1 top-1 h-2 w-2 rounded-full bg-admin-red ring-2 ring-admin-bg-elev"
          aria-hidden="true"
        />
      </button>
    </header>
  );
}
