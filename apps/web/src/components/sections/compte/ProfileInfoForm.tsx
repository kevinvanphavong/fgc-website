'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateMe, ClientApiError, type ClientUser } from '@/lib/use-client';

const PHONE_REGEX = /^(?:(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4})$/;

const schema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(80),
  lastName: z.string().trim().min(1, 'Nom requis').max(80),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || PHONE_REGEX.test(v), 'Numéro de téléphone français attendu.'),
  acceptNewsletter: z.boolean(),
});
type Values = z.infer<typeof schema>;

interface Violation {
  propertyPath: string;
  message: string;
}

interface Props {
  user: ClientUser;
}

/**
 * Section "Mes informations" du profil — RHF + Zod + autosave on-change.
 *
 * Pas de bouton submit : à chaque changement valide d'un champ dirty, on
 * débounce 800ms puis on PATCH /api/me. Pattern "form sans submit" idiomatique :
 *   - watch() donne les valeurs en temps réel
 *   - dirtyFields filtre ce qui a vraiment changé (PATCH minimaliste)
 *   - zodResolver bloque le save si la validation client échoue (regex phone)
 *   - setError remplit les erreurs serveur (violations) par champ
 */
export default function ProfileInfoForm({ user }: Props) {
  const update = useUpdateMe();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors, isValid, dirtyFields },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
      acceptNewsletter: user.acceptNewsletter,
    },
  });

  // Si le user upstream change (refetch après login), reset le form.
  useEffect(() => {
    reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
      acceptNewsletter: user.acceptNewsletter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.firstName, user.lastName, user.phone, user.acceptNewsletter]);

  // Autosave : debounce 800ms à chaque watch tick, seulement si form valide
  // et au moins un champ dirty.
  const values = watch();
  useEffect(() => {
    const hasDirty =
      dirtyFields.firstName || dirtyFields.lastName || dirtyFields.phone || dirtyFields.acceptNewsletter;
    if (!hasDirty || !isValid) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // Construit le patch minimaliste : uniquement les dirty.
      const patch: Partial<Pick<ClientUser, 'firstName' | 'lastName' | 'phone' | 'acceptNewsletter'>> = {};
      if (dirtyFields.firstName) patch.firstName = values.firstName.trim();
      if (dirtyFields.lastName) patch.lastName = values.lastName.trim();
      if (dirtyFields.phone) patch.phone = values.phone ? values.phone.trim() : null;
      if (dirtyFields.acceptNewsletter) patch.acceptNewsletter = values.acceptNewsletter;

      try {
        clearErrors();
        await update.mutateAsync(patch);
        setSavedAt(Date.now());
      } catch (err) {
        if (err instanceof ClientApiError) {
          const body = err.body as { violations?: Violation[] } | null;
          body?.violations?.forEach((v) => {
            setError(v.propertyPath as keyof Values, { message: v.message });
          });
        }
      }
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // values est l'objet ré-instancié à chaque tick — on dépend de ses primitives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.firstName, values.lastName, values.phone, values.acceptNewsletter, isValid]);

  return (
    <section className="rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-6 md:p-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 className="font-display text-[1.1rem] uppercase tracking-fgc-cap text-fgc-yellow">
          Mes informations
        </h2>
        {update.isPending ? (
          <span className="text-[0.78rem] text-fgc-cream/55">Enregistrement…</span>
        ) : savedAt ? (
          <span className="text-[0.78rem] text-fgc-yellow/80">✓ Enregistré</span>
        ) : null}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Prénom" error={errors.firstName?.message}>
          <input
            {...register('firstName')}
            type="text"
            autoComplete="given-name"
            className={inputClass(!!errors.firstName)}
          />
        </Field>
        <Field label="Nom" error={errors.lastName?.message}>
          <input
            {...register('lastName')}
            type="text"
            autoComplete="family-name"
            className={inputClass(!!errors.lastName)}
          />
        </Field>
        <Field label="Téléphone" error={errors.phone?.message}>
          <input
            {...register('phone')}
            type="tel"
            autoComplete="tel"
            placeholder="06 …"
            className={inputClass(!!errors.phone)}
          />
        </Field>
        <Field label="Email (non éditable V1)">
          <input
            type="text"
            value={user.email}
            readOnly
            className={`${inputClass(false)} cursor-not-allowed text-fgc-cream/60`}
          />
        </Field>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 text-[0.9rem] text-fgc-cream/85">
        <input
          {...register('acceptNewsletter')}
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10 accent-fgc-yellow"
        />
        <span>Recevoir les bons plans Family Games Center par email.</span>
      </label>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-display text-[0.78rem] uppercase tracking-wider text-fgc-cream/70">
        {label}
      </label>
      {children}
      {error && <span className="text-[0.78rem] text-fgc-pink-hot">{error}</span>}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  const base =
    'rounded-xl border bg-white/[0.06] px-4 py-3 text-fgc-cream outline-none transition-colors focus:border-fgc-yellow/50';
  return hasError ? `${base} border-fgc-pink-hot/60` : `${base} border-white/15`;
}
