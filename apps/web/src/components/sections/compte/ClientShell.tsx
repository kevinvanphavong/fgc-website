'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLogoutClient, type ClientUser } from '@/lib/use-client';
import { cn } from '@/lib/cn';

interface Props {
  user: ClientUser;
  children: React.ReactNode;
}

const NAV = [
  { href: '/compte', label: 'Mon profil' },
  { href: '/compte/reservations', label: 'Mes réservations' },
];

export default function ClientShell({ user, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogoutClient();

  return (
    <div className="section">
      <div className="wrap mx-auto max-w-[920px] flex flex-col gap-8">
        <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="inline-block font-display text-[0.85rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
              Espace client
            </span>
            <h1 className="hero-title mt-1" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              Salut, <span className="pop">{user.firstName ?? 'vous'}</span>
            </h1>
          </div>
          <nav
            aria-label="Sous-navigation espace client"
            className="flex flex-wrap items-center gap-2 rounded-full border border-fgc-yellow/15 bg-fgc-card-soft/40 p-1.5"
          >
            {NAV.map((item) => {
              const active =
                item.href === '/compte' ? pathname === '/compte' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-4 py-2 font-display text-[0.85rem] uppercase tracking-fgc-cap transition-colors',
                    active
                      ? 'bg-fgc-yellow text-fgc-purple shadow-fgc-btn-yellow'
                      : 'text-fgc-cream/85 hover:bg-fgc-yellow/10 hover:text-fgc-yellow',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={async () => {
                await logout.mutateAsync();
                router.refresh();
                router.push('/');
              }}
              className="rounded-full px-4 py-2 font-display text-[0.85rem] uppercase tracking-fgc-cap text-fgc-pink-hot transition-colors hover:bg-fgc-pink-hot/10"
            >
              Déconnexion
            </button>
          </nav>
        </header>

        <div>{children}</div>
      </div>
    </div>
  );
}
