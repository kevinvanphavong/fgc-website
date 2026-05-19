'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/Button';
import { formatApiError, submitReservation, ApiError } from './api';
import { FORMULE_TOKEN, type AnnivFormule, type StepKey, type TunnelDraft, type ReservationConfirmation } from './types';

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €';
}

function formatDateLong(iso: string): string {
  const date = new Date(iso + 'T00:00:00');
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

const SLOT_LABEL: Record<string, string> = {
  '10:00': '10h00 – 12h00',
  '14:00': '14h00 – 16h00',
  '14:30': '14h30 – 16h30',
  '16:00': '16h00 – 18h00',
  '16:30': '16h30 – 18h30',
  '17:00': '17h00 – 19h00',
};

interface Step5Props {
  formules: AnnivFormule[];
  draft: TunnelDraft;
  onBack: () => void;
  onJump: (step: StepKey) => void;
  onConfirmed: (reservation: ReservationConfirmation) => void;
}

export default function Step5Recap({
  formules,
  draft,
  onBack,
  onJump,
  onConfirmed,
}: Step5Props) {
  const formule = formules.find((f) => f.key === draft.formuleKey);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotConflict, setSlotConflict] = useState(false);

  if (!formule || !draft.date || !draft.timeSlot || !draft.kidsCount) {
    return (
      <div className="rounded-fgc-rsv border border-fgc-pink-hot/40 bg-fgc-pink-hot/5 p-6 text-center text-fgc-cream">
        <p>Récapitulatif incomplet — retournez vérifier les étapes précédentes.</p>
        <button
          type="button"
          onClick={onBack}
          className={cn(buttonVariants({ variant: 'ghost' }), 'mt-4')}
        >
          ‹ Retour
        </button>
      </div>
    );
  }

  const totalCents = formule.unitPriceCents * draft.kidsCount;
  const tok = FORMULE_TOKEN[formule.key];

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setSlotConflict(false);
    try {
      const reservation = await submitReservation(draft);
      onConfirmed(reservation);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSlotConflict(true);
        setError('Ce créneau vient d’être pris par une autre famille. Choisissez-en un autre.');
      } else {
        setError(formatApiError(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fgc-rsv-fwd">
      <header className="mb-8 text-center">
        <span className="text-[0.85rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
          Étape 5 · Tout est en ordre ?
        </span>
        <h2 className="mt-2 font-display text-3xl md:text-4xl text-fgc-cream">
          Un dernier <span className="text-fgc-yellow">check ?</span>
        </h2>
        <p className="mx-auto mt-3 max-w-fgc-lead text-fgc-cream/80">
          Vérifiez chaque détail. Tout peut encore être modifié en revenant
          sur l’étape concernée.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <RecapBlock title="🎉 La fête" onEdit={() => onJump('formule')}>
            <Row label="Formule" value={
              <strong className={tok.chipText}>
                {formule.icon} {formule.name}
              </strong>
            } />
            <Row label="Prix par enfant" value={formatPrice(formule.unitPriceCents)} />
            <Row label="Durée" value={formule.duration} />
            {draft.upsellVR && (
              <Row label="VR" value={<span className="text-fgc-pink-hot">🥽 Incluse</span>} />
            )}
          </RecapBlock>

          <RecapBlock title="📅 Quand" onEdit={() => onJump('date')}>
            <Row label="Date" value={<span className="capitalize">{formatDateLong(draft.date)}</span>} />
            <Row label="Créneau" value={SLOT_LABEL[draft.timeSlot] ?? draft.timeSlot} />
          </RecapBlock>

          <RecapBlock title="🤩 L'enfant" onEdit={() => onJump('enfant')}>
            <Row label="Prénom" value={draft.childName} />
            <Row label="Âge fêté" value={`${draft.childAge} ans`} />
            <Row label="Nombre d'enfants" value={`${draft.kidsCount} enfants`} />
            {draft.cakeNote && <Row label="Gâteau" value={draft.cakeNote} />}
            {draft.allergies && <Row label="Allergies" value={<span className="text-fgc-pink-hot">{draft.allergies}</span>} />}
          </RecapBlock>

          <RecapBlock title="✍️ Parent organisateur" onEdit={() => onJump('coordonnees')}>
            <Row label="Nom" value={`${draft.parentFirstName} ${draft.parentLastName}`} />
            <Row label="Email" value={draft.parentEmail} />
            <Row label="Téléphone" value={draft.parentPhone} />
          </RecapBlock>
        </div>

        <aside className="space-y-4">
          <div className="rounded-fgc-rsv border border-fgc-yellow/30 bg-fgc-yellow/5 p-5">
            <div className="text-[0.7rem] uppercase tracking-fgc-eyebrow text-fgc-yellow">
              Détail des coûts
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-fgc-cream">
              <span>{formule.name} × {draft.kidsCount} enfants</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-fgc-cream/60">
              <span>L’enfant héros</span>
              <span>Offert 🎁</span>
            </div>
            <div className="my-4 h-px bg-fgc-cream/15" />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-fgc-cream">Total fête</span>
              <span className="font-display text-2xl text-fgc-yellow">{formatPrice(totalCents)}</span>
            </div>
          </div>

          <div className="rounded-fgc-rsv border border-fgc-cyan/30 bg-fgc-cyan/5 p-5 text-sm text-fgc-cream/90">
            <div className="text-[0.7rem] uppercase tracking-fgc-eyebrow text-fgc-cyan">
              Demande de réservation
            </div>
            <p className="mt-2">
              <strong className="text-fgc-cyan">Pas de paiement en ligne.</strong>{' '}
              Notre équipe vous rappelle sous 24h pour confirmer la date et
              organiser l’acompte de 50&nbsp;€ (sur place ou par virement).
            </p>
            <p className="mt-2 text-xs text-fgc-cream/70">
              Annulation gratuite jusqu’à 7 jours avant la fête.
            </p>
          </div>
        </aside>
      </div>

      {error && (
        <div
          role="alert"
          className={cn(
            'mt-6 rounded-fgc-card-soft border p-4 text-sm',
            slotConflict
              ? 'border-fgc-pink-hot/60 bg-fgc-pink-hot/10 text-fgc-cream'
              : 'border-fgc-pink-hot/40 bg-fgc-pink-hot/5 text-fgc-cream',
          )}
        >
          <strong className="text-fgc-pink-hot">Erreur :</strong> {error}
          {slotConflict && (
            <button
              type="button"
              onClick={() => onJump('date')}
              className={cn(buttonVariants({ variant: 'ghost' }), 'ml-3 mt-3 sm:mt-0 sm:ml-3')}
            >
              Choisir un autre créneau
            </button>
          )}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className={buttonVariants({ variant: 'ghost' })}
        >
          ‹ Modifier
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={buttonVariants({ variant: 'primary' })}
        >
          {submitting ? '… Envoi en cours' : 'Confirmer ma demande ›'}
        </button>
      </div>
    </div>
  );
}

function RecapBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-fgc-rsv border border-fgc-purple/60 bg-fgc-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg text-fgc-cream">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-fgc-cream/20 px-3 py-1 text-xs text-fgc-cream/80 transition hover:border-fgc-cream/40 hover:bg-fgc-cream/10"
        >
          Modifier
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-fgc-cream/70">{label}</span>
      <span className="text-right text-fgc-cream">{value}</span>
    </div>
  );
}
