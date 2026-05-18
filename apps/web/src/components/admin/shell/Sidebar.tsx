'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { ADMIN_ROUTES, ADMIN_SECTIONS, type AdminSectionTitle } from '@/lib/admin-nav';
import Avatar from '@/components/admin/ui/Avatar';
import Icon from '@/components/admin/ui/Icon';
import { cn } from '@/lib/cn';

type SidebarProps = {
  activeKey: string | undefined;
  collapsed: boolean;
};

export default function Sidebar({ activeKey, collapsed }: SidebarProps) {
  const sections = ADMIN_SECTIONS.map((title) => ({
    title,
    items: ADMIN_ROUTES.filter((r) => r.section === title),
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
                            <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-admin-brand px-1.5 text-[0.6875rem] font-semibold text-white">
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

      {/* Foot — user pinned (hard-coded en PR1, branché en PR2) */}
      <div
        className={cn(
          'flex items-center gap-2.5 border-t border-admin-border-soft px-3 py-3',
          collapsed && 'justify-center px-0'
        )}
      >
        <Avatar name="Élise Caron" size="sm" />
        {!collapsed ? (
          <>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[0.8125rem] font-semibold text-admin-text">
                Élise Caron
              </div>
              <div className="truncate text-[0.6875rem] text-admin-text-muted">
                Administrateur
              </div>
            </div>
            <button
              type="button"
              className="rounded-md p-1.5 text-admin-text-muted hover:bg-admin-bg-sunken hover:text-admin-text"
              aria-label="Réglages compte"
              title="Réglages compte"
            >
              <Icon icon={Settings} size={16} />
            </button>
          </>
        ) : null}
      </div>
    </aside>
  );
}
