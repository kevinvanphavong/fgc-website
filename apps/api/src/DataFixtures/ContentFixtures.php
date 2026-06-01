<?php

namespace App\DataFixtures;

use App\Entity\ActivityPageContent;
use App\Entity\AnnivCard;
use App\Entity\DaySchedule;
use App\Entity\HebdoCard;
use App\Entity\MenuCategory;
use App\Entity\MenuItem;
use App\Entity\MenuSection;
use App\Entity\Offer;
use App\Entity\PassCard;
use App\Entity\ResaCard;
use App\Entity\TarifCard;
use App\Entity\TarifPriceLine;
use App\Entity\VipFeature;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ContentFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $this->loadTarifs($manager);
        $this->loadSchedule($manager);
        $this->loadHebdo($manager);
        $this->loadPass($manager);
        $this->loadResa($manager);
        $this->loadAnniv($manager);
        $this->loadVipFeatures($manager);
        $this->loadMenu($manager);
        $this->loadOffers($manager);
        $this->loadActivities($manager);

        $manager->flush();
    }

    private function loadTarifs(ObjectManager $m): void
    {
        $activites = [
            ['icon' => '🎳', 'name' => 'Bowling', 'unit' => 'à la partie · 20 pistes', 'note' => '⏱️ Bowling à volonté lun & mar dès 20h30 : 20€/pers.', 'prices' => [
                ['label' => 'Enfant (-10 ans)', 'price' => '5,00€'],
                ['label' => 'Adulte', 'price' => '7,90€'],
                ['label' => 'Location chaussures', 'price' => '1,90€'],
            ]],
            ['icon' => '🎱', 'name' => 'Billard', 'unit' => 'par table · 20 tables', 'note' => 'Queues & billes fournies. Tables en libre-service avec casier automatique CB.', 'prices' => [
                ['label' => '30 minutes', 'price' => '7,50€'],
                ['label' => '1 heure', 'price' => '15,00€'],
            ]],
            ['icon' => '🎯', 'name' => 'Fléchettes', 'unit' => 'par borne · 4 bornes', 'note' => "Bornes électroniques, jusqu'à 8 joueurs. Scoring auto multi-modes.", 'prices' => [
                ['label' => '1 heure', 'price' => '18,00€'],
            ]],
            ['icon' => '🕹️', 'name' => 'Arcade', 'unit' => 'au jeton · 150 m²', 'note' => 'Flippers, simulateurs, air hockey, basket, bornes à lots.', 'prices' => [
                ['label' => 'Jeton', 'price' => 'à partir de 2€'],
            ]],
            ['icon' => '🥽', 'name' => 'Réalité Virtuelle', 'unit' => 'par session · par personne', 'note' => 'Salle VR dédiée de 50 m², catalogue de jeux mis à jour régulièrement.', 'prices' => [
                ['label' => 'Session', 'price' => 'à partir de 4€'],
            ]],
            ['icon' => '🎤', 'name' => 'Karaoké Box', 'unit' => "par box · à l'heure", 'note' => 'Tarif selon le créneau (jour & heure). Réservation conseillée le week-end.', 'prices' => [
                ['label' => 'Box 1 (≤ 9 pers.)', 'price' => '36 — 59€'],
                ['label' => 'Box 2 (≤ 6 pers.)', 'price' => '29 — 49€'],
            ]],
            ['icon' => '🎧', 'name' => 'Blindtest', 'unit' => "par box · jusqu'à 8 joueurs", 'note' => 'Tarif selon le créneau. Plus de 5 000 titres disponibles.', 'prices' => [
                ['label' => 'Session', 'price' => '46 — 69€'],
            ]],
        ];

        foreach ($activites as $pos => $data) {
            $card = new TarifCard();
            $card->setCardGroup('activites');
            $card->setIcon($data['icon']);
            $card->setName($data['name']);
            $card->setUnit($data['unit']);
            $card->setNote($data['note'] ?? null);
            $card->setPosition($pos);

            foreach ($data['prices'] as $pPos => $pData) {
                $line = new TarifPriceLine();
                $line->setLabel($pData['label']);
                $line->setPrice($pData['price']);
                $line->setPosition($pPos);
                $card->addPrice($line);
            }

            $m->persist($card);
        }

        $bar = [
            ['icon' => '🍹', 'name' => 'Bar', 'unit' => "à l'unité", 'note' => null, 'prices' => [
                ['label' => 'Soda / soft', 'price' => '4,90€'],
                ['label' => 'Bière pression / bouteille', 'price' => 'dès 4,50€'],
                ['label' => 'Girafe 2,5L pression', 'price' => '39,00€'],
                ['label' => 'Cocktail', 'price' => '7,50 — 12,90€'],
                ['label' => 'Café', 'price' => '2,30€'],
                ['label' => 'Thé', 'price' => '3,90€'],
                ['label' => 'Eau bouteille', 'price' => '2,90€'],
            ]],
            ['icon' => '🍿', 'name' => 'Snacking', 'unit' => "à l'unité", 'note' => null, 'prices' => [
                ['label' => 'Pizza', 'price' => '14,90€'],
                ['label' => 'Frites', 'price' => '6,90€'],
                ['label' => 'Saucisson', 'price' => '5,90€'],
                ['label' => 'Pop-corn', 'price' => '3,50€'],
                ['label' => 'Bonbons', 'price' => '3,50€'],
            ]],
            ['icon' => '🍕', 'name' => 'Pack Afterwork', 'unit' => 'jeu & ven soir', 'note' => 'Économie −22 % vs. à la carte (87€).', 'prices' => [
                ['label' => '2 pizzas', 'price' => 'incluses'],
                ['label' => 'Girafe 2,5L pression', 'price' => 'incluse'],
                ['label' => '1h billard ou fléchettes', 'price' => 'incluse'],
                ['label' => 'Pack groupe', 'price' => '68€'],
            ]],
        ];

        foreach ($bar as $pos => $data) {
            $card = new TarifCard();
            $card->setCardGroup('bar');
            $card->setIcon($data['icon']);
            $card->setName($data['name']);
            $card->setUnit($data['unit']);
            $card->setNote($data['note']);
            $card->setPosition($pos);

            foreach ($data['prices'] as $pPos => $pData) {
                $line = new TarifPriceLine();
                $line->setLabel($pData['label']);
                $line->setPrice($pData['price']);
                $line->setPosition($pPos);
                $card->addPrice($line);
            }

            $m->persist($card);
        }
    }

    private function loadSchedule(ObjectManager $m): void
    {
        $days = [
            ['key' => 'lundi', 'label' => 'Lundi', 'hours' => '17h — 23h', 'jsDay' => 1],
            ['key' => 'mardi', 'label' => 'Mardi', 'hours' => '17h — 23h', 'jsDay' => 2],
            ['key' => 'mercredi', 'label' => 'Mercredi', 'hours' => '14h — 23h', 'jsDay' => 3],
            ['key' => 'jeudi', 'label' => 'Jeudi', 'hours' => '14h — 00h', 'jsDay' => 4],
            ['key' => 'vendredi', 'label' => 'Vendredi', 'hours' => '14h — 01h', 'jsDay' => 5],
            ['key' => 'samedi', 'label' => 'Samedi', 'hours' => '14h — 02h', 'jsDay' => 6],
            ['key' => 'dimanche', 'label' => 'Dimanche', 'hours' => '14h — 22h', 'jsDay' => 0],
        ];

        foreach ($days as $pos => $d) {
            $day = new DaySchedule();
            $day->setKey($d['key']);
            $day->setLabel($d['label']);
            $day->setHours($d['hours']);
            $day->setJsDay($d['jsDay']);
            $day->setPosition($pos);
            $m->persist($day);
        }
    }

    private function loadHebdo(ObjectManager $m): void
    {
        $cards = [
            ['key' => 'bowling-a-volonte', 'tag' => 'Lundi & mardi soir', 'title' => 'Bowling à volonté', 'description' => "Parties illimitées + chaussures + 1 soda offert, de 20h30 jusqu'à la fermeture. Sans réservation, dans la limite des 100 premiers.", 'bullets' => [], 'price' => '20€/pers.', 'days' => 'Lundi · Mardi / 20h30 → fermeture', 'featured' => false, 'savings' => null],
            ['key' => 'jeudi-a-gogo', 'tag' => 'Jeudi · 17h → 22h', 'title' => 'Jeudi à gogo', 'description' => "L'institution du jeudi : bowling illimité + chaussures + 1 soda offert, de 17h à 22h. 100 premiers servis, sans réservation.", 'bullets' => [], 'price' => '20€/pers.', 'days' => 'Jeudi / 17h → 22h', 'featured' => false, 'savings' => null],
            ['key' => 'afterwork', 'tag' => 'Jeudi & vendredi · soir', 'title' => 'Pack Afterwork', 'description' => null, 'bullets' => ['2 pizzas au choix', 'Girafe 2,5L de bière pression', '1h de billard OU fléchettes'], 'price' => '68€/groupe', 'days' => 'Jeudi → Vendredi soir', 'featured' => true, 'savings' => '−22 % vs. à la carte (87€)'],
        ];

        foreach ($cards as $pos => $d) {
            $card = new HebdoCard();
            $card->setKey($d['key']);
            $card->setTag($d['tag']);
            $card->setTitle($d['title']);
            $card->setDescription($d['description']);
            $card->setBullets($d['bullets']);
            $card->setPrice($d['price']);
            $card->setDays($d['days']);
            $card->setFeatured($d['featured']);
            $card->setSavings($d['savings']);
            $card->setPosition($pos);
            $m->persist($card);
        }
    }

    private function loadPass(ObjectManager $m): void
    {
        $cards = [
            ['key' => 'chill', 'name' => 'Pass Chill', 'price' => '27,90€/pers.', 'features' => ['Bowling à volonté + chaussures', '1 session de réalité virtuelle', '2 jetons arcade', '1 soda offert'], 'separatePrice' => '32,90€', 'savings' => '−15 %', 'featured' => false],
            ['key' => 'confort', 'name' => 'Pass Confort', 'price' => '33,90€/pers.', 'features' => ['Bowling à volonté + chaussures', '2 sessions de réalité virtuelle', '4 jetons arcade', '1 soda offert'], 'separatePrice' => '40,90€', 'savings' => '−17 %', 'featured' => true],
            ['key' => 'vip', 'name' => 'Pass VIP', 'price' => '37,90€/pers.', 'features' => ['Bowling à volonté + chaussures', '3 sessions de réalité virtuelle', '6 jetons arcade', '1 soda offert'], 'separatePrice' => '48,90€', 'savings' => '−22 %', 'featured' => false],
            ['key' => 'multiverse', 'name' => 'Pass Multiverse', 'price' => '47,90€/pers.', 'features' => ['Bowling à volonté + chaussures', '3 sessions de réalité virtuelle', '6 jetons arcade', '1 activité au choix : 1h billard/fléchettes ou 30min karaoké/blindtest', '1 soda offert'], 'separatePrice' => '63,90€', 'savings' => '−25 %', 'featured' => false],
        ];

        foreach ($cards as $pos => $d) {
            $card = new PassCard();
            $card->setKey($d['key']);
            $card->setName($d['name']);
            $card->setPrice($d['price']);
            $card->setFeatures($d['features']);
            $card->setSeparatePrice($d['separatePrice']);
            $card->setSavings($d['savings']);
            $card->setFeatured($d['featured']);
            $card->setPosition($pos);
            $m->persist($card);
        }
    }

    private function loadResa(ObjectManager $m): void
    {
        $cards = [
            ['key' => 'silver', 'rank' => 'SILVER', 'audience' => 'Groupe ≥ 8 pers.', 'price' => '18,90€/pers.', 'pitch' => 'Le pack groupe essentiel', 'features' => ['1 partie de bowling + chaussures', '1 cocktail ou soda au choix', 'À partir de 8 personnes · réserver 4h avant'], 'keyPoint' => "Votre piste est réservée et préparée avant votre arrivée — vous n'avez plus qu'à vous installer et jouer.", 'featured' => false],
            ['key' => 'gold', 'rank' => 'GOLD', 'audience' => 'Groupe ≥ 8 pers.', 'price' => '23,50€/pers.', 'pitch' => "2 parties de bowling au lieu d'une", 'features' => ['2 parties de bowling + chaussures', '1 cocktail ou soda au choix', 'À partir de 8 personnes · réserver 4h avant'], 'keyPoint' => "Vous payez seulement +4,60€ pour une partie en plus. Pour les soirées où on ne veut pas s'arrêter à une seule manche.", 'featured' => true],
            ['key' => 'platinium', 'rank' => 'PLATINIUM', 'audience' => 'À 2 ou en solo', 'price' => '20,00€/pers.', 'pitch' => 'Réserver même à la dernière minute', 'features' => ['1 partie de bowling + chaussures', '1 cocktail ou soda au choix', 'Sans minimum · réserver 2h avant'], 'keyPoint' => "Vous voulez être sûr d'avoir une piste un samedi soir chargé ? Réservez 2h à l'avance — votre place est garantie, sans attendre.", 'featured' => false],
        ];

        foreach ($cards as $pos => $d) {
            $card = new ResaCard();
            $card->setKey($d['key']);
            $card->setRank($d['rank']);
            $card->setAudience($d['audience']);
            $card->setPrice($d['price']);
            $card->setPitch($d['pitch']);
            $card->setFeatures($d['features']);
            $card->setKeyPoint($d['keyPoint']);
            $card->setFeatured($d['featured']);
            $card->setPosition($pos);
            $m->persist($card);
        }
    }

    private function loadAnniv(ObjectManager $m): void
    {
        // Source : maquette `data.jsx` (FORMULES). Le `price` string sert à
        // l'affichage public, `unitPriceCents` au calcul tunnel (total fête).
        $cards = [
            [
                'key' => 'newbowler', 'icon' => '🎳', 'name' => 'New Bowler',
                'age' => '6 à 8 ans', 'price' => '18,50€/enfant', 'unitPriceCents' => 1850,
                'minKids' => 6, 'duration' => '2h',
                'tagline' => 'La première fête de bowling — taillée pour les plus jeunes',
                'features' => [
                    '1 partie de bowling + chaussures',
                    '1 jeton arcade par enfant',
                    "Goûter d'anniversaire complet",
                    'Service VIP anniversaire inclus',
                ],
                'featured' => false,
            ],
            [
                'key' => 'superbowler', 'icon' => '🏆', 'name' => 'Super Bowler',
                'age' => '8 à 10 ans', 'price' => '22,50€/enfant', 'unitPriceCents' => 2250,
                'minKids' => 6, 'duration' => '2h30',
                'tagline' => 'La formule la plus demandée — plus de jeu, plus de fun',
                'features' => [
                    '2 parties de bowling + chaussures',
                    '2 jetons arcade par enfant',
                    "Goûter d'anniversaire complet",
                    'Service VIP anniversaire inclus',
                ],
                'featured' => true,
            ],
            [
                'key' => 'probowler', 'icon' => '💎', 'name' => 'Pro Bowler',
                'age' => '10 à 12 ans', 'price' => '26,50€/enfant', 'unitPriceCents' => 2650,
                'minKids' => 6, 'duration' => '3h',
                'tagline' => "L'expérience ultime — bowling, arcade et VR",
                'features' => [
                    '2 parties de bowling + chaussures',
                    '2 jetons arcade par enfant',
                    '1 session de réalité virtuelle',
                    "Goûter d'anniversaire complet",
                    'Service VIP anniversaire inclus',
                ],
                'featured' => false,
            ],
        ];

        foreach ($cards as $pos => $d) {
            $card = new AnnivCard();
            $card->setKey($d['key']);
            $card->setIcon($d['icon']);
            $card->setName($d['name']);
            $card->setAge($d['age']);
            $card->setPrice($d['price']);
            $card->setUnitPriceCents($d['unitPriceCents']);
            $card->setMinKids($d['minKids']);
            $card->setDuration($d['duration']);
            $card->setTagline($d['tagline']);
            $card->setFeatures($d['features']);
            $card->setFeatured($d['featured']);
            $card->setPosition($pos);
            $m->persist($card);
        }
    }

    private function loadVipFeatures(ObjectManager $m): void
    {
        $features = [
            ['icon' => '🚪', 'label' => "Coupe-file à l'accueil"],
            ['icon' => '🎂', 'label' => 'Table décorée dédiée'],
            ['icon' => '🎳', 'label' => "Piste préparée à l'arrivée"],
            ['icon' => '🧑‍🎨', 'label' => 'Référent dédié au groupe'],
            ['icon' => '🏅', 'label' => 'Remise des médailles'],
            ['icon' => '📸', 'label' => 'Photo polaroïd souvenir'],
        ];

        foreach ($features as $pos => $d) {
            $f = new VipFeature();
            $f->setIcon($d['icon']);
            $f->setLabel($d['label']);
            $f->setPosition($pos);
            $m->persist($f);
        }
    }

    private function loadMenu(ObjectManager $m): void
    {
        $sections = [
            [
                'key' => 'cocktails',
                'eyebrow' => '🍹 Bar à cocktails',
                'title' => 'Cocktails — ',
                'titleAccent' => 'avec ou sans alcool.',
                'lead' => 'Sucrés, fruités, acidulés. Préparés à la minute, version classique ou mocktail sans alcool. Tous nos cocktails démarrent à 7,50 €.',
                'columns' => [
                    ['key' => 'avec-alcool', 'title' => 'Avec alcool', 'items' => [
                        ['name' => 'Mojito', 'description' => 'Rhum, citron vert, menthe, sucre de canne', 'price' => '8,50€'],
                        ['name' => 'Piña Colada', 'description' => 'Rhum, ananas, lait de coco', 'price' => '9€'],
                        ['name' => 'Tequila Sunrise', 'description' => 'Tequila, orange, grenadine', 'price' => '9€'],
                        ['name' => 'Daiquiri Fraise', 'description' => 'Rhum, fraises fraîches, citron', 'price' => '9,50€'],
                        ['name' => 'Cuba Libre', 'description' => 'Rhum, cola, citron vert', 'price' => '8€'],
                        ['name' => 'Cocktail du chef', 'description' => 'Création de la semaine', 'price' => '10€'],
                    ]],
                    ['key' => 'mocktails', 'title' => 'Mocktails — sans alcool', 'items' => [
                        ['name' => 'Virgin Mojito', 'description' => 'Citron vert, menthe, sucre, eau gazeuse', 'price' => '7,50€'],
                        ['name' => 'Sunset Tropical', 'description' => 'Mangue, fruit de la passion, citron', 'price' => '7,50€'],
                        ['name' => 'Frozen Berry', 'description' => 'Framboise, fraise, menthe, glace pilée', 'price' => '8€'],
                        ['name' => 'Pink Lemonade', 'description' => 'Citronnade rose, grenadine, basilic', 'price' => '7,50€'],
                        ['name' => 'Blue Lagoon Mocktail', 'description' => 'Citron, sirop bleu, soda', 'price' => '7,50€'],
                        ['name' => 'Cocktail surprise', 'description' => 'Demandez au barman !', 'price' => '8€'],
                    ]],
                ],
            ],
            [
                'key' => 'smoothies',
                'eyebrow' => '🥤 Nouveauté Printemps / Été 2026',
                'title' => 'Smoothies ',
                'titleAccent' => '& Milkshakes.',
                'lead' => 'Frais, gourmands, vitaminés. À déguster sur place ou à emporter en gobelet refermable. Dès 4,90 €.',
                'columns' => [
                    ['key' => 'smoothies', 'title' => 'Smoothies', 'items' => [
                        ['name' => 'Mango Sunrise', 'description' => 'Mangue, ananas, orange', 'price' => '4,90€'],
                        ['name' => 'Berry Boost', 'description' => 'Fraise, framboise, banane', 'price' => '4,90€'],
                        ['name' => 'Green Energy', 'description' => 'Pomme, kiwi, épinard, gingembre', 'price' => '5,50€'],
                        ['name' => 'Pitaya Pink', 'description' => 'Fruit du dragon, banane, coco', 'price' => '5,90€'],
                    ]],
                    ['key' => 'milkshakes', 'title' => 'Milkshakes', 'items' => [
                        ['name' => 'Vanille', 'description' => 'Bourbon, chantilly maison', 'price' => '4,90€'],
                        ['name' => 'Chocolat', 'description' => 'Cacao Valrhona, éclats de brownie', 'price' => '5,50€'],
                        ['name' => 'Cookies & Cream', 'description' => 'Oreo, vanille, chantilly', 'price' => '5,90€'],
                        ['name' => 'Caramel beurre salé', 'description' => 'Glace vanille, caramel breton', 'price' => '5,90€'],
                    ]],
                ],
            ],
            [
                'key' => 'snacks',
                'eyebrow' => '🍕 Snacks',
                'title' => 'Salés ',
                'titleAccent' => '& sucrés.',
                'lead' => '',
                'columns' => [
                    ['key' => 'sales', 'title' => 'Snacks salés', 'items' => [
                        ['name' => 'Pizza Margherita', 'description' => 'Tomate, mozzarella, basilic', 'price' => '11€'],
                        ['name' => 'Pizza Pepperoni', 'description' => 'Tomate, mozza, pepperoni', 'price' => '13€'],
                        ['name' => 'Pizza 4 Fromages', 'description' => 'Mozza, chèvre, bleu, parmesan', 'price' => '14€'],
                        ['name' => 'Croque-Monsieur', 'description' => 'Jambon, emmental, pain brioché', 'price' => '8€'],
                        ['name' => 'Hot-Dog Classic', 'description' => 'Saucisse, oignons, moutarde', 'price' => '7,50€'],
                        ['name' => 'Frites maison', 'description' => 'Pommes de terre fraîches', 'price' => '4,50€'],
                        ['name' => 'Nachos', 'description' => 'Cheddar, jalapeños, guacamole', 'price' => '8,50€'],
                    ]],
                    ['key' => 'sucres', 'title' => 'Snacks sucrés', 'items' => [
                        ['name' => 'Gaufre Nutella', 'description' => 'Nutella, chantilly', 'price' => '5,50€'],
                        ['name' => 'Gaufre Maxi', 'description' => 'Banane, choco, chantilly', 'price' => '7€'],
                        ['name' => 'Crêpe sucre / citron', 'description' => 'Le classique', 'price' => '4€'],
                        ['name' => 'Crêpe Nutella banane', 'description' => "L'incontournable", 'price' => '6€'],
                        ['name' => 'Brioche perdue', 'description' => 'Caramel beurre salé, glace', 'price' => '6,50€'],
                        ['name' => 'Coupe glacée', 'description' => '3 boules, chantilly, coulis', 'price' => '7€'],
                    ]],
                ],
            ],
        ];

        foreach ($sections as $sPos => $sData) {
            $section = new MenuSection();
            $section->setKey($sData['key']);
            $section->setEyebrow($sData['eyebrow']);
            $section->setTitle($sData['title']);
            $section->setTitleAccent($sData['titleAccent']);
            $section->setLead($sData['lead']);
            $section->setPosition($sPos);

            foreach ($sData['columns'] as $cPos => $cData) {
                $cat = new MenuCategory();
                $cat->setKey($cData['key']);
                $cat->setTitle($cData['title']);
                $cat->setPosition($cPos);

                foreach ($cData['items'] as $iPos => $iData) {
                    $item = new MenuItem();
                    $item->setName($iData['name']);
                    $item->setDescription($iData['description']);
                    $item->setPrice($iData['price']);
                    $item->setPosition($iPos);
                    $cat->addItem($item);
                }

                $section->addColumn($cat);
            }

            $m->persist($section);
        }
    }

    private function loadOffers(ObjectManager $m): void
    {
        $offers = [
            ['key' => 'bowling-volonte', 'image' => '/assets/affiche-bowling-volonte.png', 'title' => 'Bowling à volonté', 'badge' => '20€', 'badgeVariant' => 'yellow', 'href' => '/tarifs'],
            ['key' => 'afterwork', 'image' => '/assets/affiche-afterwork.png', 'title' => 'Pack Afterwork', 'badge' => '−24%', 'badgeVariant' => 'pink', 'href' => '/tarifs'],
            ['key' => 'anniversaires', 'image' => '/assets/affiche-anniversaires.png', 'title' => 'Anniv. enfants', 'badge' => 'Dès 6 ans', 'badgeVariant' => 'cream', 'href' => '/formules'],
            ['key' => 'carte-membre', 'image' => '/assets/affiche-carte-membre.png', 'title' => 'Carte membre', 'badge' => 'Dès 35€', 'badgeVariant' => 'yellow', 'href' => '/tarifs'],
        ];

        foreach ($offers as $pos => $d) {
            $offer = new Offer();
            $offer->setKey($d['key']);
            $offer->setImage($d['image']);
            $offer->setTitle($d['title']);
            $offer->setBadge($d['badge']);
            $offer->setBadgeVariant($d['badgeVariant']);
            $offer->setHref($d['href']);
            $offer->setPosition($pos);
            $m->persist($offer);
        }
    }

    private function loadActivities(ObjectManager $m): void
    {
        $activities = [
            [
                'slug' => 'bowling',
                'image' => '/assets/affiche-bowling-volonte.png',
                'imageAlt' => 'Bowling à volonté',
                'inlinePriceAmount' => null,
                'inlinePriceDescription' => null,
                'features' => [
                    ['icon' => '🎯', 'title' => '20 pistes modernes', 'sub' => 'Système électronique nouvelle génération'],
                    ['icon' => '👶', 'title' => 'Adapté aux enfants', 'sub' => 'Boules légères + relevage de gouttière'],
                    ['icon' => '🌈', 'title' => 'Ambiance néon', 'sub' => 'Lumière noire le week-end'],
                    ['icon' => '📱', 'title' => 'Écrans interactifs', 'sub' => 'Animations & noms personnalisés'],
                ],
                'priceCards' => [
                    ['tier' => 'Carte 5 parties', 'price' => '35€', 'unit' => 'soit 7€/partie', 'features' => ['5 parties de bowling', 'Location de chaussures offerte', 'Valable 6 mois', 'Cumulable entre amis'], 'ctaLabel' => 'Acheter'],
                    ['tier' => 'Carte 8 parties', 'price' => '52€', 'unit' => 'soit 6,50€/partie', 'features' => ['8 parties de bowling', 'Location de chaussures offerte', 'Valable 1 an', 'Le meilleur rapport qualité/prix'], 'featured' => true, 'ctaLabel' => 'Acheter'],
                    ['tier' => 'Carte 14 parties', 'price' => '84€', 'unit' => 'soit 6€/partie', 'features' => ['14 parties de bowling', 'Location de chaussures offerte', 'Valable 1 an', 'Idéal pour les habitués'], 'ctaLabel' => 'Acheter'],
                ],
                'pricingEyebrow' => 'Tarifs Bowling',
                'pricingTitle' => 'Choisissez votre formule.',
                'pricingLead' => 'Du tarif à la partie pour une visite ponctuelle, à la carte de membre pour les habitués, en passant par le bowling à volonté.',
            ],
            [
                'slug' => 'billard',
                'image' => '/assets/affiche-trio-jeux.png',
                'imageAlt' => 'Billard',
                'inlinePriceAmount' => '15€ / heure / table',
                'inlinePriceDescription' => 'Casier automatique — paiement à la minute par carte bancaire. Queues, billes et craie fournies.',
                'features' => [
                    ['icon' => '🎱', 'title' => '15 tables américaines', 'sub' => 'Tapis professionnel'],
                    ['icon' => '💳', 'title' => 'Casier automatique CB', 'sub' => 'Paiement à la minute'],
                    ['icon' => '🍻', 'title' => 'Bar à proximité', 'sub' => 'Snack & cocktails accessibles'],
                    ['icon' => '👥', 'title' => 'De 2 à 8 joueurs', 'sub' => 'Idéal entre amis'],
                ],
                'priceCards' => [],
                'pricingEyebrow' => null,
                'pricingTitle' => null,
                'pricingLead' => null,
            ],
            [
                'slug' => 'arcade',
                'image' => '/assets/affiche-anniversaires.png',
                'imageAlt' => "Jeux d'arcade",
                'inlinePriceAmount' => null,
                'inlinePriceDescription' => null,
                'features' => [
                    ['icon' => '🕹️', 'title' => 'Flippers cultes', 'sub' => 'Star Wars, Jurassic Park…'],
                    ['icon' => '🏎️', 'title' => 'Simulateurs de course', 'sub' => 'Volants & pédales'],
                    ['icon' => '🏀', 'title' => 'Air hockey · Basket', 'sub' => 'Défis en duo'],
                    ['icon' => '🥊', 'title' => 'Coup de poing', 'sub' => 'Mesure ta force'],
                    ['icon' => '🎁', 'title' => 'Bornes à lots', 'sub' => 'iPhone, PlayStation, manettes'],
                    ['icon' => '👶', 'title' => 'Pour tous les âges', 'sub' => 'De 5 à 99 ans'],
                ],
                'priceCards' => [],
                'pricingEyebrow' => null,
                'pricingTitle' => null,
                'pricingLead' => null,
            ],
            [
                'slug' => 'realite-virtuelle',
                'image' => '/assets/affiche-flechettes.png',
                'imageAlt' => 'Réalité virtuelle',
                'inlinePriceAmount' => null,
                'inlinePriceDescription' => null,
                'features' => [
                    ['icon' => '🗝️', 'title' => 'Escape Games VR', 'sub' => 'En équipe, en immersion totale'],
                    ['icon' => '🎮', 'title' => "Jeux d'action", 'sub' => 'FPS, aventure, plateforme'],
                    ['icon' => '🎢', 'title' => 'Simulateurs', 'sub' => 'Montagnes russes, vol, plongée'],
                    ['icon' => '👥', 'title' => 'Multijoueur', 'sub' => 'Jouez à plusieurs en même temps'],
                ],
                'priceCards' => [],
                'pricingEyebrow' => null,
                'pricingTitle' => null,
                'pricingLead' => null,
            ],
            [
                'slug' => 'karaoke',
                'image' => '/assets/affiche-karaoke.png',
                'imageAlt' => 'Karaoké Box',
                'inlinePriceAmount' => null,
                'inlinePriceDescription' => null,
                'features' => [
                    ['icon' => '🎤', 'title' => '2 box privatifs', 'sub' => "Jusqu'à 8 personnes par box"],
                    ['icon' => '📚', 'title' => 'Catalogue géant', 'sub' => 'Variété FR, hits internationaux, classiques'],
                    ['icon' => '🪩', 'title' => 'Ambiance disco', 'sub' => 'Boule à facettes & néons'],
                    ['icon' => '🍹', 'title' => 'Service au box', 'sub' => 'Cocktails & snacks à la demande'],
                ],
                'priceCards' => [],
                'pricingEyebrow' => null,
                'pricingTitle' => null,
                'pricingLead' => null,
            ],
            [
                'slug' => 'blind-test',
                'image' => '/assets/affiche-karaoke.png',
                'imageAlt' => 'Blind test',
                'inlinePriceAmount' => null,
                'inlinePriceDescription' => null,
                'features' => [
                    ['icon' => '🎵', 'title' => '+30 thèmes', 'sub' => 'Variété, ciné, dessins animés, années…'],
                    ['icon' => '📺', 'title' => 'Écrans & buzzers', 'sub' => 'Système pro de compétition'],
                    ['icon' => '🏆', 'title' => 'Mode compétition', 'sub' => 'Équipes, classements, lots'],
                    ['icon' => '🎉', 'title' => 'EVG · EVJF · Team building', 'sub' => 'Animation sur réservation'],
                ],
                'priceCards' => [],
                'pricingEyebrow' => null,
                'pricingTitle' => null,
                'pricingLead' => null,
            ],
            [
                'slug' => 'flechettes',
                'image' => '/assets/affiche-flechettes.png',
                'imageAlt' => 'Fléchettes digitales',
                'inlinePriceAmount' => '18€ / heure',
                'inlinePriceDescription' => "Inscription à l'accueil.",
                'features' => [
                    ['icon' => '🎯', 'title' => '4 bornes disponibles', 'sub' => 'Cibles électroniques pro'],
                    ['icon' => '📊', 'title' => 'Scoring automatique', 'sub' => '301, 501, Cricket, et plus'],
                    ['icon' => '👥', 'title' => "Jusqu'à 8 joueurs", 'sub' => 'Tournois improvisés'],
                    ['icon' => '🔰', 'title' => 'Tous niveaux', 'sub' => 'Du débutant au confirmé'],
                ],
                'priceCards' => [],
                'pricingEyebrow' => null,
                'pricingTitle' => null,
                'pricingLead' => null,
            ],
        ];

        foreach ($activities as $d) {
            $a = new ActivityPageContent();
            $a->setSlug($d['slug']);
            $a->setImage($d['image']);
            $a->setImageAlt($d['imageAlt']);
            $a->setInlinePriceAmount($d['inlinePriceAmount']);
            $a->setInlinePriceDescription($d['inlinePriceDescription']);
            $a->setFeatures($d['features']);
            $a->setPriceCards($d['priceCards']);
            $a->setPricingEyebrow($d['pricingEyebrow']);
            $a->setPricingTitle($d['pricingTitle']);
            $a->setPricingLead($d['pricingLead']);
            $m->persist($a);
        }
    }
}
