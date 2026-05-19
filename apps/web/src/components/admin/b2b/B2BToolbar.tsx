'use client';

import { cn } from '@/lib/cn';
import { B2B_TYPE_META } from '@/lib/admin-hooks/b2b-meta';
import type { B2BType } from '@/lib/admin-hooks/useB2BRequest';

export type B2BTypeFilter = 'all' | B2BType;

interface B2BToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: B2BTypeFilter;
  onTypeFilterChange: (t: B2BTypeFilter) => void;
}

const TYPE_OPTIONS: { value: B2BTypeFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'seminaire', label: B2B_TYPE_META.seminaire.label },
  { value: 'team_building', label: B2B_TYPE_META.team_building.label },
  { value: 'soiree', label: B2B_TYPE_META.soiree.label },
  { value: 'arbre_noel', label: B2B_TYPE_META.arbre_noel.label },
  { value: 'autre', label: B2B_TYPE_META.autre.label },
];

export default function B2BToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}: B2BToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-admin-border-soft pb-4">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Entreprise…"
        data-admin-search
        className="w-64 rounded-md border border-admin-border bg-admin-bg-elev py-2 pl-3 pr-3 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring max-md:w-full"
        aria-label="Rechercher par entreprise"
      />

      <div className="flex flex-wrap items-center gap-1 rounded-md border border-admin-border bg-admin-bg-elev p-0.5">
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onTypeFilterChange(t.value)}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition',
              typeFilter === t.value
                ? 'bg-admin-brand-soft text-admin-brand'
                : 'text-admin-text-muted hover:bg-admin-bg-sunken',
            )}
            aria-pressed={typeFilter === t.value}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
