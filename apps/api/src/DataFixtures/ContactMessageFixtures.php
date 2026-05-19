<?php

namespace App\DataFixtures;

use App\Entity\ContactMessage;
use App\Enum\ContactMessageStatus;
use App\Enum\ContactSubject;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

/**
 * Fixtures dev — 3 messages contact (1 par statut) pour préparer l'admin /admin/messages.
 */
class ContactMessageFixtures extends Fixture
{
    public function load(ObjectManager $m): void
    {
        $rows = [
            [
                'ref' => 'FGC-CT-DEMOAA', 'status' => ContactMessageStatus::Nouveau,
                'name' => 'Camille Dupont', 'email' => 'camille.dupont@example.fr',
                'phone' => '06 12 34 56 78', 'subject' => ContactSubject::Anniv,
                'message' => "Bonjour, j'aimerais organiser un anniversaire pour les 10 ans de mon fils en juin. Pouvez-vous m'envoyer des infos ?",
            ],
            [
                'ref' => 'FGC-CT-DEMOBB', 'status' => ContactMessageStatus::Traite,
                'name' => 'Hugo Lemaire', 'email' => 'h.lemaire@example.fr',
                'phone' => null, 'subject' => ContactSubject::Tarifs,
                'message' => "Question sur les tarifs groupes : à partir de combien de personnes c'est valable ?",
            ],
            [
                'ref' => 'FGC-CT-DEMOCC', 'status' => ContactMessageStatus::Archive,
                'name' => 'Sophie Bernard', 'email' => 'sophie.b@example.fr',
                'phone' => '07 11 22 33 44', 'subject' => ContactSubject::Partenariat,
                'message' => "École primaire à proximité — possibilité de partenariat pour les sorties scolaires ?",
            ],
        ];

        foreach ($rows as $row) {
            $entity = (new ContactMessage())
                ->setReference($row['ref'])
                ->setStatus($row['status'])
                ->setName($row['name'])
                ->setEmail($row['email'])
                ->setPhone($row['phone'])
                ->setSubject($row['subject'])
                ->setMessage($row['message'])
                ->setAcceptRgpd(true);
            $m->persist($entity);
        }
        $m->flush();
    }
}
