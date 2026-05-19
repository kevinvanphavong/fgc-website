'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginClient, ClientApiError } from '@/lib/use-client';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
type Values = z.infer<typeof schema>;

export default function LoginClientForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') ?? '/compte';
  const login = useLoginClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values: Values) => {
    try {
      await login.mutateAsync(values);
      router.refresh();
      router.push(next);
    } catch (err) {
      if (err instanceof ClientApiError) {
        const body = err.body as { error?: string } | null;
        setError('root', { message: body?.error ?? 'Connexion impossible.' });
      } else {
        setError('root', { message: 'Erreur inattendue.' });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-8"
    >
      <div className="flex flex-col gap-5">
        <Field label="Email" error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.fr"
            className={inputClass(!!errors.email)}
          />
        </Field>
        <Field label="Mot de passe" error={errors.password?.message}>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            className={inputClass(!!errors.password)}
          />
        </Field>
        {errors.root && (
          <div className="rounded-xl border border-fgc-pink-hot/40 bg-fgc-pink-hot/10 px-4 py-3 text-[0.9rem] text-fgc-cream">
            {errors.root.message}
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-fgc-yellow-shadow bg-fgc-yellow px-6 py-3.5 font-display text-[1rem] uppercase text-fgc-purple shadow-fgc-btn-yellow transition-transform hover:-translate-y-0.5 active:translate-y-px disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </div>
      <div className="mt-6 flex flex-col gap-2 text-center text-[0.9rem] text-fgc-cream/80">
        <Link href="/mot-de-passe-oublie" className="text-fgc-yellow hover:underline">
          Mot de passe oublié ?
        </Link>
        <div>
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="text-fgc-pink-hot hover:underline">
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </form>
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
      <label className="font-display text-[0.82rem] uppercase tracking-wider text-fgc-cream/70">
        {label}
      </label>
      {children}
      {error && <span className="text-[0.8rem] text-fgc-pink-hot">{error}</span>}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  const base =
    'rounded-xl border bg-white/[0.06] px-4 py-3 text-fgc-cream outline-none transition-colors focus:border-fgc-yellow/50';
  return hasError ? `${base} border-fgc-pink-hot/60` : `${base} border-white/15`;
}
