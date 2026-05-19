'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  EMPTY_DRAFT,
  STEP_ORDER,
  type StepKey,
  type TunnelDraft,
} from './types';

const STORAGE_KEY = 'fgc.anniv.draft';

function readDraft(): TunnelDraft {
  if (typeof window === 'undefined') return EMPTY_DRAFT;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<TunnelDraft>;
    // Merge avec EMPTY pour combler un éventuel champ ajouté entre 2 versions.
    return { ...EMPTY_DRAFT, ...parsed };
  } catch {
    return EMPTY_DRAFT;
  }
}

function writeDraft(draft: TunnelDraft): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* quota plein ou Safari private mode — on ignore, le tunnel reste fonctionnel */
  }
}

/**
 * State machine du tunnel : draft + step courante + transitions.
 *
 * - Persistance auto en sessionStorage (clé `fgc.anniv.draft`).
 * - À la confirmation finale (step=`confirmation` + reservation set),
 *   le sessionStorage est nettoyé par `confirm()`.
 * - `prefillFormule` pré-sélectionne via `?formule=KEY` au mount.
 */
export function useReservationTunnel(prefillFormule?: string | null) {
  const [draft, setDraft] = useState<TunnelDraft>(EMPTY_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  // Hydratation côté client (sessionStorage indispo en SSR).
  useEffect(() => {
    const stored = readDraft();
    if (
      prefillFormule
      && ['newbowler', 'superbowler', 'probowler'].includes(prefillFormule)
      && stored.step === 'formule'
      && stored.formuleKey === null
    ) {
      stored.formuleKey = prefillFormule as TunnelDraft['formuleKey'];
    }
    setDraft(stored);
    setHydrated(true);
  }, [prefillFormule]);

  // Auto-persist après hydratation.
  useEffect(() => {
    if (hydrated) writeDraft(draft);
  }, [draft, hydrated]);

  const update = useCallback((patch: Partial<TunnelDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const setStep = useCallback((step: StepKey) => {
    setDraft((d) => ({ ...d, step }));
    // Scroll en haut du tunnel sur transition — feedback visuel important.
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  const goNext = useCallback(() => {
    setDraft((d) => {
      const idx = STEP_ORDER.indexOf(d.step);
      const next = STEP_ORDER[idx + 1] ?? d.step;
      return { ...d, step: next };
    });
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  const goBack = useCallback(() => {
    setDraft((d) => {
      const idx = STEP_ORDER.indexOf(d.step);
      const prev = STEP_ORDER[Math.max(0, idx - 1)] ?? d.step;
      return { ...d, step: prev };
    });
  }, []);

  const reset = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  /** Set la résa finale + clean sessionStorage + désactive le back nav. */
  const confirm = useCallback((reservation: TunnelDraft['reservation']) => {
    setDraft((d) => ({ ...d, reservation, step: 'confirmation' }));
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
      // Désactive le retour navigateur sur la page de confirmation
      // (refresh = revient sur /reserver-anniversaire en step formule).
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const completedSteps = useMemo<StepKey[]>(() => {
    const out: StepKey[] = [];
    if (draft.formuleKey) out.push('formule');
    if (draft.date && draft.timeSlot) out.push('date');
    if (draft.childName && draft.childAge && draft.kidsCount) out.push('enfant');
    if (draft.parentEmail && draft.parentPhone && draft.acceptCGV) out.push('coordonnees');
    return out;
  }, [draft]);

  return {
    draft,
    hydrated,
    update,
    setStep,
    goNext,
    goBack,
    reset,
    confirm,
    completedSteps,
    scrollAnchorRef,
  };
}
