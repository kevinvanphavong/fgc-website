import { Suspense } from 'react';
import SetupPasswordClient from '@/components/admin/auth/SetupPasswordClient';

export const metadata = { title: 'Activer mon compte' };

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<div className="text-sm text-admin-text-muted">Chargement…</div>}>
      <SetupPasswordClient />
    </Suspense>
  );
}
