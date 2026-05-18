import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/auth/LoginForm';
import { getCurrentUser } from '@/lib/admin-auth';

export const metadata = { title: 'Connexion' };

export default async function AdminLoginPage() {
  // Si déjà loggué, on redirige direct vers le dashboard.
  const user = await getCurrentUser();
  if (user) {
    redirect('/admin');
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-7 flex flex-col items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl font-semibold text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg, #5E2DB8, #3D1B6B)' }}
          aria-hidden="true"
        >
          F
        </div>
        <div className="text-center">
          <div className="text-[1.0625rem] font-semibold text-admin-text">
            Family Games · Back Office
          </div>
          <div className="text-[0.8125rem] text-admin-text-muted">
            Connecte-toi avec ton compte staff
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-admin-border bg-admin-bg-elev p-6 shadow-[0_4px_16px_rgba(15,18,38,0.06)]">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>

      <div className="mt-4 text-center text-[0.75rem] text-admin-text-muted">
        Espace réservé au staff FGC. Toute connexion est tracée.
      </div>
    </div>
  );
}
