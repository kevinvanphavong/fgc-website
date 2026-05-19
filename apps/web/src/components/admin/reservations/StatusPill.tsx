'use client';

import { cn } from '@/lib/cn';
import { STATUS_META } from '@/lib/admin-hooks/reservation-meta';
import type { ReservationStatus } from '@/lib/admin-hooks/useDemandeReservation';

interface StatusPillProps {
  status: ReservationStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusPill({ status, size = 'sm', className }: StatusPillProps) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[0.7rem]' : 'px-2.5 py-1 text-xs',
        meta.pillBg,
        meta.pillText,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dotBg)} aria-hidden />
      {meta.label}
    </span>
  );
}
