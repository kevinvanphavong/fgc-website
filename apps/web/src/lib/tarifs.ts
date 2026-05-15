export type PriceLine = {
  label: string;
  price: string;
};

export type TarifCard = {
  icon: string;
  name: string;
  unit: string;
  prices: PriceLine[];
  note?: string;
};

export const TARIFS_ACTIVITES: TarifCard[] = [
  {
    icon: '🎳',
    name: 'Bowling',
    unit: 'à la partie · 20 pistes',
    prices: [
      { label: 'Enfant (-10 ans)', price: '5,00€' },
      { label: 'Adulte', price: '7,90€' },
      { label: 'Location chaussures', price: '1,90€' },
    ],
    note: '⏱️ Bowling à volonté lun & mar dès 20h30 : 20€/pers.',
  },
  {
    icon: '🎱',
    name: 'Billard',
    unit: 'par table · 20 tables',
    prices: [
      { label: '30 minutes', price: '7,50€' },
      { label: '1 heure', price: '15,00€' },
    ],
    note: 'Queues & billes fournies. Tables en libre-service avec casier automatique CB.',
  },
  {
    icon: '🎯',
    name: 'Fléchettes',
    unit: 'par borne · 4 bornes',
    prices: [{ label: '1 heure', price: '18,00€' }],
    note: "Bornes électroniques, jusqu'à 8 joueurs. Scoring auto multi-modes.",
  },
  {
    icon: '🕹️',
    name: 'Arcade',
    unit: 'au jeton · 150 m²',
    prices: [{ label: 'Jeton', price: 'à partir de 2€' }],
    note: 'Flippers, simulateurs, air hockey, basket, bornes à lots.',
  },
  {
    icon: '🥽',
    name: 'Réalité Virtuelle',
    unit: 'par session · par personne',
    prices: [{ label: 'Session', price: 'à partir de 4€' }],
    note: 'Salle VR dédiée de 50 m², catalogue de jeux mis à jour régulièrement.',
  },
  {
    icon: '🎤',
    name: 'Karaoké Box',
    unit: "par box · à l'heure",
    prices: [
      { label: 'Box 1 (≤ 9 pers.)', price: '36 — 59€' },
      { label: 'Box 2 (≤ 6 pers.)', price: '29 — 49€' },
    ],
    note: 'Tarif selon le créneau (jour & heure). Réservation conseillée le week-end.',
  },
  {
    icon: '🎧',
    name: 'Blindtest',
    unit: "par box · jusqu'à 8 joueurs",
    prices: [{ label: 'Session', price: '46 — 69€' }],
    note: 'Tarif selon le créneau. Plus de 5 000 titres disponibles.',
  },
];

export const TARIFS_BAR: TarifCard[] = [
  {
    icon: '🍹',
    name: 'Bar',
    unit: "à l'unité",
    prices: [
      { label: 'Soda / soft', price: '4,90€' },
      { label: 'Bière pression / bouteille', price: 'dès 4,50€' },
      { label: 'Girafe 2,5L pression', price: '39,00€' },
      { label: 'Cocktail', price: '7,50 — 12,90€' },
      { label: 'Café', price: '2,30€' },
      { label: 'Thé', price: '3,90€' },
      { label: 'Eau bouteille', price: '2,90€' },
    ],
  },
  {
    icon: '🍿',
    name: 'Snacking',
    unit: "à l'unité",
    prices: [
      { label: 'Pizza', price: '14,90€' },
      { label: 'Frites', price: '6,90€' },
      { label: 'Saucisson', price: '5,90€' },
      { label: 'Pop-corn', price: '3,50€' },
      { label: 'Bonbons', price: '3,50€' },
    ],
  },
  {
    icon: '🍕',
    name: 'Pack Afterwork',
    unit: 'lun → jeu soir',
    prices: [
      { label: '2 pizzas', price: 'incluses' },
      { label: 'Girafe 2,5L pression', price: 'incluse' },
      { label: '1h billard ou fléchettes', price: 'incluse' },
      { label: 'Pack groupe', price: '68€' },
    ],
    note: 'Économie −22 % vs. à la carte (87€).',
  },
];
