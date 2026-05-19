'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Drawer from '@/components/admin/ui/Drawer';
import StatusPill from './StatusPill';
import { cn } from '@/lib/cn';
import {
  FORMULE_META,
  STATUS_META,
  formatEventDate,
  formatPriceCents,
  formatSlot,
} from '@/lib/admin-hooks/reservation-meta';
import {
  ALLOWED_TRANSITIONS,
  type DemandeReservation,
  type ReservationStatus,
} from '@/lib/admin-hooks/useDemandeReservation';

interface DrawerProps {
  reservation: DemandeReservation | null;
  open: boolean;
  onClose: () => void;
  onTransition: (target: ReservationStatus) => Promise<void> | void;
  onSaveNote: (note: string) => Promise<void> | void;
  busy?: boolean;
}

export default function ReservationDrawer({
  reservation,
  open,
  onClose,
  onTransition,
  onSaveNote,
  busy,
}: DrawerProps) {
  const [note, setNote] = useState<string>(reservation?.adminNote ?? '');
  const [savingNote, setSavingNote] = useState(false);
  const [confirmRefuseOpen, setConfirmRefuseOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-init le textarea quand on change de réservation.
  useEffect(() => {
    setNote(reservation?.adminNote ?? '');
  }, [reservation?.id, reservation?.adminNote]);

  // Autosave debounce 800ms — appel onSaveNote dès que le user arrête de taper.
  useEffect(() => {
    if (!reservation) return;
    if (note === (reservation.adminNote ?? '')) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSavingNote(true);
      try {
        await onSaveNote(note);
      } finally {
        setSavingNote(false);
      }
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [note, reservation, onSaveNote]);

  const allowedTransitions = useMemo<ReservationStatus[]>(() => {
    if (!reservation) return [];
    return ALLOWED_TRANSITIONS[reservation.status];
  }, [reservation]);

  if (!reservation) {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        title="Demande de réservation"
        width={560}
      >
        <div className="text-sm text-admin-text-muted">Aucune sélection.</div>
      </Drawer>
    );
  }

  const formule = FORMULE_META[reservation.formuleKey];
  const totalCents = reservation.unitPriceCentsSnapshot * reservation.kidsCount;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={reservation.reference}
      description={STATUS_META[reservation.status].description}
      width={560}
    >
      <div className="flex flex-col gap-5">
        {/* Bandeau status — sous le header puisque Drawer ne supporte que des
            string en description. */}
        <div className="-mt-2">
          <StatusPill status={reservation.status} size="md" />
        </div>

        {/* Bloc 1 — récap */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Détails de la demande
          </h3>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <Detail label="Enfant fêté">
              {reservation.childName} · {reservation.childAge} ans
            </Detail>
            <Detail label="Invités">{reservation.kidsCount} enfants</Detail>
            <Detail label="Formule">
              {formule?.icon} {formule?.label ?? reservation.formuleKey}
            </Detail>
            <Detail label="Total estimé">{formatPriceCents(totalCents)}</Detail>
            <Detail label="Date">{formatEventDate(reservation.eventDate)}</Detail>
            <Detail label="Créneau">{formatSlot(reservation.timeSlot)}</Detail>
            {reservation.cakeNote && (
              <Detail label="Gâteau" colSpan={2}>{reservation.cakeNote}</Detail>
            )}
            {reservation.allergies && (
              <Detail label="Allergies" colSpan={2} highlight>
                {reservation.allergies}
              </Detail>
            )}
          </dl>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Parent organisateur
          </h3>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <Detail label="Nom" colSpan={2}>
              {reservation.parentFirstName} {reservation.parentLastName}
            </Detail>
            <Detail label="Email" colSpan={2}>
              <a
                href={`mailto:${reservation.parentEmail}`}
                className="text-admin-brand hover:underline"
              >
                {reservation.parentEmail}
              </a>
            </Detail>
            <Detail label="Téléphone">
              <a
                href={`tel:${reservation.parentPhone}`}
                className="text-admin-brand hover:underline"
              >
                {reservation.parentPhone}
              </a>
            </Detail>
            {reservation.source && <Detail label="Source">{reservation.source}</Detail>}
            {reservation.message && (
              <Detail label="Message" colSpan={2}>
                {reservation.message}
              </Detail>
            )}
            <Detail label="Newsletter">
              {reservation.acceptNewsletter ? '✅ Acceptée' : '❌ Refusée'}
            </Detail>
            <Detail label="Upsell VR">
              {reservation.upsellVR ? '🥽 Coché' : '—'}
            </Detail>
          </dl>
        </section>

        {/* Bloc 2 — actions */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Faire évoluer le statut
          </h3>
          {allowedTransitions.length === 0 ? (
            <p className="text-sm text-admin-text-muted">
              Statut terminal — aucune transition possible.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allowedTransitions.map((target) => (
                <button
                  key={target}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (target === 'refuse') {
                      setConfirmRefuseOpen(true);
                    } else {
                      onTransition(target);
                    }
                  }}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm font-medium transition',
                    target === 'refuse'
                      ? 'border-admin-red/40 bg-admin-red-soft text-admin-red hover:bg-admin-red/10'
                      : 'border-admin-brand/40 bg-admin-brand-soft text-admin-brand hover:bg-admin-brand/15',
                    busy && 'opacity-60',
                  )}
                >
                  Passer à <strong>{STATUS_META[target].label}</strong>
                </button>
              ))}
            </div>
          )}

          {confirmRefuseOpen && (
            <div className="mt-3 rounded-md border border-admin-red/30 bg-admin-red-soft p-3 text-sm text-admin-red">
              <p className="font-medium">Confirmer le refus ?</p>
              <p className="mt-1 text-xs">
                Cette action est terminale. Aucun email automatique n'est envoyé
                au client (V1 manuel — pensez à l'avertir par téléphone).
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setConfirmRefuseOpen(false);
                    await onTransition('refuse');
                  }}
                  disabled={busy}
                  className="rounded-md bg-admin-red px-3 py-1.5 text-sm font-medium text-white hover:bg-admin-red/90 disabled:opacity-60"
                >
                  Oui, refuser
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRefuseOpen(false)}
                  className="rounded-md border border-admin-border bg-admin-bg-elev px-3 py-1.5 text-sm text-admin-text hover:bg-admin-bg-sunken"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Bloc 3 — note interne */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
              Note interne
            </h3>
            <span
              className={cn(
                'text-[0.7rem]',
                savingNote ? 'text-admin-amber' : 'text-admin-text-muted',
              )}
              aria-live="polite"
            >
              {savingNote ? '… enregistrement' : 'Auto-enregistrée'}
            </span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Compte-rendu de l'appel, conditions négociées, montant acompte reçu, etc."
            rows={5}
            maxLength={2000}
            className="w-full rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring"
          />
        </section>

        {/* Bloc 4 — timeline */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Historique
          </h3>
          <ol className="space-y-2 text-sm">
            <TimelineRow label="Demande créée" iso={reservation.createdAt} done />
            <TimelineRow label="Contactée" iso={reservation.internalContactedAt} done />
            <TimelineRow label="Confirmée" iso={reservation.internalConfirmedAt} done />
            <TimelineRow label="Refusée" iso={reservation.internalRefusedAt} done variant="danger" />
            <TimelineRow label="Passée" iso={reservation.internalPassedAt} done variant="muted" />
          </ol>
        </section>
      </div>
    </Drawer>
  );
}

