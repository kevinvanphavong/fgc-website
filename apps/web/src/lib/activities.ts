export type Activity = {
  key: string;
  icon: string;
  name: string;
  description: string;
  href: string;
};

export const ACTIVITIES: Activity[] = [
  {
    key: 'bowling',
    icon: '🎳',
    name: 'Bowling',
    description:
      '20 pistes modernes avec écrans interactifs, ambiance néon et boules pour tous les niveaux — y compris les plus jeunes.',
    href: '/bowling',
  },
  {
    key: 'billard',
    icon: '🎱',
    name: 'Billard',
    description:
      '15 tables en libre-service, payables par carte bancaire au casier automatique. Précision et convivialité.',
    href: '/billard',
  },
  {
    key: 'arcade-vr',
    icon: '🕹️',
    name: 'Arcade & VR',
    description:
      "150 m² d'arcade nouvelle génération et espace réalité virtuelle immersif. Flippers, simulateurs, bornes à lots, escape games VR.",
    href: '/arcade-vr',
  },
  {
    key: 'karaoke',
    icon: '🎤',
    name: 'Karaoké Box',
    description:
      '2 box privatifs jusqu’à 8 personnes. Catalogue géant, micros pro, ambiance disco et bar à portée de main.',
    href: '/karaoke',
  },
  {
    key: 'blindtest',
    icon: '🎵',
    name: 'Blind Test',
    description:
      'Affrontez vos amis sur des dizaines de playlists thématiques : années 80, hits FR, ciné, génériques cultes…',
    href: '/blind-test',
  },
  {
    key: 'flechettes',
    icon: '🎯',
    name: 'Fléchettes digitales',
    description:
      "4 bornes électroniques tactiles avec scoring automatique et modes de jeu multiples. Inscription à l'accueil.",
    href: '/flechettes',
  },
  {
    key: 'bar',
    icon: '🍹',
    name: 'Bar & Snack',
    description:
      'Cocktails maison, smoothies, milkshakes, pizzas, gaufres & crêpes — à commander sur tablette ou QR code.',
    href: '/bar-snack',
  },
  {
    key: 'evenements',
    icon: '🎉',
    name: 'Événements',
    description:
      'Anniversaires, EVG, EVJF, séminaires, team building… Des formules clés en main pour tous vos moments.',
    href: '/formules',
  },
];
