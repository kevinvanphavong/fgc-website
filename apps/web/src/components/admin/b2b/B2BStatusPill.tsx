'use client';

import { cn } from '@/lib/cn';
import { B2B_STAGE_META } from '@/lib/admin-hooks/b2b-meta';
import type { B2BStage } from '@/lib/admin-hooks/useB2BRequest';

interface B2BStatusPillProps {
  stage: B2BStage;
  size?: 'sm' | 'md';
  className?: string;
}

export default function B2BStatusPill({ stage, size = 'sm', className }: B2BStatusPillProps) {
  const meta = B2B_STAGE_META[stage];
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
