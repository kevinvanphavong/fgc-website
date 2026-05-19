<?php

namespace App\DataFixtures;

use App\Entity\DemandeReservation;
use App\Enum\DemandeReservationStatus;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

/**
 * Fixtures dev — 3 demandes en statuts différents pour préparer
 * le module admin (PR5 back-office).
 */
class DemandeReservationFixtures extends Fixture
{
    public function load(ObjectManager $m): void
    {
        $today = new \DateTimeImmutable('today');

        $rows = [
            [
                'ref' => 'FGC-DEMOAA', 'status' => DemandeReservationStatus::Nouveau,
                'formuleKey' => 'superbowler', 'eventDate' => $today->modify('+14 days'),
                'timeSlot' => '14:00', 'childName' => 'Léo', 'childAge' => 8, 'kidsCount' => 10,
                'parentFirstName' => 'Sophie', 'parentLastName' => 'Martin',
                'parentEmail' => 'sophie.martin@example.fr', 'parentPhone' => '0612345678',
                'cakeNote' => 'Thème Pokémon', 'unitPriceCents' => 2250, 'upsellVR' => false,
            ],
            [
                'ref' => 'FGC-DEMOBB', 'status' => DemandeReservationStatus::Contacte,
                'formuleKey' => 'newbowler', 'eventDate' => $today->modify('+21 days'),
                'timeSlot' => '16:00', 'childName' => 'Inès', 'childAge' => 7, 'kidsCount' => 8,
                'parentFirstName' => 'Marc', 'parentLastName' => 'Durand',
                'parentEmail' => 'marc.durand@example.fr', 'parentPhone' => '0698765432',
                'allergies' => 'Allergie cacahuète', 'unitPriceCents' => 1850, 'upsellVR' => false,
            ],
            [
                'ref' => 'FGC-DEMOCC', 'status' => DemandeReservationStatus::Confirme,
                'formuleKey' => 'probowler', 'eventDate' => $today->modify('+10 days'),
                'timeSlot' => '14:30', 'childName' => 'Camille', 'childAge' => 11, 'kidsCount' => 12,
                'parentFirstName' => 'Julie', 'parentLastName' => 'Bernard',
                'parentEmail' => 'julie.bernard@example.fr', 'parentPhone' => '0711223344',
                'message' => 'Surprise prévue avec photo polaroïd, prévoir 5 min de mise en place.',
                'unitPriceCents' => 2650, 'upsellVR' => true,
            ],
        ];

        foreach ($rows as $d) {
            $r = (new DemandeReservation())
                ->setReference($d['ref'])
                ->setStatus($d['status'])
                ->setFormuleKey($d['formuleKey'])
                ->setEventDate($d['eventDate'])
                ->setTimeSlot($d['timeSlot'])
                ->setChildName($d['childName'])
                ->setChildAge($d['childAge'])
                ->setKidsCount($d['kidsCount'])
                ->setParentFirstName($d['parentFirstName'])
                ->setParentLastName($d['parentLastName'])
                ->setParentEmail($d['parentEmail'])
                ->setParentPhone($d['parentPhone'])
                ->setAcceptCGV(true)
                ->setAcceptNewsletter(false)
                ->setUpsellVR($d['upsellVR'])
                ->setUnitPriceCentsSnapshot($d['unitPriceCents']);
            if (!empty($d['cakeNote'])) $r->setCakeNote($d['cakeNote']);
            if (!empty($d['allergies'])) $r->setAllergies($d['allergies']);
            if (!empty($d['message'])) $r->setMessage($d['message']);
            $m->persist($r);
        }

        $m->flush();
    }
}
