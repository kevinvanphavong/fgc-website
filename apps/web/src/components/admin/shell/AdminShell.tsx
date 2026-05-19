'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from '@/components/admin/cmdk/CommandPalette';
import ShortcutsHelpModal from '@/components/admin/cmdk/ShortcutsHelpModal';
import TweaksPanel from '@/components/admin/tweaks/TweaksPanel';
import { findRouteByPath } from '@/lib/admin-nav';
import { useAdminKeyboard } from '@/lib/admin-keyboard';
import { useAdminTweaks } from '@/lib/admin-tweaks';
import type { AdminUser } from '@/lib/admin-auth';
import type { DashboardNotification } from '@/lib/admin-api';

type AdminShellProps = {
  user: AdminUser;
  notifications: DashboardNotification[];
  children: React.ReactNode;
};

export default function AdminShell({
  user,
  notifications,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { tweaks, update } = useAdminTweaks();
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const current = findRouteByPath(pathname);
  const currentLabel = current?.label ?? 'Dashboard';
  const activeKey = current?.key;

  // Bascule auto en `floating` sous 1024px (responsive PR8).
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const apply = () => {
      if (mq.matches && tweaks.sidebar !== 'floating') {
        update({ sidebar: 'floating' });
      }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⌘K palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdkOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Raccourcis `g d`, `?`, `/`.
  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );
  useAdminKeyboard({
    onNavigate: handleNavigate,
    onOpenHelp: () => setHelpOpen(true),
  });

  // Mode "floating" : sidebar overlay, fermée par défaut.
  const isFloating = tweaks.sidebar === 'floating';
  const collapsed = tweaks.sidebar === 'collapsed';
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    if (isFloating) {
      setMobileSidebarOpen((o) => !o);
    } else {
      update({ sidebar: collapsed ? 'expanded' : 'collapsed' });
    }
  };

  return (
    <div className="admin-root flex">
      <a href="#admin-main" className="admin-skip-link">
        Aller au contenu
      </a>

      {/* Sidebar — flow normal en desktop, drawer overlay en floating. */}
      {!isFloating && (
        <Sidebar activeKey={activeKey} collapsed={collapsed} user={user} />
      )}

      {/* Sidebar floating (mobile/tablette) — overlay déclenché par hamburger. */}
      {isFloating && mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden
          />
          <div className="fixed left-0 top-0 z-40 h-screen" data-admin-anim="drawer">
            <Sidebar activeKey={activeKey} collapsed={false} user={user} />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          currentLabel={currentLabel}
          notifications={notifications}
          onToggleSidebar={toggleSidebar}
          onOpenCmdK={() => setCmdkOpen(true)}
          onOpenHelp={() => setHelpOpen(true)}
        />
        <main
          id="admin-main"
          className="flex-1 overflow-y-auto px-6 py-6 max-md:px-3 max-md:py-3"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      <CommandPalette open={cmdkOpen} onClose={() => setCmdkOpen(false)} />
      <ShortcutsHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <TweaksPanel />
    </div>
  );
}
