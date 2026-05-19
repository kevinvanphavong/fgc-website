'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/Button';
import { fetchAvailability } from './api';
import type { AvailabilityResponse, AvailabilitySlot, TunnelDraft } from './types';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const DAY_NAMES_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function formatDateLong(d: Date): string {
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  return `${days[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
}

function toIso(d: Date): string {
  // Local date → ISO YYYY-MM-DD, sans décalage timezone.
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

interface Step2Props {
  draft: TunnelDraft;
  update: (patch: Partial<TunnelDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Date({ draft, update, onNext, onBack }: Step2Props) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const minDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return d;
  }, [today]);

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const base = draft.date ? new Date(draft.date + 'T00:00:00') : minDate;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  // Cache des dispos par ISO date (par session ; pas de invalidation explicite,
  // 5 min TTL côté React Query qu'on simule à la main avec un Map).
  const [availability, setAvailability] = useState<Record<string, AvailabilityResponse>>({});
  const [loadingDate, setLoadingDate] = useState<string | null>(null);

  // Fetch automatique quand l'utilisateur sélectionne une date.
  useEffect(() => {
    if (!draft.date || availability[draft.date]) return;
    let cancelled = false;
    setLoadingDate(draft.date);
    fetchAvailability(draft.date)
      .then((res) => {
        if (cancelled) return;
        setAvailability((prev) => ({ ...prev, [draft.date as string]: res }));
      })
      .catch(() => {
        // API down → tous les slots restent dispo (fallback indulgent).
        if (cancelled) return;
        setAvailability((prev) => ({
          ...prev,
          [draft.date as string]: {
            date: draft.date as string,
            minDate: toIso(minDate),
            dateTooSoon: false,
            slots: TIME_SLOTS.map((s) => ({ ...s, available: true })),
          },
        }));
      })
      .finally(() => {
        if (!cancelled) setLoadingDate(null);
      });
    return () => {
      cancelled = true;
    };
  }, [draft.date, availability, minDate]);

  const monthGrid = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const last = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
    // Convertir Sunday=0 → Monday=0.
    const startWeekday = (first.getDay() + 6) % 7;
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewMonth]);

  function selectDate(d: Date) {
    if (d < minDate) return;
    update({ date: toIso(d), timeSlot: null });
  }

  const selectedDate = draft.date ? new Date(draft.date + 'T00:00:00') : null;
  const slotsForDate: AvailabilitySlot[] = draft.date
    ? availability[draft.date]?.slots ?? TIME_SLOTS.map((s) => ({ ...s, available: true }))
    : [];
  const canContinue = !!draft.date && !!draft.timeSlot;

  return (
    <div className="animate-fgc-rsv-fwd">
      <header className="mb-8 text-center">
        <span className="text-[0.85rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
          Étape 2 · Date & créneau
        </span>
        <h2 className="mt-2 font-display text-3xl md:text-4xl text-fgc-cream">
          Quand venez-vous <span className="text-fgc-yellow">faire la fête ?</span>
        </h2>
        <p className="mx-auto mt-3 max-w-fgc-lead text-fgc-cream/80">
          Réservation possible à partir de 7 jours à l’avance. Week-ends en
          étoile — plus de chance d’avoir LA date.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Calendrier */}
        <div className="rounded-fgc-rsv border border-fgc-purple/60 bg-fgc-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              disabled={
                viewMonth.getFullYear() === today.getFullYear()
                && viewMonth.getMonth() === today.getMonth()
              }
              aria-label="Mois précédent"
              className="grid h-9 w-9 place-items-center rounded-full border border-fgc-cream/20 text-fgc-cream transition hover:bg-fgc-cream/10 disabled:opacity-30"
            >
              ‹
            </button>
            <div className="font-display text-lg text-fgc-cream">
              {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              aria-label="Mois suivant"
              className="grid h-9 w-9 place-items-center rounded-full border border-fgc-cream/20 text-fgc-cream transition hover:bg-fgc-cream/10"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-fgc-cream/60">
            {DAY_NAMES_SHORT.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {monthGrid.map((d, i) => {
              if (!d) return <div key={i} aria-hidden />;
              const isPast = d < minDate;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const iso = toIso(d);
              const isSel = draft.date === iso;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isPast}
                  onClick={() => selectDate(d)}
                  aria-label={formatDateLong(d) + (isPast ? ' (indisponible)' : '')}
                  className={cn(
                    'relative grid h-11 place-items-center rounded-fgc-sm border text-sm transition',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-fgc-yellow',
                    isSel && 'border-fgc-yellow bg-fgc-yellow/15 text-fgc-yellow font-bold',
                    !isSel && !isPast && isWeekend && 'border-fgc-pink-hot/40 bg-fgc-pink-hot/5 text-fgc-cream hover:border-fgc-pink-hot/70',
                    !isSel && !isPast && !isWeekend && 'border-fgc-cream/10 text-fgc-cream/85 hover:border-fgc-cream/30',
                    isPast && 'border-fgc-cream/5 text-fgc-cream/25 cursor-not-allowed',
                  )}
                >
                  <span>{d.getDate()}</span>
                  {isWeekend && !isPast && (
                    <span
                      aria-hidden
                      className="absolute right-0.5 top-0.5 text-[8px] text-fgc-pink-hot"
                    >
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-fgc-cream/60">
            <span className="inline-flex items-center gap-1.5">
              <i className="block h-2 w-2 rounded-full bg-fgc-cream/20" /> Indispo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="block h-2 w-2 rounded-full bg-fgc-pink-hot/60" /> Week-end ★
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="block h-2 w-2 rounded-full bg-fgc-yellow" /> Sélectionné
            </span>
          </div>
        </div>

        {/* Créneaux */}
        <div className="rounded-fgc-rsv border border-fgc-purple/60 bg-fgc-card p-5">
          <div className="mb-4">
            <div className="text-[0.75rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
              Créneau
            </div>
            <div className="mt-1 text-sm text-fgc-cream/80 capitalize">
              {selectedDate ? formatDateLong(selectedDate) : 'Choisissez d’abord une date'}
            </div>
            {loadingDate && (
              <div className="mt-2 text-xs text-fgc-cyan" role="status">
                Vérification des disponibilités…
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {slotsForDate.map((slot) => {
              const disabled = !selectedDate || !slot.available;
              const isSel = draft.timeSlot === slot.value;
              return (
                <button
                  key={slot.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => update({ timeSlot: slot.value })}
                  className={cn(
                    'flex items-center justify-between rounded-fgc-card-soft border px-4 py-3 text-left text-sm transition',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-fgc-yellow',
                    isSel && 'border-fgc-yellow bg-fgc-yellow/10',
                    !isSel && !disabled && 'border-fgc-cream/15 text-fgc-cream hover:border-fgc-cream/40',
                    disabled && 'border-fgc-cream/5 text-fgc-cream/30 cursor-not-allowed',
                  )}
                  aria-disabled={disabled}
                >
                  <span>
                    <span className="block text-[0.65rem] uppercase tracking-fgc-cap text-fgc-cream/60">
                      {slot.period}
                    </span>
                    <span className="font-semibold">{slot.label}</span>
                  </span>
                  {!slot.available && selectedDate && (
                    <span className="text-xs text-fgc-cream/40">Réservé</span>
                  )}
                  {isSel && <span aria-hidden>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className={buttonVariants({ variant: 'ghost' })}
        >
          ‹ Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className={buttonVariants({ variant: 'primary' })}
        >
          L’enfant ›
        </button>
      </div>
    </div>
  );
}

// Fallback côté client si l'API ne répond pas — mêmes valeurs que data.jsx + API.
const TIME_SLOTS: { value: string; label: string; period: string }[] = [
  { value: '10:00', label: '10h00 – 12h00', period: 'Matin' },
  { value: '14:00', label: '14h00 – 16h00', period: 'Après-midi' },
  { value: '14:30', label: '14h30 – 16h30', period: 'Après-midi' },
  { value: '16:00', label: '16h00 – 18h00', period: 'Après-midi' },
  { value: '16:30', label: '16h30 – 18h30', period: 'Goûter' },
  { value: '17:00', label: '17h00 – 19h00', period: 'Goûter' },
];
