import type { ReservationStatus } from './useDemandeReservation';

/**
 * Métadonnées d'affichage des statuts (pills, kanban columns).
 * Tokens DS admin uniquement (zéro hex en JSX).
 */
export interface StatusMeta {
  key: ReservationStatus;
  label: string;
  description: string;
  pillBg: string;
  pillText: string;
  dotBg: string;
}

export const STATUS_META: Record<ReservationStatus, StatusMeta> = {
  nouveau: {
    key: 'nouveau',
    label: 'À traiter',
    description: 'Demande reçue, à rappeler sous 24h.',
    pillBg: 'bg-admin-amber-soft',
    pillText: 'text-admin-amber',
    dotBg: 'bg-admin-amber',
  },
  contacte: {
    key: 'contacte',
    label: 'Contactée',
    description: 'Parent appelé, en attente de validation.',
    pillBg: 'bg-admin-blue-soft',
    pillText: 'text-admin-blue',
    dotBg: 'bg-admin-blue',
  },
  confirme: {
    key: 'confirme',
    label: 'Confirmée',
    description: 'Date validée + acompte reçu.',
    pillBg: 'bg-admin-green-soft',
    pillText: 'text-admin-green',
    dotBg: 'bg-admin-green',
  },
  passe: {
    key: 'passe',
    label: 'Passée',
    description: 'Fête réalisée.',
    pillBg: 'bg-admin-bg-sunken',
    pillText: 'text-admin-slate',
    dotBg: 'bg-admin-slate',
  },
  refuse: {
    key: 'refuse',
    label: 'Refusée',
    description: 'Demande déclinée.',
    pillBg: 'bg-admin-red-soft',
    pillText: 'text-admin-red',
    dotBg: 'bg-admin-red',
  },
};

export const KANBAN_COLUMNS: ReservationStatus[] = [
  'nouveau',
  'contacte',
  'confirme',
  'passe',
  'refuse',
];

export interface FormuleMeta {
  label: string;
  icon: string;
  ageRange: string;
  unitPriceCents: number;
}

export const FORMULE_META: Record<string, FormuleMeta> = {
  newbowler: {
    label: 'New Bowler',
    icon: '🎳',
    ageRange: '6-8 ans',
    unitPriceCents: 1850,
  },
  superbowler: {
    label: 'Super Bowler',
    icon: '🏆',
    ageRange: '8-10 ans',
    unitPriceCents: 2250,
  },
  probowler: {
    label: 'Pro Bowler',
    icon: '💎',
    ageRange: '10-12 ans',
    unitPriceCents: 2650,
  },
};

const SLOT_LABEL: Record<string, string> = {
  '10:00': '10h–12h',
  '14:00': '14h–16h',
  '14:30': '14h30–16h30',
  '16:00': '16h–18h',
  '16:30': '16h30–18h30',
  '17:00': '17h–19h',
};

export function formatSlot(value: string): string {
  return SLOT_LABEL[value] ?? value;
}

export function formatEventDate(iso: string): string {
  const date = new Date(iso.slice(0, 10) + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeAge(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return 'hier';
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem.`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function formatPriceCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €';
}
