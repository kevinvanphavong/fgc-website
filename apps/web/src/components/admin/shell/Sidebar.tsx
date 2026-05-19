'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { ADMIN_ROUTES, ADMIN_SECTIONS, type AdminSectionTitle } from '@/lib/admin-nav';
import Avatar from '@/components/admin/ui/Avatar';
import Icon from '@/components/admin/ui/Icon';
import type { AdminUser } from '@/lib/admin-auth';
import { cn } from '@/lib/cn';
import { useReservationsStats } from '@/lib/admin-hooks/useDemandeReservation';
import { useB2BStats } from '@/lib/admin-hooks/useB2BRequest';
import { useMessagesNewCount } from '@/lib/admin-hooks/useContactMessages';

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: 'Administrateur',
  ROLE_MANAGER: 'Manager',
  ROLE_STAFF: 'Staff',
};

function topRoleLabel(roles: string[]): string {
  if (roles.includes('ROLE_ADMIN')) return ROLE_LABELS.ROLE_ADMIN;
  if (roles.includes('ROLE_MANAGER')) return ROLE_LABELS.ROLE_MANAGER;
  return ROLE_LABELS.ROLE_STAFF;
}

type SidebarProps = {
  activeKey: string | undefined;
  collapsed: boolean;
  user: AdminUser;
};

export default function Sidebar({ activeKey, collapsed, user }: SidebarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user.email;
  const role = topRoleLabel(user.roles);
  // Badge live sur "Réservations" : count des demandes en `nouveau`.
  // Polling 60s + refetch sur focus (cf. useReservationsStats).
  const { data: resaStats } = useReservationsStats();
  const newReservations = resaStats?.byStatus.nouveau ?? 0;
  // PR6 — count B2B `nouveau` pour badge "Demandes B2B".
  const { data: b2bStats } = useB2BStats();
  const newB2B = b2bStats?.byStage.nouveau ?? 0;
  // PR9 finitions — badge messages contact.
  const { data: newMessages = 0 } = useMessagesNewCount();

  const isAdmin = user.roles.includes('ROLE_ADMIN');
  const enrichedRoutes = ADMIN_ROUTES
    // Item "Utilisateurs" caché aux non-admin (PR7) — l'API refuse aussi.
    .filter((r) => r.key !== 'users' || isAdmin)
    .map((r) => {
      if (r.key === 'reservations' && newReservations > 0) {
        return { ...r, badge: String(newReservations) };
      }
      if (r.key === 'b2b' && newB2B > 0) {
        return { ...r, badge: String(newB2B) };
      }
      if (r.key === 'messages' && newMessages > 0) {
        return { ...r, badge: String(newMessages) };
      }
      return r;
    });

  const sections = ADMIN_SECTIONS.map((title) => ({
    title,
    items: enrichedRoutes.filter((r) => r.section === title),
  })).filter((s) => s.items.length > 0) as {
    title: AdminSectionTitle;
    items: typeof ADMIN_ROUTES;
  }[];

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-r border-admin-border bg-admin-bg-elev transition-[width] duration-200 ease-out',
        collapsed ? 'w-[68px]' : 'w-[252px]'
      )}
      aria-label="Navigation back-office"
    >
      {/* Brand */}
      <div
        className={cn(
          'flex items-center gap-3 border-b border-admin-border-soft px-4 py-4',
          collapsed && 'justify-center px-0'
        )}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-semibold text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg, #5E2DB8, #3D1B6B)' }}
        >
          F
        </div>
        {!collapsed ? (
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[0.9375rem] font-semibold text-admin-text">
              Family Games
            </div>
            <div className="truncate text-[0.75rem] text-admin-text-muted">
              Back Office
            </div>
          </div>
        ) : null}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? 'mt-4' : ''}>
            {!collapsed ? (
              <div className="px-3 pb-1 pt-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-admin-text-muted">
                {section.title}
              </div>
            ) : (
              <div className="my-2 h-px bg-admin-border-soft" aria-hidden="true" />
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = activeKey === item.key;
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.875rem] font-medium transition-colors',
                        active
                          ? 'bg-admin-brand-soft text-admin-brand'
                          : 'text-admin-text hover:bg-admin-bg-sunken',
                        collapsed && 'justify-center px-0'
                      )}
                    >
                      <Icon
                        icon={item.icon}
                        size={17}
                        className={cn(
                          active ? 'text-admin-brand' : 'text-admin-text-muted'
                        )}
                      />
                      {!collapsed ? (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge ? (
                            <span
                              className={cn(
                                'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-semibold text-white',
                                // Réservations B2C + Demandes B2B + Messages = rouge
                                // (charge à traiter rapidement). Les autres
                                // restent brand.
                                item.key === 'reservations' || item.key === 'b2b' || item.key === 'messages'
                                  ? 'bg-admin-red'
                                  : 'bg-admin-brand',
                              )}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Foot — user réel (issu du JWT via getCurrentUser côté server) */}
      <div
        ref={menuRef}
        className={cn(
          'relative flex items-center gap-2.5 border-t border-admin-border-soft px-3 py-3',
          collapsed && 'justify-center px-0'
        )}
      >
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className={cn(
            'flex flex-1 items-center gap-2.5 rounded-md p-1 text-left transition-colors hover:bg-admin-bg-sunken',
            collapsed && 'flex-none justify-center'
          )}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          title={collapsed ? `${displayName} · ${role}` : 'Menu compte'}
        >
          <Avatar
            name={displayName}
            size="sm"
            gradient={user.avatarColor ?? undefined}
          />
          {!collapsed ? (
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[0.8125rem] font-semibold text-admin-text">
                {displayName}
              </div>
              <div className="truncate text-[0.6875rem] text-admin-text-muted">
                {role}
              </div>
            </div>
          ) : null}
        </button>

        {menuOpen ? (
          <div
            role="menu"
            className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-md border border-admin-border bg-admin-bg-elev shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[0.8125rem] text-admin-text transition-colors hover:bg-admin-bg-sunken disabled:opacity-60"
            >
              <Icon
                icon={LogOut}
                size={15}
                className="text-admin-text-muted"
              />
              {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
