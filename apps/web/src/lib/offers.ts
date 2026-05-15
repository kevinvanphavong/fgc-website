export type Offer = {
  key: string;
  image: string;
  title: string;
  badge: string;
  badgeVariant: 'yellow' | 'pink' | 'cream';
  href: string;
};

export const OFFERS: Offer[] = [
  {
    key: 'bowling-volonte',
    image: '/assets/affiche-bowling-volonte.png',
    title: 'Bowling à volonté',
    badge: '20€',
    badgeVariant: 'yellow',
    href: '/tarifs',
  },
  {
    key: 'afterwork',
    image: '/assets/affiche-afterwork.png',
    title: 'Pack Afterwork',
    badge: '−24%',
    badgeVariant: 'pink',
    href: '/tarifs',
  },
  {
    key: 'anniversaires',
    image: '/assets/affiche-anniversaires.png',
    title: 'Anniv. enfants',
    badge: 'Dès 6 ans',
    badgeVariant: 'cream',
    href: '/formules',
  },
  {
    key: 'carte-membre',
    image: '/assets/affiche-carte-membre.png',
    title: 'Carte membre',
    badge: 'Dès 35€',
    badgeVariant: 'yellow',
    href: '/tarifs',
  },
];
