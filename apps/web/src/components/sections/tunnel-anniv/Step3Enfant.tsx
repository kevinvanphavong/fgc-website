'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/Button';
import type { AnnivFormule, TunnelDraft } from './types';

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €';
}

interface Step3Props {
  formules: AnnivFormule[];
  draft: TunnelDraft;
  update: (patch: Partial<TunnelDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface FieldErrors {
  childName?: string;
  childAge?: string;
  kidsCount?: string;
}

export default function Step3Enfant({ formules, draft, update, onNext, onBack }: Step3Props) {
  const formule = formules.find((f) => f.key === draft.formuleKey);
  const minKids = formule?.minKids ?? 6;
  const [errors, setErrors] = useState<FieldErrors>({});

  function setField<K extends keyof TunnelDraft>(k: K, v: TunnelDraft[K]) {
    update({ [k]: v } as Partial<TunnelDraft>);
    if (errors[k as keyof FieldErrors]) {
      setErrors((e) => ({ ...e, [k]: undefined }));
    }
  }

  function validate(): boolean {
    const e: FieldErrors = {};
    if (!draft.childName.trim()) e.childName = 'Prénom requis';
    if (!draft.childAge) e.childAge = 'Indiquez l’âge';
    else if (draft.childAge < 4 || draft.childAge > 14) e.childAge = 'Entre 4 et 14 ans';
    if (!draft.kidsCount) e.kidsCount = 'Indiquez le nombre d’enfants';
    else if (draft.kidsCount < minKids) e.kidsCount = `Minimum ${minKids} pour cette formule`;
    else if (draft.kidsCount > 25) e.kidsCount = 'Max 25 (au-delà, contactez-nous)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  const totalCents = useMemo(() => {
    if (!formule || !draft.kidsCount) return null;
    return formule.unitPriceCents * draft.kidsCount;
  }, [formule, draft.kidsCount]);

  // Upsell VR : visible uniquement quand newbowler|superbowler.
  const canUpsell = draft.formuleKey === 'newbowler' || draft.formuleKey === 'superbowler';
  const probowler = formules.find((f) => f.key === 'probowler');
  const upsellDeltaCentsPerKid = probowler && formule
    ? probowler.unitPriceCents - formule.unitPriceCents
    : 0;

  function toggleUpsell(on: boolean) {
    if (on && canUpsell && probowler) {
      // Passe à Pro Bowler.
      update({ upsellVR: true, formuleKey: 'probowler' });
    } else if (!on) {
      // Revient sur la formule précédemment choisie — ici on devine,
      // l'utilisateur a peut-être déjà fait des allers-retours. Default = superbowler.
      update({ upsellVR: false, formuleKey: 'superbowler' });
    }
  }

  return (
    <div className="animate-fgc-rsv-fwd">
      <header className="mb-8 text-center">
        <span className="text-[0.85rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
          Étape 3 · Le héros du jour
        </span>
        <h2 className="mt-2 font-display text-3xl md:text-4xl text-fgc-cream">
          Parlez-nous <span className="text-fgc-yellow">de l’enfant.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-fgc-lead text-fgc-cream/80">
          Quelques détails pour personnaliser la fête — gâteau, déco, médaille.
        </p>
      </header>

      <div className="rounded-fgc-rsv border border-fgc-purple/60 bg-fgc-card p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Prénom de l'enfant" error={errors.childName} htmlFor="child-name">
            <input
              id="child-name"
              type="text"
              placeholder="Léo, Camille, Inès…"
              value={draft.childName}
              onChange={(e) => setField('childName', e.target.value)}
              aria-invalid={!!errors.childName}
              className={inputClasses(!!errors.childName)}
            />
          </Field>

          <Field label="Âge fêté" error={errors.childAge}>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Âge">
              {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((a) => (
                <button
                  type="button"
                  key={a}
                  role="radio"
                  aria-checked={draft.childAge === a}
                  onClick={() => setField('childAge', a)}
                  className={cn(
                    'flex flex-col items-center rounded-fgc-sm border px-3 py-1.5 text-sm transition',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-fgc-yellow',
                    draft.childAge === a
                      ? 'border-fgc-yellow bg-fgc-yellow/15 text-fgc-yellow font-bold'
                      : 'border-fgc-cream/15 text-fgc-cream hover:border-fgc-cream/40',
                  )}
                >
                  {a}
                  <span className="text-[0.6rem] uppercase tracking-fgc-cap opacity-70">ans</span>
                </button>
              ))}
            </div>
          </Field>

          <Field
            label="Nombre d'enfants (héros inclus)"
            error={errors.kidsCount}
            hint={`Min ${minKids} pour la formule ${formule?.name ?? ''}. L’enfant qui fête est compté dedans.`}
          >
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setField('kidsCount', Math.max(minKids, (draft.kidsCount ?? minKids) - 1))
                }
                className="grid h-10 w-10 place-items-center rounded-fgc-sm border border-fgc-cream/20 text-fgc-cream transition hover:bg-fgc-cream/10"
                aria-label="Réduire"
              >−</button>
              <input
                type="number"
                min={minKids}
                max={25}
                value={draft.kidsCount ?? ''}
                placeholder={String(minKids)}
                onChange={(e) => {
                  const v = e.target.value;
                  setField('kidsCount', v === '' ? null : parseInt(v, 10));
                }}
                aria-invalid={!!errors.kidsCount}
                className={cn(inputClasses(!!errors.kidsCount), 'w-20 text-center')}
              />
              <button
                type="button"
                onClick={() =>
                  setField('kidsCount', Math.min(25, (draft.kidsCount ?? minKids) + 1))
                }
                className="grid h-10 w-10 place-items-center rounded-fgc-sm border border-fgc-cream/20 text-fgc-cream transition hover:bg-fgc-cream/10"
                aria-label="Augmenter"
              >+</button>
            </div>
          </Field>

          <Field label="Souhait gâteau (optionnel)" htmlFor="cake-note">
            <input
              id="cake-note"
              type="text"
              placeholder="Ex : thème Pokémon, sans gluten…"
              value={draft.cakeNote}
              maxLength={300}
              onChange={(e) => setField('cakeNote', e.target.value)}
              className={inputClasses(false)}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Allergies / régimes (optionnel)" htmlFor="allergies">
              <input
                id="allergies"
                type="text"
                placeholder="Ex : allergie cacahuète, intolérance lactose…"
                value={draft.allergies}
                maxLength={300}
                onChange={(e) => setField('allergies', e.target.value)}
                className={inputClasses(false)}
              />
            </Field>
          </div>
        </div>

        {totalCents !== null && (
          <div className="mt-6 flex items-center justify-between rounded-fgc-card-soft border border-fgc-yellow/30 bg-fgc-yellow/5 p-4">
            <div>
              <div className="font-semibold text-fgc-cream">
                Estimation pour {draft.kidsCount} enfants
              </div>
              <div className="text-xs text-fgc-cream/70">
                Formule {formule?.name} · {formule?.price}
              </div>
            </div>
            <div className="font-display text-2xl text-fgc-yellow">
              {formatPrice(totalCents)}
            </div>
          </div>
        )}

        {canUpsell && probowler && (
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-fgc-card-soft border border-fgc-pink-hot/30 bg-fgc-pink-hot/5 p-4">
            <input
              type="checkbox"
              checked={draft.upsellVR}
              onChange={(e) => toggleUpsell(e.target.checked)}
              className="mt-1 h-4 w-4 accent-fgc-pink-hot"
            />
            <div className="flex-1">
              <div className="font-semibold text-fgc-pink-hot">
                🥽 Ajouter la Réalité Virtuelle
                {upsellDeltaCentsPerKid > 0 && (
                  <span className="ml-2 text-fgc-cream/80">
                    +{formatPrice(upsellDeltaCentsPerKid)}/enfant
                  </span>
                )}
              </div>
              <div className="text-xs text-fgc-cream/75">
                Passe en formule <strong>Pro Bowler 💎</strong> — salle VR dédiée
                + agent référent. Re-décoche pour revenir à la formule de départ.
              </div>
            </div>
          </label>
        )}
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
          onClick={handleNext}
          disabled={!draft.childName || !draft.childAge || !draft.kidsCount}
          className={buttonVariants({ variant: 'primary' })}
        >
          Vos coordonnées ›
        </button>
      </div>
    </div>
  );
}

function inputClasses(hasError: boolean): string {
  return cn(
    'w-full rounded-fgc-field border bg-fgc-bg/40 px-4 py-2.5 text-sm text-fgc-cream placeholder:text-fgc-cream/40 transition',
    'focus:outline-none focus:border-fgc-yellow focus:ring-2 focus:ring-fgc-yellow/30',
    hasError
      ? 'border-fgc-pink-hot'
      : 'border-fgc-cream/15 hover:border-fgc-cream/30',
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}

function Field({ label, hint, error, htmlFor, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-fgc-cap text-fgc-cream/80"
      >
        {label}
      </label>
      {children}
      {error ? (
        <div className="mt-1 text-xs text-fgc-pink-hot">{error}</div>
      ) : hint ? (
        <div className="mt-1 text-xs text-fgc-cream/55">{hint}</div>
      ) : null}
    </div>
  );
}
