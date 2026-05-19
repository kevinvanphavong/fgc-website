'use client';

import { useEffect } from 'react';

/**
 * Raccourcis clavier globaux admin (PR8).
 *
 * - `g` + lettre (Gmail/Linear style) → navigation entre pages.
 * - `?` → modale aide.
 * - `/` → focus barre de recherche page courante (data-admin-search).
 *
 * Tous désactivés quand un input/textarea/select/contentEditable a le focus
 * pour ne pas hijacker la frappe.
 */

export interface ShortcutDef {
  /** Séquence affichable ("g d", "?"). */
  combo: string;
  description: string;
  /** Si `keys` = ['g', 'd'], le binding attend `g` puis `d` dans la window). */
  keys: string[];
  action: ShortcutAction;
}

export type ShortcutAction =
  | { type: 'navigate'; href: string }
  | { type: 'open-help' }
  | { type: 'focus-search' };

export const ADMIN_SHORTCUTS: ShortcutDef[] = [
  { combo: 'g d', description: 'Dashboard', keys: ['g', 'd'], action: { type: 'navigate', href: '/admin' } },
  { combo: 'g r', description: 'Réservations', keys: ['g', 'r'], action: { type: 'navigate', href: '/admin/reservations' } },
  { combo: 'g b', description: 'Demandes B2B', keys: ['g', 'b'], action: { type: 'navigate', href: '/admin/b2b' } },
  { combo: 'g c', description: 'Clients', keys: ['g', 'c'], action: { type: 'navigate', href: '/admin/clients' } },
  { combo: 'g m', description: 'Médias', keys: ['g', 'm'], action: { type: 'navigate', href: '/admin/medias' } },
  { combo: 'g u', description: 'Utilisateurs', keys: ['g', 'u'], action: { type: 'navigate', href: '/admin/users' } },
  { combo: '?', description: 'Aide raccourcis', keys: ['?'], action: { type: 'open-help' } },
  { combo: '/', description: 'Focus recherche', keys: ['/'], action: { type: 'focus-search' } },
];

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (el.isContentEditable) return true;
  return false;
}

interface KeyboardOptions {
  onNavigate: (href: string) => void;
  onOpenHelp: () => void;
}

export function useAdminKeyboard({ onNavigate, onOpenHelp }: KeyboardOptions) {
  useEffect(() => {
    let pendingKey: string | null = null;
    let pendingTimeout: ReturnType<typeof setTimeout> | null = null;

    const reset = () => {
      pendingKey = null;
      if (pendingTimeout) clearTimeout(pendingTimeout);
      pendingTimeout = null;
    };

    const onKey = (e: KeyboardEvent) => {
      // Ne pas hijacker la frappe dans les inputs.
      if (isTypingTarget(e.target)) return;
      // Pas avec modificateurs (sinon conflit ⌘K etc.).
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      // `/` → focus search.
      if (key === '/' && !pendingKey) {
        const search = document.querySelector<HTMLInputElement>('[data-admin-search]');
        if (search) {
          e.preventDefault();
          search.focus();
          search.select?.();
          return;
        }
      }

      // `?` (shift+/ ou key='?') → open help.
      if (key === '?' && !pendingKey) {
        e.preventDefault();
        onOpenHelp();
        return;
      }

      // Séquence `g` + lettre.
      if (pendingKey === 'g') {
        const match = ADMIN_SHORTCUTS.find(
          (s) => s.keys.length === 2 && s.keys[0] === 'g' && s.keys[1] === key.toLowerCase(),
        );
        reset();
        if (match && match.action.type === 'navigate') {
          e.preventDefault();
          onNavigate(match.action.href);
        }
        return;
      }

      if (key === 'g') {
        pendingKey = 'g';
        pendingTimeout = setTimeout(() => reset(), 1500);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      reset();
    };
  }, [onNavigate, onOpenHelp]);
}
