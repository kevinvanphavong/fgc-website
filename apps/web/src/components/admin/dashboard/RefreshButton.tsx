'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCw } from 'lucide-react';
import AdminButton from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';
import { cn } from '@/lib/cn';

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <AdminButton
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={isPending}
      iconLeft={
        <Icon
          icon={RotateCw}
          size={14}
          className={cn(isPending && 'animate-spin')}
        />
      }
    >
      {isPending ? 'Rafraîchissement…' : 'Rafraîchir'}
    </AdminButton>
  );
}
