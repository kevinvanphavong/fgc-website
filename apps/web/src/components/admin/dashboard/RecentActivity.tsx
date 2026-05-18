import {
  CalendarCheck,
  CircleDollarSign,
  UserPlus,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';
import { Card, CardHead } from '@/components/admin/ui/Card';
import { formatRelative } from '@/lib/intl';
import type { DashboardActivity } from '@/lib/admin-api';
import { cn } from '@/lib/cn';

const typeMap: Record<
  DashboardActivity['type'],
  { icon: LucideIcon; bg: string; fg: string }
> = {
  reservation: {
    icon: CalendarCheck,
    bg: 'bg-admin-blue-soft',
    fg: 'text-admin-blue',
  },
  payment: {
    icon: CircleDollarSign,
    bg: 'bg-admin-green-soft',
    fg: 'text-admin-green',
  },
  user: { icon: UserPlus, bg: 'bg-admin-pink-soft', fg: 'text-admin-pink' },
  system: { icon: Activity, bg: 'bg-admin-amber-soft', fg: 'text-admin-amber' },
};

export default function RecentActivity({
  items,
}: {
  items: DashboardActivity[];
}) {
  return (
    <Card>
      <CardHead title="Activité récente" sub="Dernières actions équipe & système" />
      <ul className="divide-y divide-admin-border-soft">
        {items.length === 0 ? (
          <li className="px-5 py-6 text-center text-[0.8125rem] text-admin-text-muted">
            Aucune activité récente.
          </li>
        ) : (
          items.map((item) => {
            const style = typeMap[item.type] ?? typeMap.system;
            return (
              <li
                key={item.id}
                className="flex items-start gap-3 px-5 py-3.5"
              >
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    style.bg,
                    style.fg
                  )}
                  aria-hidden="true"
                >
                  <Icon icon={style.icon} size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.875rem] leading-snug text-admin-text">
                    {item.label}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[0.75rem] text-admin-text-muted">
                    <span>{item.meta}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={item.at}>{formatRelative(item.at)}</time>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </Card>
  );
}
