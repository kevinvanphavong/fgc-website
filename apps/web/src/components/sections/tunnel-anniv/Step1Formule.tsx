'use client';

import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/Button';
import { FORMULE_TOKEN, type AnnivFormule, type TunnelDraft } from './types';

interface Step1Props {
  formules: AnnivFormule[];
  draft: TunnelDraft;
  onSelect: (key: AnnivFormule['key']) => void;
  onNext: () => void;
}

function priceLabel(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + '€';
}

export default function Step1Formule({ formules, draft, onSelect, onNext }: Step1Props) {
  const selected = draft.formuleKey;
  const sortedFormules = [...formules].sort((a, b) => a.position - b.position);

  return (
    <div className="animate-fgc-rsv-fwd">
      <header className="mb-8 text-center">
        <span className="text-[0.85rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
          Étape 1 · La formule
        </span>
        <h2 className="mt-2 font-display text-3xl md:text-4xl text-fgc-cream">
          Quel pack pour le <span className="text-fgc-yellow">grand jour ?</span>
        </h2>
        <p className="mx-auto mt-3 max-w-fgc-lead text-fgc-cream/80">
          Trois formules clés en main — à partir de 6 enfants. Les prix sont par
          enfant invité, l’enfant qui fête son anniversaire est offert.
        </p>
      </header>

      <ul className="grid gap-4 md:grid-cols-3" role="radiogroup" aria-label="Formule">
        {sortedFormules.map((f) => {
          const isSel = selected === f.key;
          const tok = FORMULE_TOKEN[f.key];
          return (
            <li key={f.key}>
              <button
                type="button"
                role="radio"
                aria-checked={isSel}
                onClick={() => onSelect(f.key)}
                className={cn(
                  'group relative flex h-full w-full flex-col gap-3 rounded-fgc-rsv border-2 bg-fgc-card p-6 text-left transition',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-fgc-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-fgc-bg',
                  isSel
                    ? `${tok.ring} shadow-fgc-card-hover`
                    : 'border-fgc-purple/60 hover:border-fgc-cream/30',
                )}
              >
                {f.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-fgc-yellow px-3 py-1 text-xs font-bold uppercase tracking-fgc-cap text-fgc-bg shadow-fgc-yellow">
                    ★ Le plus populaire
                  </span>
                )}
                <span
                  className={cn(
                    'inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-fgc-cap',
                    tok.chipBg,
                    tok.chipText,
                  )}
                >
                  {f.icon} {f.name}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-4xl text-fgc-cream">
                    {priceLabel(f.unitPriceCents).replace('€', '')}
                  </span>
                  <span className={cn('font-display text-2xl', tok.chipText)}>€</span>
                  <span className="text-sm text-fgc-cream/70">/enfant</span>
                </div>
                <p className="text-sm text-fgc-cream/80 italic">{f.tagline}</p>
                <p className="text-xs text-fgc-cream/60">
                  ⏱️ {f.duration} · dès {f.minKids} enfants · âge {f.age}
                </p>
                <ul className="mt-1 space-y-1.5 text-sm text-fgc-cream/85">
                  {f.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={cn('mt-0.5', tok.chipText)} aria-hidden>•</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                {isSel && (
                  <span
                    className={cn(
                      'absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full text-sm font-bold',
                      tok.icon,
                    )}
                    aria-hidden
                  >
                    ✓
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-start gap-3 rounded-fgc-card-soft border border-fgc-cyan/30 bg-fgc-cyan/5 p-4 text-sm text-fgc-cream/90">
        <span aria-hidden className="text-xl">📞</span>
        <p>
          <strong className="text-fgc-cyan">Aucun paiement en ligne.</strong>{' '}
          On vous rappelle sous 24h pour bloquer la date et organiser l’acompte
          de 50&nbsp;€ (sur place ou virement). Annulation gratuite jusqu’à
          7&nbsp;jours avant.
        </p>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className={buttonVariants({ variant: 'primary' })}
        >
          Choisir la date ›
        </button>
      </div>
    </div>
  );
}
