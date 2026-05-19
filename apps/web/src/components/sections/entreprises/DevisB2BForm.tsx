'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api';
import { useClient } from '@/lib/use-client';

const TYPE_OPTIONS = [
  { value: 'team_building', label: 'Team Building' },
  { value: 'arbre_noel', label: 'Arbre de Noël' },
  { value: 'seminaire', label: 'Séminaire' },
  { value: 'soiree', label: 'Soirée client' },
  { value: 'autre', label: 'Autre' },
] as const;

type TypeValue = (typeof TYPE_OPTIONS)[number]['value'];

const minDateIso = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
};

const schema = z
  .object({
    companyName: z.string().min(1, 'Entreprise requise').max(120),
    contactFirstName: z.string().min(1, 'Prénom requis').max(80),
    contactLastName: z.string().min(1, 'Nom requis').max(80),
    contactEmail: z.string().email('Email invalide').max(180),
    contactPhone: z
      .string()
      .min(1, 'Téléphone requis')
      .regex(
        /^(?:(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4})$/,
        'Numéro de téléphone français attendu.',
      ),
    type: z.enum(TYPE_OPTIONS.map((t) => t.value) as [TypeValue, ...TypeValue[]]),
    expectedAttendees: z.coerce.number().min(10, 'Minimum 10 participants').max(300, 'Maximum 300 participants'),
    eventDate: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (v) => !v || v >= minDateIso(),
        `Date possible à partir du ${minDateIso().split('-').reverse().join('/')} (J+14 minimum).`,
      ),
    message: z.string().max(2000).optional().or(z.literal('')),
    acceptRgpd: z.literal(true, {
      errorMap: () => ({ message: 'Le consentement RGPD est requis.' }),
    }),
  });

type FormValues = z.infer<typeof schema>;

interface ConfirmationState {
  reference: string;
}

interface ApiViolation {
  propertyPath: string;
  message: string;
}

