'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { findRouteByPath } from '@/lib/admin-nav';
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
  const [collapsed, setCollapsed] = useState(false);

  const current = findRouteByPath(pathname);
  const currentLabel = current?.label ?? 'Dashboard';
  const activeKey = current?.key;

  // Auto-collapse en <lg (980px). On ne persiste pas la valeur en PR1.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 979px)');
    const apply = () => setCollapsed(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // ⌘K placeholder — handler complet en PR8.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // eslint-disable-next-line no-console
        console.log('[admin] ⌘K — command palette à brancher en PR8');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openCmdK = () => {
    // eslint-disable-next-line no-console
    console.log('[admin] ⌘K — command palette à brancher en PR8');
  };

  return (
    <div className="admin-root flex">
      <Sidebar activeKey={activeKey} collapsed={collapsed} user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          currentLabel={currentLabel}
          notifications={notifications}
          onToggleSidebar={() => setCollapsed((c) => !c)}
          onOpenCmdK={openCmdK}
        />
        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
