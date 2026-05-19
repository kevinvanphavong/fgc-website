import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentClient } from '@/lib/client-auth';
import LoginClientForm from '@/components/sections/auth/LoginClientForm';

export const metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre espace Family Games Center pour suivre vos réservations.',
};

export default async function ConnexionPage() {
  const user = await getCurrentClient();
  if (user) redirect('/compte');

  return (
    <section className="section">
      <div className="wrap mx-auto flex max-w-[460px] flex-col gap-6">
        <header className="text-center">
          <span className="inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            Espace client
          </span>
          <h1 className="mt-2 hero-title" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
            <span className="pop">Connexion</span>
          </h1>
        </header>
        <Suspense fallback={null}>
          <LoginClientForm />
        </Suspense>
      </div>
    </section>
  );
}
