'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/Button';
import type { AnnivFormule, ReservationConfirmation, TunnelDraft } from './types';

const SLOT_LABEL: Record<string, string> = {
  '10:00': '10h00 – 12h00',
  '14:00': '14h00 – 16h00',
  '14:30': '14h30 – 16h30',
  '16:00': '16h00 – 18h00',
  '16:30': '16h30 – 18h30',
  '17:00': '17h00 – 19h00',
};

function formatDateLong(iso: string): string {
  const date = new Date(iso + 'T00:00:00');
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

interface ConfirmProps {
  formules: AnnivFormule[];
  draft: TunnelDraft;
  reservation: ReservationConfirmation;
}

export default function StepConfirmation({ formules, draft, reservation }: ConfirmProps) {
  const formule = formules.find((f) => f.key === draft.formuleKey);
  const [copied, setCopied] = useState(false);

  function copyRef() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(reservation.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="animate-fgc-rsv-fwd text-center">
      <div className="text-6xl">🎉</div>
      <h2 className="mt-3 font-display text-3xl md:text-4xl text-fgc-yellow">
        Demande envoyée
      </h2>
      <p className="mx-auto mt-3 max-w-fgc-lead text-fgc-cream/85">
        L’anniversaire de <strong>{draft.childName}</strong> est <strong>en attente de validation</strong>.<br />
        On vous rappelle sous 24h pour confirmer la date et organiser l’acompte.
      </p>

      <div className="mx-auto mt-8 max-w-2xl rounded-fgc-rsv border border-fgc-purple/60 bg-fgc-card p-6 text-left">
        <div className="mb-4 rounded-fgc-card-soft bg-fgc-yellow p-4 text-center text-fgc-bg">
          <div className="text-xs uppercase tracking-fgc-cap font-bold">Votre référence</div>
          <div className="mt-1 flex items-center justify-center gap-3 font-display text-2xl">
            <span>{reservation.reference}</span>
            <button
              type="button"
              onClick={copyRef}
              className="rounded-full border border-fgc-bg/30 px-3 py-0.5 text-xs font-semibold transition hover:bg-fgc-bg/10"
            >
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Detail label="Formule">{formule ? `${formule.icon} ${formule.name}` : '—'}</Detail>
          <Detail label="Date">
            <span className="capitalize">{formatDateLong(reservation.eventDate.slice(0, 10))}</span>
          </Detail>
          <Detail label="Créneau">{SLOT_LABEL[reservation.timeSlot] ?? reservation.timeSlot}</Detail>
          <Detail label="Invités">{draft.kidsCount} enfants</Detail>
          <Detail label="Pour">{draft.childName}, {draft.childAge} ans</Detail>
          <Detail label="Email">
            <a
              href={`mailto:${draft.parentEmail}`}
              className="text-fgc-cyan hover:underline"
            >
              {draft.parentEmail}
            </a>
          </Detail>
        </div>

        <div className="mt-6 rounded-fgc-card-soft border border-fgc-cyan/30 bg-fgc-cyan/5 p-4 text-left">
          <div className="text-[0.7rem] uppercase tracking-fgc-eyebrow text-fgc-cyan">
            Ce qui arrive ensuite
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-fgc-cream/90">
            <li>
              <strong className="text-fgc-cyan">J+1</strong> · Notre équipe vous appelle au {draft.parentPhone} pour valider la date.
            </li>
            <li>
              <strong className="text-fgc-cyan">Acompte 50 €</strong> · À régler sur place ou par virement après l’appel.
            </li>
            <li>
              <strong className="text-fgc-cyan">J−7</strong> · Email de rappel avec le plan d’accès.
            </li>
            <li>
              <strong className="text-fgc-cyan">Jour J</strong> · Arrivée 15 min avant, accueil par notre animateur.
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/tarifs-et-formules"
          className={buttonVariants({ variant: 'ghost' })}
        >
          Voir les autres formules
        </Link>
        <Link
          href="/"
          className={buttonVariants({ variant: 'primary' })}
        >
          Retour à l’accueil ›
        </Link>
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-fgc-sm bg-fgc-bg/40 p-3">
      <div className="text-[0.65rem] uppercase tracking-fgc-cap text-fgc-cream/60">{label}</div>
      <div className="mt-1 text-sm text-fgc-cream">{children}</div>
    </div>
  );
}
