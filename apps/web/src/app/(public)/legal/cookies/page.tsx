import type { Metadata } from 'next';
import LegalPageShell from '@/components/sections/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Politique de cookies · Family Games Center',
  description:
    'Liste des cookies utilisés par familygamescenter.fr et explication de leur finalité.',
  alternates: { canonical: '/legal/cookies' },
};

export default function CookiesPage() {
  return (
    <LegalPageShell
      title="Politique de cookies"
      intro="Liste exhaustive des cookies déposés par notre site et explication de leur finalité."
    >
      <h2>1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p>
        Un cookie est un petit fichier texte déposé sur votre appareil par le
        navigateur lors de la visite d&apos;un site. Il permet de mémoriser des
        informations (préférences, session de connexion, statistiques).
      </p>

      <h2>2. Cookies utilisés sur familygamescenter.fr</h2>

      <h3>2.1. Cookies nécessaires (toujours actifs)</h3>
      <p>
        Ces cookies sont indispensables au fonctionnement du site et ne peuvent
        être désactivés.
      </p>
      <ul>
        <li>
          <strong>admin_token</strong> (httpOnly, secure) : session
          d&apos;authentification du back-office. Durée : 7 jours. Déposé
          uniquement après connexion sur <a href="/admin/login">/admin/login</a>.
        </li>
      </ul>

      <h3>2.2. Cookies d&apos;analytics</h3>
      <p>
        <strong>Actuellement aucun</strong>. Si nous ajoutons un outil
        d&apos;analytics (Plausible, GA4) à l&apos;avenir, il sera désactivé par
        défaut et soumis à votre consentement explicite via le bandeau
        cookies.
      </p>

      <h3>2.3. Cookies marketing</h3>
      <p>
        <strong>Actuellement aucun</strong>. Aucun pixel publicitaire,
        retargeting ou outil de tracking tiers n&apos;est déposé.
      </p>

      <h2>3. Gestion du consentement</h2>
      <p>
        Vous pouvez à tout moment modifier vos préférences via le bouton
        &laquo; Gérer mes cookies &raquo; en bas de page. Votre choix est
        conservé pendant 13 mois, après quoi vous serez recontacté pour
        confirmer.
      </p>

      <h2>4. Refus complet</h2>
      <p>
        Vous pouvez bloquer tous les cookies via les réglages de votre
        navigateur. Notez que cela peut empêcher l&apos;accès au back-office
        (qui nécessite la session d&apos;authentification).
      </p>

      <h2>5. Plus d&apos;informations</h2>
      <p>
        Consultez notre{' '}
        <a href="/legal/politique-confidentialite">
          politique de confidentialité
        </a>{' '}
        pour comprendre comment nous traitons vos données.
      </p>
    </LegalPageShell>
  );
}
