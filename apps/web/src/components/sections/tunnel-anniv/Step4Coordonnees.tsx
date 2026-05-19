'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/Button';
import { useClient } from '@/lib/use-client';
import type { TunnelDraft } from './types';

const PHONE_REGEX = /^(?:(?:\+33|0)\s?[67](?:\s?\d{2}){4})$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const SOURCES: { v: string; l: string }[] = [
  { v: '', l: '— Choisir —' },
  { v: 'amis', l: 'Bouche-à-oreille / amis' },
  { v: 'instagram', l: 'Instagram' },
  { v: 'facebook', l: 'Facebook' },
  { v: 'google', l: 'Recherche Google' },
  { v: 'passage', l: 'En passant devant' },
  { v: 'autre', l: 'Autre' },
];

interface FieldErrors {
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
  acceptCGV?: string;
}

interface Step4Props {
  draft: TunnelDraft;
  update: (patch: Partial<TunnelDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Coordonnees({ draft, update, onNext, onBack }: Step4Props) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const { user } = useClient();

  // Pré-remplissage si un client est connecté : on ne remplit que les champs
  // encore vides du draft pour ne pas écraser une saisie en cours.
  useEffect(() => {
    if (!user) return;
    const patch: Partial<TunnelDraft> = {};
    if (!draft.parentFirstName && user.firstName) patch.parentFirstName = user.firstName;
    if (!draft.parentLastName && user.lastName) patch.parentLastName = user.lastName;
    if (!draft.parentEmail && user.email) patch.parentEmail = user.email;
    if (!draft.parentPhone && user.phone) patch.parentPhone = user.phone;
    if (Object.keys(patch).length > 0) update(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function setField<K extends keyof TunnelDraft>(k: K, v: TunnelDraft[K]) {
    update({ [k]: v } as Partial<TunnelDraft>);
    if (errors[k as keyof FieldErrors]) {
      setErrors((e) => ({ ...e, [k]: undefined }));
    }
  }

  function validate(): boolean {
    const e: FieldErrors = {};
    if (!draft.parentFirstName.trim()) e.parentFirstName = 'Prénom requis';
    if (!draft.parentLastName.trim()) e.parentLastName = 'Nom requis';
    if (!draft.parentEmail.trim()) e.parentEmail = 'Email requis';
    else if (!EMAIL_REGEX.test(draft.parentEmail)) e.parentEmail = 'Email invalide';
    if (!draft.parentPhone.trim()) e.parentPhone = 'Téléphone requis';
    else if (!PHONE_REGEX.test(draft.parentPhone)) e.parentPhone = 'Mobile FR 06/07';
    if (!draft.acceptCGV) e.acceptCGV = 'Vous devez accepter les conditions';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  return (
    <div className="animate-fgc-rsv-fwd">
      <header className="mb-8 text-center">
        <span className="text-[0.85rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
          Étape 4 · Le parent organisateur
        </span>
        <h2 className="mt-2 font-display text-3xl md:text-4xl text-fgc-cream">
          Vos <span className="text-fgc-yellow">coordonnées.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-fgc-lead text-fgc-cream/80">
          On vous envoie la confirmation par email et on vous appelle pour
          valider la date.
        </p>
      </header>

      {user && (
        <div className="mb-5 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-[0.9rem] text-fgc-cream">
          ✓ Connecté en tant que <strong className="text-fgc-yellow">{user.firstName ?? user.email}</strong>.
          Vos infos sont pré-remplies.
        </div>
      )}
      <div className="rounded-fgc-rsv border border-fgc-purple/60 bg-fgc-card p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Prénom du parent" error={errors.parentFirstName} htmlFor="parent-fn">
            <input
              id="parent-fn"
              type="text"
              placeholder="Sophie"
              value={draft.parentFirstName}
              onChange={(e) => setField('parentFirstName', e.target.value)}
              aria-invalid={!!errors.parentFirstName}
              className={inputClasses(!!errors.parentFirstName)}
              autoComplete="given-name"
            />
          </Field>
          <Field label="Nom du parent" error={errors.parentLastName} htmlFor="parent-ln">
            <input
              id="parent-ln"
              type="text"
              placeholder="Martin"
              value={draft.parentLastName}
              onChange={(e) => setField('parentLastName', e.target.value)}
              aria-invalid={!!errors.parentLastName}
              className={inputClasses(!!errors.parentLastName)}
              autoComplete="family-name"
            />
          </Field>
          <Field label="Email" error={errors.parentEmail} htmlFor="parent-email">
            <input
              id="parent-email"
              type="email"
              placeholder="sophie@exemple.fr"
              value={draft.parentEmail}
              onChange={(e) => setField('parentEmail', e.target.value)}
              aria-invalid={!!errors.parentEmail}
              className={inputClasses(!!errors.parentEmail)}
              autoComplete="email"
            />
          </Field>
          <Field label="Téléphone mobile" error={errors.parentPhone} htmlFor="parent-phone">
            <input
              id="parent-phone"
              type="tel"
              placeholder="06 12 34 56 78"
              value={draft.parentPhone}
              onChange={(e) => setField('parentPhone', e.target.value)}
              aria-invalid={!!errors.parentPhone}
              className={inputClasses(!!errors.parentPhone)}
              autoComplete="tel"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Comment nous avez-vous connu ? (optionnel)" htmlFor="parent-source">
              <select
                id="parent-source"
                value={draft.source}
                onChange={(e) => setField('source', e.target.value)}
                className={inputClasses(false)}
              >
                {SOURCES.map((s) => (
                  <option key={s.v} value={s.v} className="bg-fgc-bg text-fgc-cream">
                    {s.l}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Message pour l'équipe (optionnel)" htmlFor="parent-msg">
              <textarea
                id="parent-msg"
                placeholder="Surprise à organiser, accessibilité, demande spéciale…"
                value={draft.message}
                maxLength={1000}
                onChange={(e) => setField('message', e.target.value)}
                className={cn(inputClasses(false), 'min-h-[88px] resize-y')}
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={draft.acceptCGV}
              onChange={(e) => setField('acceptCGV', e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-fgc-yellow"
              aria-invalid={!!errors.acceptCGV}
            />
            <span className="text-sm text-fgc-cream/90">
              J’accepte les{' '}
              <a
                href="/legal/cgv"
                target="_blank"
                rel="noreferrer"
                className="text-fgc-yellow underline decoration-dotted hover:text-fgc-yellow-deep"
              >
                conditions générales de vente
              </a>{' '}
              et la{' '}
              <a
                href="/legal/politique-confidentialite"
                target="_blank"
                rel="noreferrer"
                className="text-fgc-yellow underline decoration-dotted hover:text-fgc-yellow-deep"
              >
                politique de confidentialité
              </a>.
            </span>
          </label>
          {errors.acceptCGV && (
            <div className="pl-7 text-xs text-fgc-pink-hot">{errors.acceptCGV}</div>
          )}
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={draft.acceptNewsletter}
              onChange={(e) => setField('acceptNewsletter', e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-fgc-yellow"
            />
            <span className="text-sm text-fgc-cream/80">
              Je souhaite recevoir les bons plans Family Games Center par email
              (optionnel).
            </span>
          </label>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button type="button" onClick={onBack} className={buttonVariants({ variant: 'ghost' })}>
          ‹ Retour
        </button>
        <button
          type="button"
          onClick={handleNext}
          className={buttonVariants({ variant: 'primary' })}
        >
          Voir le récap ›
        </button>
      </div>
    </div>
  );
}

function inputClasses(hasError: boolean): string {
  return cn(
    'w-full rounded-fgc-field border bg-fgc-bg/40 px-4 py-2.5 text-sm text-fgc-cream placeholder:text-fgc-cream/40 transition',
    'focus:outline-none focus:border-fgc-yellow focus:ring-2 focus:ring-fgc-yellow/30',
    hasError ? 'border-fgc-pink-hot' : 'border-fgc-cream/15 hover:border-fgc-cream/30',
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-fgc-cap text-fgc-cream/80"
      >
        {label}
      </label>
      {children}
      {error && <div className="mt-1 text-xs text-fgc-pink-hot">{error}</div>}
    </div>
  );
}
