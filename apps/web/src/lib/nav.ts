/**
 * Configuration de la navigation principale.
 * Source : maquette `partials.js` du bundle Claude Design.
 */

export type NavLeaf = {
  key: string;
  label: string;
  href: string;
};

export type NavGroup = {
  key: string;
  label: string;
  children: NavLeaf[];
};

export type NavItem = NavLeaf | NavGroup;

export const NAV: NavItem[] = [
  {
    key: 'activites',
    label: 'Activités',
    children: [
      { key: 'bowling', label: '🎳 Bowling', href: '/bowling' },
      { key: 'billard', label: '🎱 Billard', href: '/billard' },
      { key: 'arcade-vr', label: '🕹️ Arcade & VR', href: '/arcade-vr' },
      { key: 'karaoke', label: '🎤 Karaoké', href: '/karaoke' },
      { key: 'blindtest', label: '🎵 Blind Test', href: '/blind-test' },
      { key: 'flechettes', label: '🎯 Fléchettes', href: '/flechettes' },
    ],
  },
  { key: 'tarifs-formules', label: 'Tarifs & Formules', href: '/tarifs-et-formules' },
  { key: 'bar', label: 'Bar & Snack', href: '/bar-snack' },
  { key: 'entreprises', label: 'Entreprises', href: '/entreprises' },
  { key: 'contact', label: 'Contact', href: '/contact' },
];

export const ACTIVITY_KEYS = [
  'bowling',
  'billard',
  'arcade',
  'vr',
  'karaoke',
  'blindtest',
  'flechettes',
] as const;

export const RESERVATION_URL =
  process.env.NEXT_PUBLIC_RESERVATION_URL ??
  'https://www.bowling-de-blois.fr/';
