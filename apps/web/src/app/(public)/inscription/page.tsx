import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentClient } from '@/lib/client-auth';
import RegisterClientForm from '@/components/sections/auth/RegisterClientForm';

export const metadata = {
  title: 'Inscription',
  description: 'Créez votre espace Family Games Center pour réserver vos prochains anniversaires.',
};

export default async function InscriptionPage() {
  const user = await getCurrentClient();
  if (user) redirect('/compte');

  return (
    <section className="section">
      <div className="wrap mx-auto flex max-w-[520px] flex-col gap-6">
        <header className="text-center">
          <span className="inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            Espace client
          </span>
          <h1 className="mt-2 hero-title" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
            Créer mon <span className="pop">compte</span>
          </h1>
          <p className="mt-3 max-w-fgc-lead text-[1rem] text-fgc-cream/80 mx-auto">
            Suivez vos réservations, gardez vos coordonnées à portée, et organisez vos anniversaires en deux clics.
          </p>
        </header>
        <Suspense fallback={null}>
          <RegisterClientForm />
        </Suspense>
      </div>
    </section>
  );
}
