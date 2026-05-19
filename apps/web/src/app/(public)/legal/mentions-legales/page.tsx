import type { Metadata } from 'next';
import LegalPageShell from '@/components/sections/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Mentions légales · Family Games Center',
  description:
    'Mentions légales du site Family Games Center : éditeur, hébergeur, propriété intellectuelle, contact.',
  alternates: { canonical: '/legal/mentions-legales' },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPageShell
      title="Mentions légales"
      intro="Informations légales relatives à l'éditeur et à l'hébergement du site familygamescenter.fr."
    >
      <h2>1. Éditeur du site</h2>
      <p>
        <strong>Family Games Center</strong> (anciennement Bowling de Blois)
        <br />
        25 rue Robert Nau, 41000 Blois, France
        <br />
        Téléphone : 02 54 74 85 21
        <br />
        Email : contact@familygamescenter.fr
        <br />
        Directeur de la publication : Kévin Vong, gérant.
      </p>
      <p>
        SIRET : <em>[à compléter]</em> · Code APE : <em>[à compléter]</em> · TVA
        intracommunautaire : <em>[à compléter]</em>.
      </p>

      <h2>2. Hébergement</h2>
      <p>
        Le site est hébergé par <em>[Hébergeur — à compléter]</em>, dont les
        coordonnées peuvent être obtenues sur demande à
        contact@familygamescenter.fr.
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du site (textes, visuels, logos, photographies,
        affiches) est protégé par les lois en vigueur sur la propriété
        intellectuelle. Toute reproduction, même partielle, sans autorisation
        écrite préalable est interdite.
      </p>

      <h2>4. Crédits</h2>
      <ul>
        <li>Design et identité visuelle : Family Games Center</li>
        <li>Photographies : équipe FGC + visuels Claude Design 2026</li>
        <li>Développement : Family Games Center</li>
      </ul>

      <h2>5. Contact</h2>
      <p>
        Pour toute question relative aux présentes mentions :{' '}
        <a href="/contact">formulaire de contact</a> ou
        contact@familygamescenter.fr.
      </p>
    </LegalPageShell>
  );
}