export default function DevisB2BForm() {
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { user } = useClient();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: '',
      contactFirstName: '',
      contactLastName: '',
      contactEmail: '',
      contactPhone: '',
      type: 'team_building',
      expectedAttendees: 10,
      eventDate: '',
      message: '',
      acceptRgpd: false as unknown as true,
    },
  });

  // Pré-remplit les coordonnées contact quand un client est connecté.
  useEffect(() => {
    if (!user) return;
    if (user.firstName) setValue('contactFirstName', user.firstName);
    if (user.lastName) setValue('contactLastName', user.lastName);
    if (user.email) setValue('contactEmail', user.email);
    if (user.phone) setValue('contactPhone', user.phone);
  }, [user, setValue]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      // Si user client connecté → POST via le proxy Next (qui injecte le JWT)
      // afin que le backend stamp `B2BRequest.userId`. Sinon, POST anonyme direct.
      const payload = {
        ...values,
        eventDate: values.eventDate || null,
        message: values.message || null,
      };
      let res: { reference: string };
      if (user) {
        const r = await fetch('/api/client/proxy/entreprises/devis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/ld+json', Accept: 'application/ld+json,application/json' },
          body: JSON.stringify(payload),
        });
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new ApiError(r.status, body);
        res = body;
      } else {
        res = await api<{ reference: string }>('/entreprises/devis', {
          method: 'POST',
          json: payload,
        });
      }
      setConfirmation({ reference: res.reference });
      reset();
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as
          | { violations?: ApiViolation[]; detail?: string; 'hydra:description'?: string }
          | null;
        if (body?.violations?.length) {
          body.violations.forEach((v) => {
            setError(v.propertyPath as keyof FormValues, { message: v.message });
          });
          setServerError('Merci de corriger les champs en rouge.');
          return;
        }
        setServerError(body?.['hydra:description'] ?? body?.detail ?? `Erreur API ${err.status}`);
        return;
      }
      setServerError((err as Error)?.message ?? 'Erreur inattendue. Réessayez plus tard.');
    }
  };

  if (confirmation) {
    return (
      <div className="mx-auto max-w-3xl rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-8 text-center md:p-12">
        <div className="mb-4 text-5xl">✅</div>
        <h3 className="mb-3 font-display text-[1.4rem] uppercase text-fgc-yellow">
          Demande bien reçue
        </h3>
        <p className="mb-4 text-[1rem] leading-relaxed text-fgc-cream/85">
          Votre référence&nbsp;:{' '}
          <strong className="text-fgc-pink-hot">{confirmation.reference}</strong>
        </p>
        <p className="text-[0.95rem] leading-relaxed text-fgc-cream/75">
          Notre équipe événementielle vous recontacte sous <strong>48h ouvrées</strong> avec
          une proposition adaptée à votre projet.
        </p>
        <button
          type="button"
          onClick={() => setConfirmation(null)}
          className="mt-6 font-display text-[0.85rem] uppercase tracking-wider text-fgc-yellow underline-offset-4 hover:underline"
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-8 md:p-10">
      {user && (
        <div className="mb-6 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-[0.9rem] text-fgc-cream">
          ✓ Connecté en tant que <strong className="text-fgc-yellow">{user.firstName ?? user.email}</strong>.
          Vos infos sont pré-remplies.
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Entreprise" required error={errors.companyName?.message}>
            <input
              {...register('companyName')}
              type="text"
              placeholder="Nom de votre entreprise"
              className={fieldClass(errors.companyName)}
            />
          </Field>
          <Field label="Prénom du contact" required error={errors.contactFirstName?.message}>
            <input
              {...register('contactFirstName')}
              type="text"
              placeholder="Prénom"
              className={fieldClass(errors.contactFirstName)}
            />
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nom du contact" required error={errors.contactLastName?.message}>
            <input
              {...register('contactLastName')}
              type="text"
              placeholder="Nom"
              className={fieldClass(errors.contactLastName)}
            />
          </Field>
          <Field label="Email" required error={errors.contactEmail?.message}>
            <input
              {...register('contactEmail')}
              type="email"
              placeholder="vous@entreprise.fr"
              className={fieldClass(errors.contactEmail)}
            />
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Téléphone" required error={errors.contactPhone?.message}>
            <input
              {...register('contactPhone')}
              type="tel"
              placeholder="06 …"
              className={fieldClass(errors.contactPhone)}
            />
          </Field>
          <Field label="Type d'événement" required error={errors.type?.message}>
            <select
              {...register('type')}
              className={fieldClass(errors.type)}
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value} className="bg-fgc-bg text-fgc-cream">
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nombre de personnes" required error={errors.expectedAttendees?.message}>
            <input
              {...register('expectedAttendees', { valueAsNumber: true })}
              type="number"
              min={10}
              max={300}
              placeholder="10"
              className={fieldClass(errors.expectedAttendees)}
            />
          </Field>
          <Field label="Date souhaitée (optionnelle)" error={errors.eventDate?.message}>
            <input
              {...register('eventDate')}
              type="date"
              min={minDateIso()}
              className={fieldClass(errors.eventDate)}
            />
          </Field>
        </div>

        <Field label="Votre projet" error={errors.message?.message}>
          <textarea
            {...register('message')}
            placeholder="Décrivez-nous votre événement, vos envies, vos contraintes…"
            className={`min-h-[140px] resize-y ${fieldClass(errors.message)}`}
          />
        </Field>

        <label className="flex cursor-pointer items-start gap-3 text-[0.85rem] leading-relaxed text-fgc-cream/75">
          <input
            {...register('acceptRgpd')}
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10 accent-fgc-yellow"
          />
          <span>
            J&apos;accepte que les informations transmises soient utilisées pour traiter ma
            demande de devis (cf.{' '}
            <a
              href="/legal/politique-confidentialite"
              target="_blank"
              rel="noreferrer"
              className="text-fgc-yellow underline decoration-dotted hover:text-fgc-yellow-deep"
            >
              politique de confidentialité
            </a>
            ).
            {errors.acceptRgpd?.message && (
              <span className="mt-1 block text-fgc-pink-hot">{errors.acceptRgpd.message}</span>
            )}
          </span>
        </label>

        {serverError && (
          <div className="rounded-xl border border-fgc-pink-hot/40 bg-fgc-pink-hot/10 px-4 py-3 text-[0.9rem] text-fgc-cream">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-fgc-yellow-shadow bg-fgc-yellow px-6 py-3.5 font-display text-[1rem] uppercase leading-none text-fgc-purple shadow-fgc-btn-yellow transition-transform hover:-translate-y-0.5 active:translate-y-px disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-display text-[0.82rem] uppercase tracking-wider text-fgc-cream/70">
        {label}
        {required && <span className="ml-1 text-fgc-pink-hot">*</span>}
      </label>
      {children}
      {error && <span className="text-[0.8rem] text-fgc-pink-hot">{error}</span>}
    </div>
  );
}

function fieldClass(err?: { message?: string } | undefined): string {
  const base =
    'rounded-xl border bg-white/[0.06] px-4 py-3 text-fgc-cream outline-none transition-colors focus:border-fgc-yellow/50';
  return err ? `${base} border-fgc-pink-hot/60` : `${base} border-white/15`;
}
