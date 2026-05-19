import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/sections/legal/CookieBanner';
import ClientProviders from '@/components/client/ClientProviders';
import ClientShell from '@/components/sections/compte/ClientShell';
import { getCurrentClient } from '@/lib/client-auth';

/**
 * Route group `(client)` — espace client connecté.
 *
 * Layout dédié (pas dans `(public)/`) avec :
 *   - Vérification cookie `client_token` côté server → redirect `/connexion?next=...`.
 *   - Header public + Footer public + CookieBanner — **identique** au site public
 *     pour la cohérence visuelle (tokens DS public uniquement, **pas** de violet
 *     admin) — mais on duplique le shell ici car les route groups Next.js ne
 *     partagent pas leurs layouts.
 *   - <ClientShell> ajoute la sous-nav horizontale "Mon profil / Mes réservations
 *     / Déconnexion".
 */
export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentClient();
  if (!user) redirect('/connexion?next=/compte');

  return (
    <ClientProviders>
      <div className="fgc-public">
        <div className="bg-ambient" aria-hidden="true" />
        <Header initialUser={user} />
        <main id="main" className="relative z-[1]">
          <ClientShell user={user}>{children}</ClientShell>
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </ClientProviders>
  );
}
