import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminProviders from '@/components/admin/AdminProviders';
import AdminShell from '@/components/admin/shell/AdminShell';
import { getCurrentUser } from '@/lib/admin-auth';
import { getNotifications } from '@/lib/admin-api';

export const metadata: Metadata = {
  title: {
    default: 'Back office',
    template: '%s · Back office FGC',
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Double garde après le middleware (token absent ou JWT expiré côté API).
  if (!user) {
    redirect('/admin/login');
  }

  const notifications = await getNotifications();

  return (
    <AdminProviders>
      <AdminShell user={user} notifications={notifications}>
        {children}
      </AdminShell>
    </AdminProviders>
  );
}
