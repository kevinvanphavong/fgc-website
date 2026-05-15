export type HebdoCard = {
  key: string;
  tag: string;
  title: string;
  description?: string;
  bullets?: string[];
  price: string;
  days: string;
  featured?: boolean;
  savings?: string;
};

export const HEBDO_CARDS: HebdoCard[] = [
  {
    key: 'bowling-illimite',
    tag: 'Lundi & mardi soir',
    title: 'Bowling illimité',
    description:
      "Enchaînez les parties autant que vous voulez, de 20h30 jusqu'à la fermeture. Chaussures incluses. Pas besoin de réserver.",
    price: '20€/pers.',
    days: 'Lundi · Mardi / 20h30 → fermeture',
  },
  {
    key: 'jeudi-a-gogo',
    tag: 'Jeudi soir',
    title: 'Jeudi à gogo',
    description:
      "Bowling et billard à volonté toute la soirée, avec un soda offert. On accueille les 150 premiers entre 17h et 21h.",
    price: '24,90€/pers.',
    days: 'Jeudi / 150 premiers',
  },
  {
    key: 'afterwork',
    tag: 'Lundi à jeudi · soir',
    title: 'Pack Afterwork',
    bullets: [
      '2 pizzas au choix',
      'Girafe 2,5L de bière pression',
      '1h de billard OU fléchettes',
    ],
    price: '68€/groupe',
    days: 'Lundi → Jeudi soir',
    featured: true,
    savings: '−22 % vs. à la carte (87€)',
  },
];

export type PassCard = {
  key: string;
  name: string;
  price: string;
  features: string[];
  separatePrice: string;
  savings: string;
  featured?: boolean;
};

export const PASS_CARDS: PassCard[] = [
  {
    key: 'chill',
    name: 'Pass Chill',
    price: '17,90€/pers.',
    features: [
      '1 partie de bowling + chaussures',
      '1 session de réalité virtuelle',
      '2 jetons arcade',
      '1 soda offert',
    ],
    separatePrice: '22,70€',
    savings: '−21 %',
  },
  {
    key: 'confort',
    name: 'Pass Confort',
    price: '26,90€/pers.',
    features: [
      '2 parties de bowling + chaussures',
      '2 sessions de réalité virtuelle',
      '4 jetons arcade',
      '1 soda offert',
    ],
    separatePrice: '38,60€',
    savings: '−30 %',
    featured: true,
  },
  {
    key: 'vip',
    name: 'Pass VIP',
    price: '34,90€/pers.',
    features: [
      '2 parties de bowling + chaussures',
      '3 sessions de réalité virtuelle',
      '6 jetons arcade',
      '1 soda offert',
    ],
    separatePrice: '46,60€',
    savings: '−25 %',
  },
  {
    key: 'multiverse',
    name: 'Pass Multiverse',
    price: '43,90€/pers.',
    features: [
      '3 parties de bowling + chaussures',
      '3 sessions de réalité virtuelle',
      '6 jetons arcade',
      '1 activité au choix (billard, fléchettes, karaoké, blindtest)',
      '1 soda offert',
    ],
    separatePrice: '62,50€',
    savings: '−30 %',
  },
];

export type ResaCard = {
  key: string;
  rank: string;
  audience: string;
  price: string;
  pitch: string;
  features: string[];
  keyPoint: string;
  featured?: boolean;
};

export const RESA_CARDS: ResaCard[] = [
  {
    key: 'silver',
    rank: 'SILVER',
    audience: 'Groupe ≥ 8 pers.',
    price: '18,90€/pers.',
    pitch: 'Le pack groupe essentiel',
    features: [
      '1 partie de bowling + chaussures',
      '1 cocktail ou soda au choix',
      'À partir de 8 personnes · réserver 4h avant',
    ],
    keyPoint:
      "Votre piste est réservée et préparée avant votre arrivée — vous n'avez plus qu'à vous installer et jouer.",
  },
  {
    key: 'gold',
    rank: 'GOLD',
    audience: 'Groupe ≥ 8 pers.',
    price: '23,50€/pers.',
    pitch: '2 parties de bowling au lieu d\'une',
    features: [
      '2 parties de bowling + chaussures',
      '1 cocktail ou soda au choix',
      'À partir de 8 personnes · réserver 4h avant',
    ],
    keyPoint:
      "Vous payez seulement +4,60€ pour une partie en plus. Pour les soirées où on ne veut pas s'arrêter à une seule manche.",
    featured: true,
  },
  {
    key: 'platinium',
    rank: 'PLATINIUM',
    audience: 'À 2 ou en solo',
    price: '20,00€/pers.',
    pitch: 'Réserver même à la dernière minute',
    features: [
      '1 partie de bowling + chaussures',
      '1 cocktail ou soda au choix',
      'Sans minimum · réserver 2h avant',
    ],
    keyPoint:
      "Vous voulez être sûr d'avoir une piste un samedi soir chargé ? Réservez 2h à l'avance — votre place est garantie, sans attendre.",
  },
];

export type AnnivCard = {
  key: string;
  icon: string;
  name: string;
  age: string;
  price: string;
  features: string[];
  featured?: boolean;
};

export const ANNIV_CARDS: AnnivCard[] = [
  {
    key: 'newbowler',
    icon: '🎳',
    name: 'New Bowler',
    age: '6 à 8 ans',
    price: '18,50€/enfant',
    features: [
      '1 partie de bowling + chaussures',
      '1 jeton arcade par enfant',
      "Goûter d'anniversaire complet",
      'Service VIP anniversaire inclus',
    ],
  },
  {
    key: 'superbowler',
    icon: '🏆',
    name: 'Super Bowler',
    age: '8 à 10 ans',
    price: '22,50€/enfant',
    features: [
      '2 parties de bowling + chaussures',
      '2 jetons arcade par enfant',
      "Goûter d'anniversaire complet",
      'Service VIP anniversaire inclus',
    ],
    featured: true,
  },
  {
    key: 'probowler',
    icon: '💎',
    name: 'Pro Bowler',
    age: '10 à 12 ans',
    price: '26,50€/enfant',
    features: [
      '2 parties de bowling + chaussures',
      '2 jetons arcade par enfant',
      '1 session de réalité virtuelle',
      "Goûter d'anniversaire complet",
      'Service VIP anniversaire inclus',
    ],
  },
];

export const VIP_FEATURES = [
  { icon: '🚪', label: "Coupe-file à l'accueil" },
  { icon: '🎂', label: 'Table décorée dédiée' },
  { icon: '🎳', label: "Piste préparée à l'arrivée" },
  { icon: '🧑‍🎨', label: 'Référent dédié au groupe' },
  { icon: '🏅', label: 'Remise des médailles' },
  { icon: '📸', label: 'Photo polaroïd souvenir' },
];