function Detail({
  label,
  children,
  colSpan,
  highlight,
}: {
  label: string;
  children: React.ReactNode;
  colSpan?: 1 | 2;
  highlight?: boolean;
}) {
  return (
    <div className={cn(colSpan === 2 ? 'col-span-2' : 'col-span-1')}>
      <dt className="text-[0.7rem] uppercase tracking-wider text-admin-text-muted">{label}</dt>
      <dd className={cn('mt-0.5 text-admin-text', highlight && 'text-admin-red font-medium')}>
        {children}
      </dd>
    </div>
  );
}

function TimelineRow({
  label,
  iso,
  done,
  variant = 'default',
}: {
  label: string;
  iso: string | null;
  done?: boolean;
  variant?: 'default' | 'danger' | 'muted';
}) {
  if (!iso) {
    return (
      <li className="flex items-center gap-2 text-admin-text-muted/70">
        <span className="h-1.5 w-1.5 rounded-full bg-admin-border" aria-hidden />
        <span>{label}</span>
        <span className="text-[0.7rem]">·</span>
        <span className="text-[0.7rem] italic">non passée</span>
      </li>
    );
  }
  const date = new Date(iso);
  return (
    <li className="flex items-center gap-2">
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          variant === 'danger'
            ? 'bg-admin-red'
            : variant === 'muted'
              ? 'bg-admin-slate'
              : 'bg-admin-green',
        )}
        aria-hidden
      />
      <span className="text-admin-text">{label}</span>
      <span className="text-[0.7rem] text-admin-text-muted">·</span>
      <span className="text-[0.7rem] text-admin-text-muted">
        {date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}{' '}
        {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </li>
  );
}
