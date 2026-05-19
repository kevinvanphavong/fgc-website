import type { Metadata } from 'next';
import LegalPageShell from '@/components/sections/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente · Family Games Center',
  description:
    'CGV du Family Games Center : réservations anniversaire enfant, événements entreprise, parties au comptoir.',
  alternates: { canonical: '/legal/cgv' },
};

export default function CGVPage() {
  return (
    <LegalPageShell
      title="Conditions Générales de Vente"
      intro="Conditions applicables aux prestations de loisirs proposées par Family Games Center : réservations anniversaire enfant, événements entreprise, achats de parties et formules au comptoir."
    >
      <h2>1. Champ d&apos;application</h2>
      <p>
        Les présentes CGV régissent les relations entre Family Games Center et
        ses clients pour toute réservation effectuée via le site, par téléphone
        ou sur place. Le fait de réserver vaut acceptation pleine et entière des
        présentes conditions.
      </p>

      <h2>2. Réservations anniversaire enfant</h2>
      <h3>2.1. Modalités</h3>
      <p>
        Toute demande de réservation anniversaire passe par le formulaire en
        ligne <a href="/reserver-anniversaire">/reserver-anniversaire</a>. Une
        demande validée fait l&apos;objet d&apos;une confirmation téléphonique
        sous 24h ouvrées par l&apos;équipe FGC.
      </p>
      <h3>2.2. Acompte</h3>
      <p>
        Un acompte de <strong>50 €</strong> est demandé pour confirmer la
        réservation. Cet acompte est encaissé sur place ou par virement après
        l&apos;échange téléphonique. Il est imputé sur la facture finale.
      </p>
      <h3>2.3. Annulation</h3>
      <p>
        Toute annulation à plus de <strong>7 jours</strong> de la date prévue
        donne lieu au remboursement intégral de l&apos;acompte. En deçà de 7
        jours, l&apos;acompte reste acquis sauf cas de force majeure dûment
        justifié.
      </p>
      <h3>2.4. Nombre d&apos;enfants</h3>
      <p>
        La facturation est établie sur la base du nombre d&apos;enfants
        effectivement présents, dans la limite du minimum prévu par la formule
        choisie.
      </p>

      <h2>3. Événements entreprise</h2>
      <p>
        Les prestations entreprises (séminaires, team building, soirées) font
        l&apos;objet d&apos;un devis personnalisé valable 30 jours. La
        confirmation requiert la signature du devis et un acompte de 30%
        minimum, le solde étant réglé le jour de l&apos;événement.
      </p>

      <h2>4. Parties et formules au comptoir</h2>
      <p>
        Les tarifs affichés en caisse et sur le site sont applicables. Les
        formules promotionnelles (happy hour, etc.) sont soumises à des
        conditions d&apos;horaires précisées sur place.
      </p>

      <h2>5. Responsabilité</h2>
      <p>
        Family Games Center décline toute responsabilité pour les objets perdus
        ou volés sur place. Les enfants restent sous la responsabilité de leurs
        parents ou accompagnateurs durant toute la durée de la prestation.
      </p>

      <h2>6. Médiation de la consommation</h2>
      <p>
        Conformément à l&apos;article L.612-1 du code de la consommation, en cas
        de litige non résolu, le consommateur peut recourir gratuitement au
        service de médiation. Coordonnées du médiateur : <em>[à compléter]</em>.
      </p>

      <h2>7. Droit applicable</h2>
      <p>
        Les présentes CGV sont soumises au droit français. En cas de litige, les
        tribunaux français sont compétents.
      </p>
    </LegalPageShell>
  );
}
