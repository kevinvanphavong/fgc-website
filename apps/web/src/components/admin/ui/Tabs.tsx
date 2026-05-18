'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

export type TabItem = {
  href: string;
  label: string;
};

export default function Tabs({ items }: { items: TabItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-admin-border"
      aria-label="Onglets contenu"
    >
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative whitespace-nowrap px-3 py-2.5 text-[0.875rem] font-medium transition-colors',
              active
                ? 'text-admin-brand'
                : 'text-admin-text-muted hover:text-admin-text'
            )}
          >
            {item.label}
            <span
              className={cn(
                'absolute inset-x-2 -bottom-px h-0.5 rounded-t transition-colors',
                active ? 'bg-admin-brand' : 'bg-transparent'
              )}
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </nav>
  );
}
