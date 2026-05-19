import type { Metadata } from 'next';
import LegalPageShell from '@/components/sections/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Politique de confidentialité · Family Games Center',
  description:
    'Données collectées, durée de conservation, droits RGPD : politique de confidentialité du Family Games Center.',
  alternates: { canonical: '/legal/politique-confidentialite' },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPageShell
      title="Politique de confidentialité"
      intro="Information sur les données personnelles que nous collectons, leur durée de conservation et vos droits conformément au RGPD."
    >
      <h2>1. Responsable de traitement</h2>
      <p>
        Family Games Center, 25 rue Robert Nau, 41000 Blois, représenté par
        Kévin Vong, gérant. Contact :
        <a href="mailto:contact@familygamescenter.fr">
          contact@familygamescenter.fr
        </a>
        .
      </p>

      <h2>2. Données collectées</h2>
      <h3>2.1. Formulaire de contact</h3>
      <p>
        Nom, email, téléphone (facultatif), sujet et contenu du message. Base
        légale : intérêt légitime à répondre aux sollicitations.
      </p>
      <h3>2.2. Tunnel de réservation anniversaire</h3>
      <p>
        Coordonnées du parent organisateur, prénom et âge de l&apos;enfant fêté,
        nombre d&apos;invités, allergies éventuelles, créneau souhaité. Base
        légale : exécution du contrat (préparation de la prestation).
      </p>
      <h3>2.3. Demandes de devis entreprise</h3>
      <p>
        Coordonnées professionnelles, type d&apos;événement, nombre de
        participants, date souhaitée. Base légale : démarche pré-contractuelle.
      </p>
      <h3>2.4. Compte administrateur</h3>
      <p>
        Pour les utilisateurs du back-office uniquement : email, hash du mot de
        passe, rôle, date de dernière connexion. Base légale : exécution du
        contrat de travail.
      </p>

      <h2>3. Durée de conservation</h2>
      <ul>
        <li>Messages contact : <strong>3 ans</strong> après dernier contact.</li>
        <li>
          Demandes de réservation anniversaire non confirmées :{' '}
          <strong>3 ans</strong> à des fins de prospection.
        </li>
        <li>
          Réservations honorées : <strong>10 ans</strong> (obligations
          comptables).
        </li>
        <li>
          Demandes B2B : <strong>3 ans</strong> à des fins de prospection
          B2B.
        </li>
        <li>Comptes admin : durée du contrat + 1 an.</li>
      </ul>

      <h2>4. Destinataires</h2>
      <p>
        Les données ne sont accessibles qu&apos;à l&apos;équipe FGC. Aucune
        cession à des tiers à des fins commerciales. Sous-traitants éventuels
        (hébergement, mailing) : <em>[à compléter]</em>.
      </p>

      <h2>5. Vos droits</h2>
      <p>
        Conformément aux articles 15 à 22 du RGPD, vous disposez d&apos;un
        droit d&apos;accès, de rectification, d&apos;effacement, de limitation,
        d&apos;opposition et de portabilité. Pour exercer ces droits, contactez
        <a href="mailto:contact@familygamescenter.fr">
          contact@familygamescenter.fr
        </a>
        .
      </p>
      <p>
        En cas de litige non résolu, vous pouvez introduire une réclamation
        auprès de la CNIL (
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          cnil.fr
        </a>
        ).
      </p>

      <h2>6. Sécurité</h2>
      <p>
        Les données sont stockées dans une base PostgreSQL hébergée en Europe,
        avec chiffrement en transit (HTTPS) et au repos. Les mots de passe sont
        hachés via Argon2id. L&apos;accès au back-office est protégé par
        authentification JWT.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Voir notre <a href="/legal/cookies">politique de cookies</a>.
      </p>
    </LegalPageShell>
  );
}
