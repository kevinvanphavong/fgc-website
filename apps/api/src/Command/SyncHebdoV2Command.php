<?php

namespace App\Command;

use App\Entity\HebdoCard;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:hebdo:sync-v2',
    description: 'Upsert les 3 HebdoCards V2 sans purger le reste de la BDD',
)]
class SyncHebdoV2Command extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $repo = $this->em->getRepository(HebdoCard::class);

        $cards = [
            ['key' => 'bowling-a-volonte', 'oldKey' => 'bowling-illimite', 'tag' => 'Lundi & mardi soir', 'title' => 'Bowling à volonté', 'description' => "Parties illimitées + chaussures + 1 soda offert, de 20h30 jusqu'à la fermeture. Sans réservation, dans la limite des 100 premiers.", 'bullets' => [], 'price' => '20€/pers.', 'days' => 'Lundi · Mardi / 20h30 → fermeture', 'featured' => false, 'savings' => null, 'position' => 0],
            ['key' => 'jeudi-a-gogo', 'oldKey' => null, 'tag' => 'Jeudi · 17h → 22h', 'title' => 'Jeudi à gogo', 'description' => "L'institution du jeudi : bowling illimité + chaussures + 1 soda offert, de 17h à 22h. 100 premiers servis, sans réservation.", 'bullets' => [], 'price' => '20€/pers.', 'days' => 'Jeudi / 17h → 22h', 'featured' => false, 'savings' => null, 'position' => 1],
            ['key' => 'afterwork', 'oldKey' => null, 'tag' => 'Jeudi & vendredi · soir', 'title' => 'Pack Afterwork', 'description' => null, 'bullets' => ['2 pizzas au choix', 'Girafe 2,5L de bière pression', '1h de billard OU fléchettes'], 'price' => '68€/groupe', 'days' => 'Jeudi → Vendredi soir', 'featured' => true, 'savings' => '−22 % vs. à la carte (87€)', 'position' => 2],
        ];

        foreach ($cards as $data) {
            $card = $repo->findOneBy(['key' => $data['key']]);

            if (!$card && $data['oldKey']) {
                $card = $repo->findOneBy(['key' => $data['oldKey']]);
            }

            if (!$card) {
                $card = new HebdoCard();
                $io->note(sprintf('Création : %s', $data['key']));
            } else {
                $io->note(sprintf('Mise à jour : %s (ancienne clé : %s)', $data['key'], $card->getKey()));
            }

            $card->setKey($data['key']);
            $card->setTag($data['tag']);
            $card->setTitle($data['title']);
            $card->setDescription($data['description']);
            $card->setBullets($data['bullets']);
            $card->setPrice($data['price']);
            $card->setDays($data['days']);
            $card->setFeatured($data['featured']);
            $card->setSavings($data['savings']);
            $card->setPosition($data['position']);

            $this->em->persist($card);
        }

        $this->em->flush();

        $io->success('3 HebdoCards V2 synchronisées. La commande est idempotente — relancez-la sans risque.');

        return Command::SUCCESS;
    }
}
