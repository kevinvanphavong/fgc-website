'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

export default function SetupPasswordClient() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Lien invalide — token manquant.');
      return;
    }
    if (password.length < 8) {
      setError('Mot de passe trop court (8 caractères minimum).');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe doivent être identiques.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError((body && (body as { error?: string }).error) ?? 'Erreur serveur.');
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/admin/login'), 1500);
    } catch {
      setError('Impossible de joindre le serveur.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-xl border border-admin-border bg-admin-bg-elev p-8 text-center text-admin-text">
        <div className="mb-3 text-4xl">✅</div>
        <h1 className="text-lg font-semibold">Mot de passe défini</h1>
        <p className="mt-1 text-sm text-admin-text-muted">
          Redirection vers la page de connexion…
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-md rounded-xl border border-admin-border bg-admin-bg-elev p-8"
    >
      <h1 className="text-lg font-semibold text-admin-text">Activez votre compte</h1>
      <p className="mt-1 text-sm text-admin-text-muted">
        Choisissez un mot de passe pour finaliser votre accès au back-office.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <Field label="Nouveau mot de passe">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring"
          />
        </Field>
        <Field label="Confirmer">
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring"
          />
        </Field>
      </div>

      {error && (
        <div className="mt-3 rounded-md border border-admin-red/40 bg-admin-red-soft p-2.5 text-sm text-admin-red">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full rounded-md bg-admin-brand px-3 py-2 text-sm font-medium text-white hover:bg-admin-brand-deep disabled:opacity-60"
      >
        {submitting ? 'Validation…' : 'Activer mon compte'}
      </button>

      <p className="mt-3 text-center text-xs text-admin-text-muted">
        <Link href="/admin/login" className="hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-admin-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
