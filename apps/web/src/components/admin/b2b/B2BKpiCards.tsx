'use client';

import { Briefcase, TrendingUp, Target, Clock, type LucideIcon } from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';
import { formatEUR, formatResponseTime } from '@/lib/admin-hooks/b2b-meta';
import type { B2BAdminStats } from '@/lib/admin-hooks/useB2BRequest';

interface KpiCardsProps {
  stats: B2BAdminStats | undefined;
  loading?: boolean;
}

export default function B2BKpiCards({ stats, loading }: KpiCardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-admin-border bg-admin-bg-elev"
          />
        ))}
      </div>
    );
  }

  const percent = (stats.conversionRate * 100).toFixed(0) + ' %';

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Tile
        label="Demandes ouvertes"
        value={String(stats.openCount)}
        icon={Briefcase}
        accent="brand"
      />
      <Tile
        label="Pipeline (montant)"
        value={formatEUR(stats.openValueCents)}
        icon={TrendingUp}
        accent="green"
      />
      <Tile
        label="Taux de transfo"
        value={percent}
        icon={Target}
        accent="pink"
        hint="gagne / (gagne + perdu)"
      />
      <Tile
        label="Délai moyen de réponse"
        value={formatResponseTime(stats.avgResponseTimeMinutes)}
        icon={Clock}
        accent="amber"
        hint="création → qualification"
      />
    </div>
  );
}

type Accent = 'brand' | 'green' | 'pink' | 'amber';

const ACCENT_MAP: Record<Accent, { iconBg: string; iconText: string }> = {
  brand: { iconBg: 'bg-admin-brand-soft', iconText: 'text-admin-brand' },
  green: { iconBg: 'bg-admin-green-soft', iconText: 'text-admin-green' },
  pink: { iconBg: 'bg-admin-pink-soft', iconText: 'text-admin-pink' },
  amber: { iconBg: 'bg-admin-amber-soft', iconText: 'text-admin-amber' },
};

function Tile({
  label,
  value,
  icon,
  accent,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: Accent;
  hint?: string;
}) {
  const a = ACCENT_MAP[accent];
  return (
    <div className="rounded-lg border border-admin-border bg-admin-bg-elev p-4">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-admin-text-muted">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-md ${a.iconBg} ${a.iconText}`}>
          <Icon icon={icon} size={16} />
        </span>
      </div>
      <div className="mt-2 text-xl font-semibold text-admin-text">{value}</div>
      {hint && <p className="mt-1 text-[0.7rem] text-admin-text-muted">{hint}</p>}
    </div>
  );
}
