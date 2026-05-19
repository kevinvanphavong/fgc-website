'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';
import { useToast } from '@/components/admin/ui/Toast';
import {
  useUserInvite,
  USER_ROLES,
  USER_ROLE_META,
  AdminClientError,
  type UserRole,
} from '@/lib/admin-hooks/useUsers';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserInviteModal({ open, onClose }: Props) {
  const toast = useToast();
  const invite = useUserInvite();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('ROLE_STAFF');

  useEffect(() => {
    if (!open) {
      setEmail('');
      setFirstName('');
      setLastName('');
      setRole('ROLE_STAFF');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await invite.mutateAsync({ email, firstName, lastName, role });
      toast.success('Invitation envoyée', `${email} recevra un lien d'activation.`);
      onClose();
    } catch (err) {
      if (err instanceof AdminClientError) {
        const body = err.body as { error?: string } | null;
        toast.error("Échec de l'invitation", body?.error ?? `Erreur ${err.status}`);
      } else {
        toast.error("Échec de l'invitation", (err as Error)?.message ?? 'Erreur');
      }
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-lg bg-admin-bg-elev p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-admin-border pb-3">
          <h2 className="text-lg font-semibold text-admin-text">Inviter un utilisateur</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-admin-text-muted hover:bg-admin-bg-sunken"
            aria-label="Fermer"
          >
            <Icon icon={X} size={18} />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <Field label="Email" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring"
              placeholder="prenom.nom@familygamescenter.fr"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring"
              />
            </Field>
            <Field label="Nom">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring"
              />
            </Field>
          </div>
          <Field label="Rôle" required>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring"
            >
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {USER_ROLE_META[r].label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-admin-border bg-admin-bg-elev px-3 py-1.5 text-sm text-admin-text hover:bg-admin-bg-sunken"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!email || invite.isPending}
            className="rounded-md bg-admin-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-admin-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {invite.isPending ? 'Envoi…' : 'Inviter'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-admin-text-muted">
        {label}
        {required && <span className="ml-0.5 text-admin-pink">*</span>}
      </label>
      {children}
    </div>
  );
}
