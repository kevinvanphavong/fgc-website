'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminButton from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';
import { cn } from '@/lib/cn';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/admin';

  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setServerError(body?.error ?? 'Erreur inattendue.');
      return;
    }

    startTransition(() => {
      router.push(next.startsWith('/admin') ? next : '/admin');
      router.refresh();
    });
  });

  const busy = isSubmitting || isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field
        label="Email"
        icon={<Icon icon={Mail} size={15} className="text-admin-text-muted" />}
        error={errors.email?.message}
      >
        <input
          type="email"
          autoComplete="email"
          autoFocus
          {...register('email')}
          className="w-full bg-transparent text-[0.9375rem] text-admin-text outline-none placeholder:text-admin-text-muted"
          placeholder="admin@familygamescenter.fr"
          disabled={busy}
        />
      </Field>

      <Field
        label="Mot de passe"
        icon={<Icon icon={Lock} size={15} className="text-admin-text-muted" />}
        error={errors.password?.message}
      >
        <input
          type="password"
          autoComplete="current-password"
          {...register('password')}
          className="w-full bg-transparent text-[0.9375rem] text-admin-text outline-none placeholder:text-admin-text-muted"
          placeholder="••••••••"
          disabled={busy}
        />
      </Field>

      {serverError ? (
        <div
          role="alert"
          className="rounded-md border border-admin-red/30 bg-admin-red-soft px-3 py-2 text-[0.8125rem] text-admin-red"
        >
          {serverError}
        </div>
      ) : null}

      <AdminButton
        type="submit"
        variant="primary"
        size="lg"
        disabled={busy}
        className="mt-2 w-full"
        iconLeft={
          busy ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined
        }
      >
        {busy ? 'Connexion…' : 'Se connecter'}
      </AdminButton>
    </form>
  );
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[0.75rem] font-medium text-admin-text-muted">
        {label}
      </div>
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-admin-bg-elev px-3 py-2.5 transition-colors focus-within:border-admin-brand',
          error ? 'border-admin-red/50' : 'border-admin-border'
        )}
      >
        {icon}
        {children}
      </div>
      {error ? (
        <div className="mt-1 text-[0.75rem] text-admin-red">{error}</div>
      ) : null}
    </label>
  );
}
