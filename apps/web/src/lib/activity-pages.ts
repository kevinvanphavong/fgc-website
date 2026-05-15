import { RESERVATION_URL } from './nav';

export type Feature = {
  icon: string;
  title: string;
  sub: string;
};

export type CTA = {
  label: string;
  href: string;
  variant: 'primary' | 'ghost' | 'pink';
  external?: boolean;
};

export type PriceCard = {
  tier: string;
  price: string;
  unit: string;
  features: string[];
  featured?: boolean;
  ctaLabel: string;
};

export type ActivityPage = {
  slug: string;
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  features: Feature[];
  ctas: CTA[];
  badgeCta?: string;
  badgeCtaSub?: string;
  priceCards?: PriceCard[];
  pricingEyebrow?: string;
  pricingTitle?: string;
  pricingLead?: string;
  inlinePrice?: { price: string; description: string };
};

export const ACTIVITY_PAGES: Record<string, ActivityPage> = {
  bowling: {
    slug: 'bowling',
    name: 'Bowling',
    eyebrow: 'Activité phare',
    title: 'Bowling à Blois.',
    description:
      "Le plus grand espace bowling du Loir-et-Cher : 20 pistes professionnelles avec écrans interactifs, ambiance lumière noire et néon, boules pour tous niveaux (enfants compris) et système de relevage automatique pour les plus petits.",
    image: '/assets/affiche-bowling-volonte.png',
    imageAlt: 'Bowling à volonté',
    features: [
      { icon: '🎯', title: '20 pistes modernes', sub: 'Système électronique nouvelle génération' },
      { icon: '👶', title: 'Adapté aux enfants', sub: 'Boules légères + relevage de gouttière' },
      { icon: '🌈', title: 'Ambiance néon', sub: 'Lumière noire le week-end' },
      { icon: '📱', title: 'Écrans interactifs', sub: 'Animations & noms personnalisés' },
    ],
    ctas: [
      { label: 'Réserver une piste', href: RESERVATION_URL, variant: 'primary', external: true },
      { label: 'Voir les tarifs', href: '/tarifs', variant: 'ghost' },
    ],
    badgeCta: 'Bowling à volonté · Lundi & Mardi dès 20h30 · 20€',
    badgeCtaSub: 'Parties illimitées, chaussures incluses.',
    pricingEyebrow: 'Tarifs Bowling',
    pricingTitle: 'Choisissez votre formule.',
    pricingLead:
      'Du tarif à la partie pour une visite ponctuelle, à la carte de membre pour les habitués, en passant par le bowling à volonté.',
    priceCards: [
      {
        tier: 'Carte 5 parties',
        price: '35€',
        unit: 'soit 7€/partie',
        features: [
          '5 parties de bowling',
          'Location de chaussures offerte',
          'Valable 6 mois',
          'Cumulable entre amis',
        ],
        ctaLabel: 'Acheter',
      },
      {
        tier: 'Carte 8 parties',
        price: '52€',
        unit: 'soit 6,50€/partie',
        features: [
          '8 parties de bowling',
          'Location de chaussures offerte',
          'Valable 1 an',
          'Le meilleur rapport qualité/prix',
        ],
        featured: true,
        ctaLabel: 'Acheter',
      },
      {
        tier: 'Carte 14 parties',
        price: '84€',
        unit: 'soit 6€/partie',
        features: [
          '14 parties de bowling',
          'Location de chaussures offerte',
          'Valable 1 an',
          'Idéal pour les habitués',
        ],
        ctaLabel: 'Acheter',
      },
    ],
  },

  billard: {
    slug: 'billard',
    name: 'Billard',
    eyebrow: 'Précision & convivialité',
    title: 'Espace Billard.',
    description:
      "15 tables de billard américain en libre-service, dans un espace dédié à l'ambiance feutrée. Du débutant au joueur confirmé, chacun trouve sa table.",
    image: '/assets/affiche-trio-jeux.png',
    imageAlt: 'Billard',
    features: [
      { icon: '🎱', title: '15 tables américaines', sub: 'Tapis professionnel' },
      { icon: '💳', title: 'Casier automatique CB', sub: 'Paiement à la minute' },
      { icon: '🍻', title: 'Bar à proximité', sub: 'Snack & cocktails accessibles' },
      { icon: '👥', title: 'De 2 à 8 joueurs', sub: 'Idéal entre amis' },
    ],
    ctas: [
      { label: 'Réserver une table', href: RESERVATION_URL, variant: 'primary', external: true },
      { label: 'Voir les tarifs', href: '/tarifs', variant: 'ghost' },
    ],
    inlinePrice: {
      price: '15€ / heure / table',
      description: 'Casier automatique — paiement à la minute par carte bancaire. Queues, billes et craie fournies.',
    },
  },

  arcade: {
    slug: 'arcade',
    name: "Jeux d'arcade",
    eyebrow: '150 m² de pur fun',
    title: "Jeux d'arcade.",
    description:
      "Plongez dans 150 m² entièrement dédiés au jeu vidéo et à l'arcade nouvelle génération : des flippers cultes aux simulateurs immersifs en passant par les bornes à lots.",
    image: '/assets/affiche-anniversaires.png',
    imageAlt: "Jeux d'arcade",
    features: [
      { icon: '🕹️', title: 'Flippers cultes', sub: 'Star Wars, Jurassic Park…' },
      { icon: '🏎️', title: 'Simulateurs de course', sub: 'Volants & pédales' },
      { icon: '🏀', title: 'Air hockey · Basket', sub: 'Défis en duo' },
      { icon: '🥊', title: 'Coup de poing', sub: 'Mesure ta force' },
      { icon: '🎁', title: 'Bornes à lots', sub: 'iPhone, PlayStation, manettes' },
      { icon: '👶', title: 'Pour tous les âges', sub: 'De 5 à 99 ans' },
    ],
    ctas: [
      { label: 'Venir jouer', href: RESERVATION_URL, variant: 'primary', external: true },
      { label: 'Formules anniversaires', href: '/formules', variant: 'ghost' },
    ],
  },

  'realite-virtuelle': {
    slug: 'realite-virtuelle',
    name: 'Réalité Virtuelle',
    eyebrow: 'Immersion totale',
    title: 'Réalité virtuelle.',
    description:
      "Casques VR dernière génération et catalogue d'expériences renouvelé : escape games, simulateurs, jeux d'action, aventures coopératives… Fun garanti pour tous les profils, débutants comme gamers confirmés.",
    image: '/assets/affiche-flechettes.png',
    imageAlt: 'Réalité virtuelle',
    features: [
      { icon: '🗝️', title: 'Escape Games VR', sub: 'En équipe, en immersion totale' },
      { icon: '🎮', title: "Jeux d'action", sub: 'FPS, aventure, plateforme' },
      { icon: '🎢', title: 'Simulateurs', sub: 'Montagnes russes, vol, plongée' },
      { icon: '👥', title: 'Multijoueur', sub: 'Jouez à plusieurs en même temps' },
    ],
    ctas: [
      { label: 'Réserver une session', href: RESERVATION_URL, variant: 'primary', external: true },
      { label: 'Voir les tarifs', href: '/tarifs', variant: 'ghost' },
    ],
  },

  karaoke: {
    slug: 'karaoke',
    name: 'Karaoké',
    eyebrow: 'Devenez la star',
    title: 'Karaoké Box.',
    description:
      "2 box privatifs dans un cadre disco avec banquettes confort, écran géant, micros sans fil et catalogue de plusieurs milliers de titres FR/EN/internationaux.",
    image: '/assets/affiche-karaoke.png',
    imageAlt: 'Karaoké Box',
    features: [
      { icon: '🎤', title: '2 box privatifs', sub: "Jusqu'à 8 personnes par box" },
      { icon: '📚', title: 'Catalogue géant', sub: 'Variété FR, hits internationaux, classiques' },
      { icon: '🪩', title: 'Ambiance disco', sub: 'Boule à facettes & néons' },
      { icon: '🍹', title: 'Service au box', sub: 'Cocktails & snacks à la demande' },
    ],
    ctas: [
      { label: 'Réserver un box', href: RESERVATION_URL, variant: 'primary', external: true },
      { label: 'Voir les formules', href: '/formules', variant: 'ghost' },
    ],
  },

  'blind-test': {
    slug: 'blind-test',
    name: 'Blind Test',
    eyebrow: 'Testez vos oreilles',
    title: 'Blind Test.',
    description:
      "Préparez-vous à dégainer ! Buzzers, écrans, animateur dédié pour les soirées privatisées et plus de 30 playlists thématiques : années 80, années 2000, hits FR, cinéma, génériques cultes, dessins animés…",
    image: '/assets/affiche-karaoke.png',
    imageAlt: 'Blind test',
    features: [
      { icon: '🎵', title: '+30 thèmes', sub: 'Variété, ciné, dessins animés, années…' },
      { icon: '📺', title: 'Écrans & buzzers', sub: 'Système pro de compétition' },
      { icon: '🏆', title: 'Mode compétition', sub: 'Équipes, classements, lots' },
      { icon: '🎉', title: 'EVG · EVJF · Team building', sub: 'Animation sur réservation' },
    ],
    ctas: [
      { label: 'Réserver une soirée', href: RESERVATION_URL, variant: 'primary', external: true },
      { label: 'Pour les entreprises', href: '/entreprises', variant: 'ghost' },
    ],
  },

  flechettes: {
    slug: 'flechettes',
    name: 'Fléchettes',
    eyebrow: 'Précision & adrénaline',
    title: 'Fléchettes digitales.',
    description:
      "4 bornes électroniques tactiles avec scoring automatique : finis les calculs de tête, les bornes gèrent tout. Plusieurs modes de jeu (301, 501, Cricket, Around the Clock…) en solo ou en équipe.",
    image: '/assets/affiche-flechettes.png',
    imageAlt: 'Fléchettes digitales',
    features: [
      { icon: '🎯', title: '4 bornes disponibles', sub: 'Cibles électroniques pro' },
      { icon: '📊', title: 'Scoring automatique', sub: '301, 501, Cricket, et plus' },
      { icon: '👥', title: "Jusqu'à 8 joueurs", sub: 'Tournois improvisés' },
      { icon: '🔰', title: 'Tous niveaux', sub: 'Du débutant au confirmé' },
    ],
    ctas: [
      { label: 'Réserver une borne', href: RESERVATION_URL, variant: 'primary', external: true },
      { label: 'Voir les tarifs', href: '/tarifs', variant: 'ghost' },
    ],
    inlinePrice: {
      price: '18€ / heure',
      description: "Inscription à l'accueil.",
    },
  },
};
