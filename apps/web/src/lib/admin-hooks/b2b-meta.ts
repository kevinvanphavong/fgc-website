import type { B2BStage, B2BType } from './useB2BRequest';

/**
 * Métadonnées d'affichage des stages B2B (pills, kanban, drawer).
 * Tokens DS admin uniquement (zéro hex en JSX).
 */
export interface B2BStageMeta {
  key: B2BStage;
  label: string;
  description: string;
  pillBg: string;
  pillText: string;
  dotBg: string;
}

export const B2B_STAGE_META: Record<B2BStage, B2BStageMeta> = {
  nouveau: {
    key: 'nouveau',
    label: 'Nouveau',
    description: 'Demande reçue, à qualifier (appel découverte).',
    pillBg: 'bg-admin-amber-soft',
    pillText: 'text-admin-amber',
    dotBg: 'bg-admin-amber',
  },
  qualifie: {
    key: 'qualifie',
    label: 'Qualifié',
    description: 'Besoin identifié, devis à préparer.',
    pillBg: 'bg-admin-blue-soft',
    pillText: 'text-admin-blue',
    dotBg: 'bg-admin-blue',
  },
  devis_envoye: {
    key: 'devis_envoye',
    label: 'Devis envoyé',
    description: 'En attente de retour client.',
    pillBg: 'bg-admin-brand-soft',
    pillText: 'text-admin-brand',
    dotBg: 'bg-admin-brand',
  },
  negociation: {
    key: 'negociation',
    label: 'Négociation',
    description: 'Échanges en cours sur le périmètre ou le tarif.',
    pillBg: 'bg-admin-pink-soft',
    pillText: 'text-admin-pink',
    dotBg: 'bg-admin-pink',
  },
  gagne: {
    key: 'gagne',
    label: 'Gagné',
    description: 'Devis signé, événement confirmé.',
    pillBg: 'bg-admin-green-soft',
    pillText: 'text-admin-green',
    dotBg: 'bg-admin-green',
  },
  perdu: {
    key: 'perdu',
    label: 'Perdu',
    description: 'Demande non concrétisée.',
    pillBg: 'bg-admin-bg-sunken',
    pillText: 'text-admin-slate',
    dotBg: 'bg-admin-slate',
  },
};

export const B2B_KANBAN_COLUMNS: B2BStage[] = [
  'nouveau',
  'qualifie',
  'devis_envoye',
  'negociation',
  'gagne',
  'perdu',
];

export interface B2BTypeMeta {
  label: string;
  emoji: string;
}

export const B2B_TYPE_META: Record<B2BType, B2BTypeMeta> = {
  seminaire: { label: 'Séminaire', emoji: '💼' },
  team_building: { label: 'Team building', emoji: '🤝' },
  soiree: { label: "Soirée d'entreprise", emoji: '🥂' },
  arbre_noel: { label: 'Arbre de Noël', emoji: '🎄' },
  autre: { label: 'Autre', emoji: '✨' },
};

const EUR_FORMAT = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export function formatEUR(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return '—';
  return EUR_FORMAT.format(cents / 100);
}

export function formatEventDate(iso: string | null): string {
  if (!iso) return 'Date à définir';
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

export function formatResponseTime(minutes: number | null): string {
  if (minutes === null) return '—';
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1).replace('.0', '')} h`;
  return `${Math.round(hours / 24)} j`;
}
