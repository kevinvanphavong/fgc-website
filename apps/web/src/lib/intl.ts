/**
 * Helpers Intl utilisés côté admin. Tous instanciés une fois au module level
 * pour éviter de recréer le formatter à chaque appel.
 */

export const currencyEUR = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export const percent = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  maximumFractionDigits: 0,
});

const relative = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' });

const THRESHOLDS: { limit: number; unit: Intl.RelativeTimeFormatUnit; div: number }[] = [
  { limit: 60, unit: 'second', div: 1 },
  { limit: 3600, unit: 'minute', div: 60 },
  { limit: 86_400, unit: 'hour', div: 3600 },
  { limit: 604_800, unit: 'day', div: 86_400 },
  { limit: 2_592_000, unit: 'week', div: 604_800 },
  { limit: 31_536_000, unit: 'month', div: 2_592_000 },
  { limit: Infinity, unit: 'year', div: 31_536_000 },
];

/** Formate une date ISO en relatif FR ("il y a 3 min"). Stable côté SSR. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const target = new Date(iso);
  const diffSec = Math.round((target.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diffSec);
  for (const t of THRESHOLDS) {
    if (abs < t.limit) {
      return relative.format(Math.round(diffSec / t.div), t.unit);
    }
  }
  return relative.format(Math.round(diffSec / 31_536_000), 'year');
}
