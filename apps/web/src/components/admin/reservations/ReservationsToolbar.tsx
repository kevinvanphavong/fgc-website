'use client';

import { cn } from '@/lib/cn';
import { KANBAN_COLUMNS, STATUS_META } from '@/lib/admin-hooks/reservation-meta';
import type { ReservationStatus } from '@/lib/admin-hooks/useDemandeReservation';

export type PeriodPreset = '7j' | '30j' | 'all';
export type ViewMode = 'kanban' | 'table';

interface ToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  statuses: Set<ReservationStatus>;
  onToggleStatus: (s: ReservationStatus) => void;
  period: PeriodPreset;
  onPeriodChange: (p: PeriodPreset) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
}

const PERIOD_LABELS: Record<PeriodPreset, string> = {
  '7j': '7 jours',
  '30j': '30 jours',
  all: 'Tous',
};

export default function ReservationsToolbar({
  search,
  onSearchChange,
  statuses,
  onToggleStatus,
  period,
  onPeriodChange,
  view,
  onViewChange,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border-soft pb-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative">
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Référence FGC-…"
            data-admin-search
            className="w-64 rounded-md border border-admin-border bg-admin-bg-elev py-2 pl-3 pr-3 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring max-md:w-full"
            aria-label="Rechercher par référence"
          />
        </div>

        <div className="flex items-center gap-1 rounded-md border border-admin-border bg-admin-bg-elev p-0.5">
          {(Object.keys(PERIOD_LABELS) as PeriodPreset[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={cn(
                'rounded px-2.5 py-1 text-xs font-medium transition',
                period === p
                  ? 'bg-admin-brand-soft text-admin-brand'
                  : 'text-admin-text-muted hover:bg-admin-bg-sunken',
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {KANBAN_COLUMNS.map((s) => {
            const meta = STATUS_META[s];
            const active = statuses.has(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => onToggleStatus(s)}
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition',
                  active
                    ? `${meta.pillBg} ${meta.pillText} ring-1 ring-current`
                    : 'border border-admin-border bg-admin-bg-elev text-admin-text-muted hover:bg-admin-bg-sunken',
                )}
              >
                <span
                  className={cn('h-1.5 w-1.5 rounded-full', active ? meta.dotBg : 'bg-admin-text-muted')}
                  aria-hidden
                />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-md border border-admin-border bg-admin-bg-elev p-0.5">
        {(['kanban', 'table'] as ViewMode[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onViewChange(v)}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition',
              view === v
                ? 'bg-admin-brand-soft text-admin-brand'
                : 'text-admin-text-muted hover:bg-admin-bg-sunken',
            )}
            aria-pressed={view === v}
          >
            {v === 'kanban' ? 'Kanban' : 'Tableau'}
          </button>
        ))}
      </div>
    </div>
  );
}
