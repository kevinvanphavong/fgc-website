'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegisterClient, ClientApiError } from '@/lib/use-client';

const schema = z.object({
  email: z.string().email('Email invalide').max(180),
  password: z
    .string()
    .min(10, 'Mot de passe : 10 caractères minimum.')
    .regex(/[A-Z]/, 'Au moins une majuscule.')
    .regex(/[0-9]/, 'Au moins un chiffre.'),
  firstName: z.string().min(1, 'Prénom requis').max(80),
  lastName: z.string().min(1, 'Nom requis').max(80),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (v) => !v || /^(?:(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4})$/.test(v),
      'Numéro de téléphone français attendu.',
    ),
  acceptRgpd: z.literal(true, {
    errorMap: () => ({ message: 'Le consentement RGPD est requis.' }),
  }),
  acceptNewsletter: z.boolean().default(false),
});
type Values = z.infer<typeof schema>;

interface Violation {
  propertyPath: string;
  message: string;
}

export default function RegisterClientForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') ?? '/compte';
  const register$ = useRegisterClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      acceptRgpd: false as unknown as true,
      acceptNewsletter: false,
    },
  });

  const onSubmit = async (values: Values) => {
    try {
      await register$.mutateAsync({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || null,
        acceptRgpd: values.acceptRgpd,
        acceptNewsletter: values.acceptNewsletter,
      });
      router.refresh();
      router.push(next);
    } catch (err) {
      if (err instanceof ClientApiError) {
        const body = err.body as { error?: string; violations?: Violation[] } | null;
        if (body?.violations?.length) {
          body.violations.forEach((v) => {
            setError(v.propertyPath as keyof Values, { message: v.message });
          });
          setError('root', { message: 'Merci de corriger les champs en rouge.' });
          return;
        }
        setError('root', { message: body?.error ?? 'Inscription impossible.' });
      } else {
        setError('root', { message: 'Erreur inattendue.' });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-8 flex flex-col gap-5"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Prénom" required error={errors.firstName?.message}>
          <input
            {...register('firstName')}
            type="text"
            autoComplete="given-name"
            className={inputClass(!!errors.firstName)}
          />
        </Field>
        <Field label="Nom" required error={errors.lastName?.message}>
          <input
            {...register('lastName')}
            type="text"
            autoComplete="family-name"
            className={inputClass(!!errors.lastName)}
          />
        </Field>
      </div>
      <Field label="Email" required error={errors.email?.message}>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          className={inputClass(!!errors.email)}
        />
      </Field>
      <Field
        label="Mot de passe"
        required
        error={errors.password?.message}
        hint="10 caractères minimum, une majuscule, un chiffre."
      >
        <input
          {...register('password')}
          type="password"
          autoComplete="new-password"
          className={inputClass(!!errors.password)}
        />
      </Field>
      <Field label="Téléphone (optionnel)" error={errors.phone?.message}>
        <input
          {...register('phone')}
          type="tel"
          autoComplete="tel"
          placeholder="06 …"
          className={inputClass(!!errors.phone)}
        />
      </Field>

      <label className="flex cursor-pointer items-start gap-3 text-[0.85rem] leading-relaxed text-fgc-cream/85">
        <input
          {...register('acceptRgpd')}
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10 accent-fgc-yellow"
        />
        <span>
          J&apos;accepte que mes informations soient utilisées pour gérer mon compte (cf.{' '}
          <Link
            href="/legal/politique-confidentialite"
            target="_blank"
            className="text-fgc-yellow underline decoration-dotted hover:text-fgc-yellow-deep"
          >
            politique de confidentialité
          </Link>
          ).
          {errors.acceptRgpd?.message && (
            <span className="mt-1 block text-fgc-pink-hot">{errors.acceptRgpd.message}</span>
          )}
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-3 text-[0.85rem] leading-relaxed text-fgc-cream/75">
        <input
          {...register('acceptNewsletter')}
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10 accent-fgc-yellow"
        />
        <span>Je souhaite recevoir les bons plans Family Games Center par email (optionnel).</span>
      </label>

      {errors.root && (
        <div className="rounded-xl border border-fgc-pink-hot/40 bg-fgc-pink-hot/10 px-4 py-3 text-[0.9rem] text-fgc-cream">
          {errors.root.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-fgc-pink-shadow bg-fgc-pink-hot px-6 py-3.5 font-display text-[1rem] uppercase text-white shadow-fgc-btn-pink transition-transform hover:-translate-y-0.5 active:translate-y-px disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? 'Création…' : 'Créer mon compte'}
      </button>
      <div className="text-center text-[0.85rem] text-fgc-cream/75">
        Déjà inscrit ?{' '}
        <Link href="/connexion" className="text-fgc-yellow hover:underline">
          Se connecter
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-display text-[0.82rem] uppercase tracking-wider text-fgc-cream/70">
        {label}
        {required && <span className="ml-1 text-fgc-pink-hot">*</span>}
      </label>
      {children}
      {hint && <span className="text-[0.78rem] text-fgc-cream/55">{hint}</span>}
      {error && <span className="text-[0.8rem] text-fgc-pink-hot">{error}</span>}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  const base =
    'rounded-xl border bg-white/[0.06] px-4 py-3 text-fgc-cream outline-none transition-colors focus:border-fgc-yellow/50';
  return hasError ? `${base} border-fgc-pink-hot/60` : `${base} border-white/15`;
}
