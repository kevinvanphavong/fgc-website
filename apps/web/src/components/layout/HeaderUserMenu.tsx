'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useClient, useLogoutClient, type ClientUser } from '@/lib/use-client';
import { cn } from '@/lib/cn';

interface HeaderUserMenuProps {
  initialUser: ClientUser | null;
}

function initials(user: ClientUser): string {
  const fn = user.firstName?.[0] ?? '';
  const ln = user.lastName?.[0] ?? '';
  const v = `${fn}${ln}`.toUpperCase();
  return v || user.email[0]?.toUpperCase() || '?';
}

export default function HeaderUserMenu({ initialUser }: HeaderUserMenuProps) {
  const { user: liveUser } = useClient();
  const user = liveUser ?? initialUser;
  const logout = useLogoutClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!user) {
    return (
      <Link
        href="/connexion"
        className="hidden items-center gap-2 rounded-full border border-fgc-yellow/30 px-4 py-2.5 font-display text-[0.85rem] uppercase tracking-fgc-cap text-fgc-cream transition-colors hover:border-fgc-yellow/60 hover:text-fgc-yellow md:inline-flex"
      >
        Se connecter
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full border-2 border-fgc-yellow/40 bg-fgc-pink-hot/20 font-display text-[0.85rem] uppercase text-fgc-yellow transition-colors hover:border-fgc-yellow',
          open && 'border-fgc-yellow',
        )}
        aria-label={`Menu de ${user.fullName}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {initials(user)}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-[220px] rounded-fgc-card-soft border border-fgc-yellow/20 bg-[rgba(15,5,40,0.97)] p-2 shadow-fgc-soft">
          <div className="px-3 py-2 text-[0.78rem] leading-tight text-fgc-cream/70">
            Connecté en tant que
            <div className="font-display text-[0.95rem] text-fgc-yellow">
              {user.firstName ?? user.email}
            </div>
          </div>
          <div className="my-1 h-px bg-fgc-yellow/15" />
          <Link
            href="/compte"
            className="block rounded-fgc-sm px-3 py-2 font-display text-[0.85rem] uppercase text-fgc-cream transition-colors hover:bg-fgc-yellow/10 hover:text-fgc-yellow"
            onClick={() => setOpen(false)}
          >
            Mon profil
          </Link>
          <Link
            href="/compte/reservations"
            className="block rounded-fgc-sm px-3 py-2 font-display text-[0.85rem] uppercase text-fgc-cream transition-colors hover:bg-fgc-yellow/10 hover:text-fgc-yellow"
            onClick={() => setOpen(false)}
          >
            Mes réservations
          </Link>
          <div className="my-1 h-px bg-fgc-yellow/15" />
          <button
            type="button"
            onClick={async () => {
              await logout.mutateAsync();
              setOpen(false);
              router.refresh();
              router.push('/');
            }}
            className="block w-full rounded-fgc-sm px-3 py-2 text-left font-display text-[0.85rem] uppercase text-fgc-pink-hot transition-colors hover:bg-fgc-pink-hot/10"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
