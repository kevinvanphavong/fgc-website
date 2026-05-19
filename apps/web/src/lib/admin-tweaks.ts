'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Tweaks panel — réglages d'interface persistés (PR8).
 * Source de vérité : localStorage clé `fgc.admin.tweaks`.
 * Le state est appliqué via attributs data sur <html data-admin-density="…">
 * pour pouvoir conditionner le CSS via Tailwind (`data-[admin-density=compact]:p-2`).
 */

export type Density = 'compact' | 'regular' | 'comfy';
export type SidebarMode = 'expanded' | 'collapsed' | 'floating';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface AdminTweaks {
  density: Density;
  sidebar: SidebarMode;
  theme: ThemeMode;
  panelOpen: boolean;
}

export const DEFAULT_TWEAKS: AdminTweaks = {
  density: 'regular',
  sidebar: 'expanded',
  theme: 'light',
  panelOpen: false,
};

const STORAGE_KEY = 'fgc.admin.tweaks';

function readStored(): AdminTweaks {
  if (typeof window === 'undefined') return DEFAULT_TWEAKS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TWEAKS;
    const parsed = JSON.parse(raw) as Partial<AdminTweaks>;
    return { ...DEFAULT_TWEAKS, ...parsed };
  } catch {
    return DEFAULT_TWEAKS;
  }
}

function writeStored(t: AdminTweaks): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  } catch {
    /* quota plein, ignore */
  }
}

function applyToHtml(t: AdminTweaks): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.dataset.adminDensity = t.density;
  html.dataset.adminSidebar = t.sidebar;
  html.dataset.adminTheme = t.theme;
}

/**
 * Hook partagé — un seul abonnement à `storage` permet à plusieurs onglets de
 * rester sync. Pas de prop drilling : chaque composant qui lit les tweaks
 * appelle `useAdminTweaks()`.
 */
export function useAdminTweaks() {
  const [tweaks, setTweaks] = useState<AdminTweaks>(DEFAULT_TWEAKS);
  const [ready, setReady] = useState(false);

  // Hydratation côté client uniquement.
  useEffect(() => {
    const stored = readStored();
    setTweaks(stored);
    applyToHtml(stored);
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const next = JSON.parse(e.newValue) as AdminTweaks;
          setTweaks(next);
          applyToHtml(next);
        } catch {
          /* invalid JSON, ignore */
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((patch: Partial<AdminTweaks>) => {
    setTweaks((prev) => {
      const next = { ...prev, ...patch };
      writeStored(next);
      applyToHtml(next);
      return next;
    });
  }, []);

  return { tweaks, update, ready };
}
