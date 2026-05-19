'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Bandeau cookies (PR9 finitions).
 *
 * Stockage : localStorage `fgc.cookies.consent` = JSON { necessary, analytics,
 * marketing, ts }. Re-demande après 13 mois (norme CNIL).
 *
 * Non-bloquant : slide-in en bas, n'occupe pas tout l'écran. V1 : aucun cookie
 * tiers actif, le composant est posé pour conformité visuelle et préparer
 * l'ajout futur d'analytics.
 *
 * Réouverture depuis le footer : `window.dispatchEvent(new Event('fgc:open-cookies'))`.
 */

interface Consent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
}

const STORAGE_KEY = 'fgc.cookies.consent';
const MAX_AGE_MS = 13 * 30 * 24 * 60 * 60 * 1000; // ~13 mois

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'compact' | 'custom'>('compact');
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setOpen(true);
      return;
    }
    try {
      const consent = JSON.parse(raw) as Consent;
      const age = Date.now() - (consent.ts ?? 0);
      if (age > MAX_AGE_MS) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }

    const reopen = () => {
      setOpen(true);
      setMode('compact');
    };
    window.addEventListener('fgc:open-cookies', reopen);
    return () => window.removeEventListener('fgc:open-cookies', reopen);
  }, []);

  function persist(consent: Omit<Consent, 'necessary' | 'ts'>) {
    const payload: Consent = {
      necessary: true,
      analytics: consent.analytics,
      marketing: consent.marketing,
      ts: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-fgc-md border border-fgc-yellow/30 bg-fgc-card/95 p-5 shadow-fgc-soft backdrop-blur md:inset-x-auto md:right-5 md:bottom-5"
    >
      <div className="flex flex-col gap-4">
        <div>
          <h2
            id="cookie-banner-title"
            className="font-display text-[1rem] uppercase text-fgc-yellow"
          >
            🍪 Vos cookies
          </h2>
          <p className="mt-1.5 text-[0.9rem] leading-relaxed text-fgc-cream/85">
            On utilise uniquement les cookies nécessaires au site (session admin).
            Aucun analytics ni pixel publicitaire en V1. Vous pouvez ajuster vos
            préférences à tout moment.
          </p>
        </div>

        {mode === 'custom' && (
          <div className="flex flex-col gap-2 rounded-md border border-fgc-yellow/15 bg-white/[0.04] p-3 text-[0.85rem]">
            <Row
              label="Nécessaires"
              hint="Session admin · indispensable au fonctionnement"
              checked
              disabled
            />
            <Row
              label="Analytics"
              hint="Statistiques de visite (actuellement aucun)"
              checked={analytics}
              onChange={setAnalytics}
            />
            <Row
              label="Marketing"
              hint="Retargeting, pixels tiers (actuellement aucun)"
              checked={marketing}
              onChange={setMarketing}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/legal/cookies"
            className="text-[0.8rem] text-fgc-cream/70 underline-offset-4 hover:text-fgc-yellow hover:underline"
          >
            En savoir plus
          </Link>

          <div className="flex flex-wrap gap-2">
            {mode === 'compact' ? (
              <>
                <button
                  type="button"
                  onClick={() => setMode('custom')}
                  className="rounded-full border border-fgc-yellow/30 px-4 py-2 text-[0.85rem] font-medium text-fgc-cream/85 hover:bg-fgc-yellow/10"
                >
                  Personnaliser
                </button>
                <button
                  type="button"
                  onClick={() => persist({ analytics: false, marketing: false })}
                  className="rounded-full border border-fgc-yellow/30 px-4 py-2 text-[0.85rem] font-medium text-fgc-cream/85 hover:bg-fgc-yellow/10"
                >
                  Tout refuser
                </button>
                <button
                  type="button"
                  onClick={() => persist({ analytics: true, marketing: true })}
                  className="rounded-full bg-fgc-yellow px-4 py-2 text-[0.85rem] font-semibold text-fgc-purple hover:bg-fgc-yellow-dark"
                >
                  Tout accepter
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => persist({ analytics, marketing })}
                className="rounded-full bg-fgc-yellow px-4 py-2 text-[0.85rem] font-semibold text-fgc-purple hover:bg-fgc-yellow-dark"
              >
                Enregistrer mes choix
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 py-1">
      <div className="flex-1">
        <span className="font-medium text-fgc-cream">{label}</span>
        <span className="block text-[0.75rem] text-fgc-cream/60">{hint}</span>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10 accent-fgc-yellow"
      />
    </label>
  );
}
