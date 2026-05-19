import type { ReactNode } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import Tabs, { type TabItem } from '@/components/admin/ui/Tabs';
import AdminButton from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';

export const metadata = { title: 'Contenus du site' };

const TABS: TabItem[] = [
  { href: '/admin/contenus/formules', label: 'Formules' },
  { href: '/admin/contenus/tarifs', label: 'Tarifs' },
  { href: '/admin/contenus/activites', label: 'Activités' },
  { href: '/admin/contenus/horaires', label: 'Horaires & jours' },
  { href: '/admin/contenus/offres', label: 'Offres home' },
  { href: '/admin/contenus/bar-snack', label: 'Bar & Snack' },
];

export default function ContenusLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.5rem] font-semibold text-admin-text">
            Contenus du site
          </h1>
          <p className="mt-1 text-[0.8125rem] text-admin-text-muted">
            Tout ce qui s&apos;affiche sur familygamescenter.fr · les
            changements sont publiés immédiatement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-admin-border bg-admin-bg-elev px-3 py-1.5 text-[0.8125rem] font-medium text-admin-text hover:bg-admin-bg-sunken"
          >
            <Icon icon={ExternalLink} size={14} />
            Prévisualiser sur le front
          </Link>
        </div>
      </div>

      <div className="mb-5">
        <Tabs items={TABS} />
      </div>

      {children}
    </>
  );
}
