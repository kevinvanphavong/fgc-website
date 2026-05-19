<?php

namespace App\DataFixtures;

use App\Entity\B2BRequest;
use App\Enum\B2BStage;
use App\Enum\B2BType;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

/**
 * Fixtures dev — 6 demandes B2B (une par stage) pour visualiser le Kanban
 * dès le premier login admin (PR6).
 */
class B2BRequestFixtures extends Fixture
{
    public function load(ObjectManager $m): void
    {
        $today = new \DateTimeImmutable('today');

        $rows = [
            [
                'ref' => 'FGC-B2B-DEMO01', 'stage' => B2BStage::Nouveau,
                'type' => B2BType::Seminaire, 'company' => 'Atos Blois',
                'firstName' => 'Florence', 'lastName' => 'Mercier',
                'email' => 'f.mercier@atos.fr', 'phone' => '06 12 12 12 12',
                'eventDate' => $today->modify('+25 days'), 'attendees' => 32,
                'message' => 'Demande spontanée site web. Date à confirmer.',
                'value' => null,
            ],
            [
                'ref' => 'FGC-B2B-DEMO02', 'stage' => B2BStage::Qualifie,
                'type' => B2BType::TeamBuilding, 'company' => 'Crédit Agricole CV',
                'firstName' => 'Vincent', 'lastName' => 'Rouleau',
                'email' => 'vr@ca-cv.fr', 'phone' => '06 22 22 22 22',
                'eventDate' => $today->modify('+30 days'), 'attendees' => 24,
                'message' => 'Privatisation karaoké + bowling 18h-22h.',
                'value' => 168000,
            ],
            [
                'ref' => 'FGC-B2B-DEMO03', 'stage' => B2BStage::DevisEnvoye,
                'type' => B2BType::Soiree, 'company' => 'Mairie de Blois',
                'firstName' => 'Patricia', 'lastName' => 'Dumas',
                'email' => 'p.dumas@blois.fr', 'phone' => '06 33 33 33 33',
                'eventDate' => $today->modify('+45 days'), 'attendees' => 60,
                'message' => 'Vœux 2027. Cocktail dînatoire + bowling.',
                'value' => 354000,
            ],
            [
                'ref' => 'FGC-B2B-DEMO04', 'stage' => B2BStage::Negociation,
                'type' => B2BType::Seminaire, 'company' => 'Castorama France',
                'firstName' => 'Sandra', 'lastName' => 'Petit',
                'email' => 's.petit@castorama.fr', 'phone' => '06 44 44 44 44',
                'eventDate' => $today->modify('+35 days'), 'attendees' => 45,
                'message' => 'Veut ajouter session VR pour 20 personnes en plus.',
                'value' => 289000,
            ],
            [
                'ref' => 'FGC-B2B-DEMO05', 'stage' => B2BStage::Gagne,
                'type' => B2BType::Soiree, 'company' => 'École Saint-Vincent',
                'firstName' => 'Mathieu', 'lastName' => 'Père',
                'email' => 'pere.m@stvincent.fr', 'phone' => '06 55 55 55 55',
                'eventDate' => $today->modify('+50 days'), 'attendees' => 80,
                'message' => 'Gala fin d\'année. Contrat signé.',
                'value' => 420000,
            ],
            [
                'ref' => 'FGC-B2B-DEMO06', 'stage' => B2BStage::Perdu,
                'type' => B2BType::Seminaire, 'company' => 'Aldi Loir-et-Cher',
                'firstName' => 'Olivia', 'lastName' => 'Renault',
                'email' => 'o.renault@aldi.fr', 'phone' => '06 66 66 66 66',
                'eventDate' => null, 'attendees' => 22,
                'message' => 'Choisi un autre prestataire.',
                'value' => 145000,
            ],
        ];

        foreach ($rows as $d) {
            $b = (new B2BRequest())
                ->setReference($d['ref'])
                ->setStage($d['stage'])
                ->setType($d['type'])
                ->setCompanyName($d['company'])
                ->setContactFirstName($d['firstName'])
                ->setContactLastName($d['lastName'])
                ->setContactEmail($d['email'])
                ->setContactPhone($d['phone'])
                ->setEventDate($d['eventDate'])
                ->setExpectedAttendees($d['attendees'])
                ->setMessage($d['message'])
                ->setEstimatedValueCents($d['value'])
                ->setAcceptRgpd(true);

            // Stamps cohérents avec le stage atteint.
            $now = new \DateTimeImmutable();
            if (in_array($d['stage'], [B2BStage::Qualifie, B2BStage::DevisEnvoye, B2BStage::Negociation, B2BStage::Gagne, B2BStage::Perdu], true)) {
                $b->setInternalQualifiedAt($now->modify('-3 days'));
            }
            if (in_array($d['stage'], [B2BStage::DevisEnvoye, B2BStage::Negociation, B2BStage::Gagne], true)) {
                $b->setInternalQuotedAt($now->modify('-2 days'));
            }
            if (in_array($d['stage'], [B2BStage::Negociation, B2BStage::Gagne], true)) {
                $b->setInternalNegotiatedAt($now->modify('-1 day'));
            }
            if (in_array($d['stage'], [B2BStage::Gagne, B2BStage::Perdu], true)) {
                $b->setInternalClosedAt($now);
            }

            $m->persist($b);
        }

        $m->flush();
    }
}
