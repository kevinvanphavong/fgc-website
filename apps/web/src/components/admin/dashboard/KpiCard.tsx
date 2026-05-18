import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';
import Sparkline from './Sparkline';
import { cn } from '@/lib/cn';

export type KpiAccent = 'brand' | 'green' | 'amber' | 'pink';

type KpiCardProps = {
  label: string;
  icon: LucideIcon;
  value: string;
  delta: number;
  /** Suffixe humain pour le delta (ex. "vs sem. passée", "vs hier"). */
  deltaSuffix?: string;
  sparkline: number[];
  accent: KpiAccent;
};

const accentMap: Record<
  KpiAccent,
  { sparkline: string; iconBg: string; iconText: string }
> = {
  brand: {
    sparkline: 'text-admin-brand',
    iconBg: 'bg-admin-brand-soft',
    iconText: 'text-admin-brand',
  },
  green: {
    sparkline: 'text-admin-green',
    iconBg: 'bg-admin-green-soft',
    iconText: 'text-admin-green',
  },
  amber: {
    sparkline: 'text-admin-amber',
    iconBg: 'bg-admin-amber-soft',
    iconText: 'text-admin-amber',
  },
  pink: {
    sparkline: 'text-admin-pink',
    iconBg: 'bg-admin-pink-soft',
    iconText: 'text-admin-pink',
  },
};

export default function KpiCard({
  label,
  icon,
  value,
  delta,
  deltaSuffix,
  sparkline,
  accent,
}: KpiCardProps) {
  const colors = accentMap[accent];
  const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendClasses =
    trend === 'up'
      ? 'text-admin-green'
      : trend === 'down'
        ? 'text-admin-red'
        : 'text-admin-text-muted';

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-admin-border bg-admin-bg-elev p-4 shadow-[0_1px_2px_rgba(15,18,38,0.04)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.75rem] font-medium uppercase tracking-wider text-admin-text-muted">
          {label}
        </span>
        <span
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-lg',
            colors.iconBg,
            colors.iconText
          )}
          aria-hidden="true"
        >
          <Icon icon={icon} size={15} />
        </span>
      </div>

      <div className="text-[1.625rem] font-semibold leading-none text-admin-text">
        {value}
      </div>

      <div className="flex items-end justify-between gap-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 text-[0.75rem] font-medium',
            trendClasses
          )}
        >
          <Icon icon={TrendIcon} size={12} />
          {delta > 0 ? '+' : ''}
          {delta}%
          {deltaSuffix ? (
            <span className="text-admin-text-muted">· {deltaSuffix}</span>
          ) : null}
        </span>

        <div className={cn('h-9 w-[110px] shrink-0', colors.sparkline)}>
          <Sparkline values={sparkline} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3 rounded-xl border border-admin-border bg-admin-bg-elev p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="h-3 w-24 rounded bg-admin-bg-sunken" />
        <div className="h-7 w-7 rounded-lg bg-admin-bg-sunken" />
      </div>
      <div className="h-7 w-20 rounded bg-admin-bg-sunken" />
      <div className="flex items-end justify-between gap-3">
        <div className="h-3 w-32 rounded bg-admin-bg-sunken" />
        <div className="h-9 w-[110px] rounded bg-admin-bg-sunken" />
      </div>
    </div>
  );
}
