'use client';

import { useEffect, useState } from 'react';
import { X, Info } from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';

const SESSION_KEY = 'fgc-admin-demo-banner-dismissed';

/**
 * Banner amber affiché tant que `meta.demo === true` côté API.
 * Dismissible via sessionStorage : re-affiché à chaque session navigateur
 * (intentionnel — on veut que le staff voie le rappel à chaque ouverture).
 */
export default function DemoBanner({ visible }: { visible: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;
    setDismissed(sessionStorage.getItem(SESSION_KEY) === '1');
  }, []);

  if (!visible || !mounted || dismissed) return null;

  return (
    <div
      role="status"
      className="mb-5 flex items-start gap-3 rounded-lg border border-admin-amber/30 bg-admin-amber-soft px-4 py-3 text-[0.8125rem] text-admin-amber"
    >
      <Icon icon={Info} size={16} className="mt-0.5" />
      <div className="flex-1 leading-snug">
        Les chiffres affichés sont des <strong>données de démonstration</strong>.
        Les vraies données seront branchées en PR5 (gestion des réservations).
      </div>
      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem(SESSION_KEY, '1');
          setDismissed(true);
        }}
        className="rounded-md p-1 text-admin-amber/80 transition-colors hover:bg-admin-amber/10 hover:text-admin-amber"
        aria-label="Fermer le rappel démo"
        title="Fermer"
      >
        <Icon icon={X} size={14} />
      </button>
    </div>
  );
}
