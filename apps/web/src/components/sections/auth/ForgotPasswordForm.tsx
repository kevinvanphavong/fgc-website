'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForgotPassword } from '@/lib/use-client';

const schema = z.object({ email: z.string().email('Email invalide') });
type Values = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const forgot = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async (values: Values) => {
    await forgot.mutateAsync(values.email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-8 text-center">
        <div className="mb-3 text-5xl">📧</div>
        <h3 className="font-display text-[1.3rem] uppercase text-fgc-yellow">
          Vérifiez votre boîte mail
        </h3>
        <p className="mt-3 text-[1rem] text-fgc-cream/85">
          Si un compte est associé à cet email, vous recevrez un lien de réinitialisation dans les prochaines minutes. Pensez à vérifier vos spams.
        </p>
        <Link
          href="/connexion"
          className="mt-6 inline-block font-display text-[0.85rem] uppercase tracking-fgc-cap text-fgc-yellow hover:underline"
        >
          ← Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-8 flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <label className="font-display text-[0.82rem] uppercase tracking-wider text-fgc-cream/70">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.fr"
          className={`rounded-xl border bg-white/[0.06] px-4 py-3 text-fgc-cream outline-none transition-colors focus:border-fgc-yellow/50 ${
            errors.email ? 'border-fgc-pink-hot/60' : 'border-white/15'
          }`}
        />
        {errors.email && <span className="text-[0.8rem] text-fgc-pink-hot">{errors.email.message}</span>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-fgc-yellow-shadow bg-fgc-yellow px-6 py-3.5 font-display text-[1rem] uppercase text-fgc-purple shadow-fgc-btn-yellow transition-transform hover:-translate-y-0.5 active:translate-y-px disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? 'Envoi…' : 'Envoyer le lien'}
      </button>
      <div className="text-center text-[0.85rem] text-fgc-cream/75">
        <Link href="/connexion" className="text-fgc-yellow hover:underline">
          ← Retour à la connexion
        </Link>
      </div>
    </form>
  );
}
