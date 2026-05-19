'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';

const SUBJECT_OPTIONS = [
  { value: 'anniv', label: 'Réservation anniversaire' },
  { value: 'b2b', label: 'Événement entreprise' },
  { value: 'tarifs', label: 'Tarifs / Groupes' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'autre', label: 'Autre' },
] as const;

type SubjectValue = (typeof SUBJECT_OPTIONS)[number]['value'];

const schema = z.object({
  name: z.string().min(1, 'Nom requis').max(120),
  email: z.string().email('Email invalide').max(180),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (v) => !v || /^(?:(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4})$/.test(v),
      'Numéro de téléphone français attendu.',
    ),
  subject: z.enum(SUBJECT_OPTIONS.map((s) => s.value) as [SubjectValue, ...SubjectValue[]]),
  message: z.string().min(10, '10 caractères minimum').max(2000),
  acceptRgpd: z.literal(true, {
    errorMap: () => ({ message: 'Le consentement RGPD est requis.' }),
  }),
});

type FormValues = z.infer<typeof schema>;

interface ApiViolation {
  propertyPath: string;
  message: string;
}

export default function ContactForm() {
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: 'autre',
      message: '',
      acceptRgpd: false as unknown as true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await api<{ reference: string }>('/contact', {
        method: 'POST',
        json: {
          ...values,
          phone: values.phone || null,
        },
      });
      setConfirmation(res.reference);
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
      setServerError((err as Error)?.message ?? 'Erreur inattendue.');
    }
  };

  if (confirmation) {
    return (
      <div className="mx-auto max-w-3xl rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-8 text-center md:p-12">
        <div className="mb-4 text-5xl">✅</div>
        <h3 className="mb-3 font-display text-[1.4rem] uppercase text-fgc-yellow">
          Message bien reçu
        </h3>
        <p className="mb-4 text-[1rem] leading-relaxed text-fgc-cream/85">
          Votre référence&nbsp;:{' '}
          <strong className="text-fgc-pink-hot">{confirmation}</strong>
        </p>
        <p className="text-[0.95rem] leading-relaxed text-fgc-cream/75">
          Notre équipe vous recontacte sous <strong>24h ouvrées</strong>.
        </p>
        <button
          type="button"
          onClick={() => setConfirmation(null)}
          className="mt-6 font-display text-[0.85rem] uppercase tracking-wider text-fgc-yellow underline-offset-4 hover:underline"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-8 md:p-10">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Votre nom" required error={errors.name?.message}>
            <input
              {...register('name')}
              type="text"
              placeholder="Prénom Nom"
              className={fieldClass(errors.name)}
            />
          </Field>
          <Field label="Email" required error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              placeholder="vous@example.fr"
              className={fieldClass(errors.email)}
            />
          </Field>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Téléphone (facultatif)" error={errors.phone?.message}>
            <input
              {...register('phone')}
              type="tel"
              placeholder="06 …"
              className={fieldClass(errors.phone)}
            />
          </Field>
          <Field label="Sujet" required error={errors.subject?.message}>
            <select {...register('subject')} className={fieldClass(errors.subject)}>
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value} className="bg-fgc-bg text-fgc-cream">
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Message" required error={errors.message?.message}>
          <textarea
            {...register('message')}
            placeholder="Votre message (minimum 10 caractères)…"
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
            J&apos;accepte que mes informations soient utilisées pour traiter ma demande (cf.{' '}
            <Link href="/legal/politique-confidentialite" className="underline hover:text-fgc-yellow">
              politique de confidentialité
            </Link>
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
          {isSubmitting ? 'Envoi…' : 'Envoyer'}
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
