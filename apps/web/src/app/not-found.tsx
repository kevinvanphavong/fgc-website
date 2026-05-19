import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import CookieBanner from '@/components/sections/legal/CookieBanner';
import ClientProviders from '@/components/client/ClientProviders';
import { getCurrentClient } from '@/lib/client-auth';

/**
 * 404 racine (PR9 finitions) — un route-group (public) ne capture pas les URLs
 * inconnues à la racine, donc on duplique le header+footer ici plutôt que
 * d'inclure la page dans le group. Layout cohérent visuellement.
 *
 * Wrap par ClientProviders (PR11) parce que Header utilise désormais
 * useClient() (React Query) pour afficher le menu utilisateur.
 */
export const metadata = { title: 'Page introuvable' };

export default async function NotFound() {
  const user = await getCurrentClient();
  return (
    <ClientProviders>
    <div className="fgc-public">
      <div className="bg-ambient" aria-hidden="true" />
      <Header initialUser={user} />
      <main className="relative z-[1]">
        <section className="section">
          <div className="wrap mx-auto flex max-w-[820px] flex-col items-center gap-6 text-center">
            <div className="text-[5rem] leading-none">🎳</div>
            <span className="inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
              Erreur 404
            </span>
            <h1 className="hero-title" style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)' }}>
              Cette page <span className="pop">n&apos;existe pas.</span>
            </h1>
            <p className="max-w-fgc-lead text-[1.05rem] text-fgc-cream/85">
              Vous êtes peut-être tombé sur un strike… dans le vide. Le lien que
              vous avez suivi n&apos;est plus valide ou n&apos;a jamais existé.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-4">
              <Button href="/" variant="primary">
                Retour à l&apos;accueil
              </Button>
              <Button href="/tarifs-et-formules" variant="ghost">
                Voir nos activités
              </Button>
            </div>
            <p className="mt-6 text-[0.85rem] text-fgc-cream/60">
              Une question ?{' '}
              <Link href="/contact" className="underline hover:text-fgc-yellow">
                Contactez-nous
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <CookieBanner />
    </div>
    </ClientProviders>
  );
}
