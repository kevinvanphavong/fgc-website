'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMyReservations, type ReservationItem } from '@/lib/use-client';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function formatPrice(cents: number | null): string {
  if (cents == null) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

function statusColor(kind: string, status: string): string {
  if (kind === 'anniv') {
    switch (status) {
      case 'nouveau': return 'bg-fgc-pink-hot/15 text-fgc-pink-hot border border-fgc-pink-hot/40';
      case 'contacte': return 'bg-fgc-yellow/15 text-fgc-yellow border border-fgc-yellow/40';
      case 'confirme': return 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40';
      case 'passe': return 'bg-white/10 text-fgc-cream/70 border border-white/15';
      case 'refuse': return 'bg-fgc-pink-hot/15 text-fgc-pink-hot border border-fgc-pink-hot/40';
    }
  }
  // B2B
  switch (status) {
    case 'gagne': return 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40';
    case 'perdu': return 'bg-fgc-pink-hot/15 text-fgc-pink-hot border border-fgc-pink-hot/40';
    default: return 'bg-fgc-yellow/15 text-fgc-yellow border border-fgc-yellow/40';
  }
}

export default function ReservationsClient() {
  const { data, isLoading, error } = useMyReservations();
  const [openItem, setOpenItem] = useState<ReservationItem | null>(null);

  if (isLoading) {
    return <div className="text-center text-fgc-cream/70">Chargement…</div>;
  }
  if (error) {
    return (
      <div className="rounded-xl border border-fgc-pink-hot/40 bg-fgc-pink-hot/10 px-4 py-3 text-fgc-cream">
        Impossible de charger vos réservations.
      </div>
    );
  }
  if (!data || data.total === 0) {
    return (
      <div className="rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-10 text-center">
        <div className="mb-3 text-5xl">🎂</div>
        <h2 className="font-display text-[1.3rem] uppercase tracking-fgc-cap text-fgc-yellow">
          Pas encore de réservation
        </h2>
        <p className="mt-2 text-fgc-cream/80">
          Réservez votre prochain anniversaire en quelques clics.
        </p>
        <Link
          href="/reserver-anniversaire"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-fgc-yellow-shadow bg-fgc-yellow px-6 py-3 font-display text-[0.95rem] uppercase text-fgc-purple shadow-fgc-btn-yellow transition-transform hover:-translate-y-0.5 active:translate-y-px"
        >
          🎉 Réserver un anniv →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {data.items.map((it) => (
          <article
            key={`${it.kind}-${it.id}`}
            className="flex flex-col gap-3 rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-3xl" aria-hidden="true">
                {it.kind === 'anniv' ? '🎂' : '💼'}
              </div>
              <span
                className={`rounded-full px-3 py-1 font-display text-[0.72rem] uppercase tracking-fgc-cap ${statusColor(
                  it.kind,
                  it.status,
                )}`}
              >
                {it.statusLabel}
              </span>
            </div>
            <h3 className="font-display text-[1rem] uppercase text-fgc-cream">{it.summary}</h3>
            <dl className="grid grid-cols-2 gap-2 text-[0.85rem] text-fgc-cream/75">
              <div>
                <dt className="text-fgc-cream/55">Date</dt>
                <dd>{formatDate(it.eventDate)}</dd>
              </div>
              <div>
                <dt className="text-fgc-cream/55">Réf.</dt>
                <dd className="font-mono">{it.reference}</dd>
              </div>
              {it.totalCents != null && (
                <div className="col-span-2">
                  <dt className="text-fgc-cream/55">Montant</dt>
                  <dd className="text-fgc-yellow">{formatPrice(it.totalCents)}</dd>
                </div>
              )}
            </dl>
            <button
              type="button"
              onClick={() => setOpenItem(it)}
              className="mt-auto self-start text-[0.85rem] font-display uppercase tracking-fgc-cap text-fgc-yellow hover:underline"
            >
              Voir détails →
            </button>
          </article>
        ))}
      </div>

      {openItem && <DetailsModal item={openItem} onClose={() => setOpenItem(null)} />}
    </>
  );
}

function DetailsModal({ item, onClose }: { item: ReservationItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-fgc-bg-deeper/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[520px] rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-6 shadow-fgc-soft md:p-8">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <span className="text-[0.78rem] uppercase tracking-fgc-cap text-fgc-pink-hot">
              {item.kind === 'anniv' ? 'Anniversaire' : 'Demande B2B'}
            </span>
            <h3 className="font-display text-[1.15rem] uppercase text-fgc-yellow">
              {item.reference}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-fgc-cream/60 hover:text-fgc-cream"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-[0.9rem]">
          <div>
            <dt className="text-fgc-cream/55">Statut</dt>
            <dd className="text-fgc-cream">{item.statusLabel}</dd>
          </div>
          <div>
            <dt className="text-fgc-cream/55">Date</dt>
            <dd className="text-fgc-cream">{formatDate(item.eventDate)}</dd>
          </div>
          {item.timeSlot && (
            <div>
              <dt className="text-fgc-cream/55">Créneau</dt>
              <dd className="text-fgc-cream">{item.timeSlot}</dd>
            </div>
          )}
          {item.totalCents != null && (
            <div>
              <dt className="text-fgc-cream/55">Montant</dt>
              <dd className="text-fgc-yellow">{formatPrice(item.totalCents)}</dd>
            </div>
          )}
          <div className="col-span-2">
            <dt className="text-fgc-cream/55">Récapitulatif</dt>
            <dd className="text-fgc-cream">{item.summary}</dd>
          </div>
        </dl>
        <p className="mt-5 text-[0.85rem] text-fgc-cream/70">
          Pour toute modification ou question, appelez-nous au{' '}
          <a href="tel:+33254000000" className="text-fgc-yellow hover:underline">
            02 54 00 00 00
          </a>
          .
        </p>
      </div>
    </div>
  );
}
