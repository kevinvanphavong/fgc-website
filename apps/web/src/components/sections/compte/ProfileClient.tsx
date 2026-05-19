'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useClient,
  useChangePassword,
  useDeleteMe,
  ClientApiError,
  type ClientUser,
} from '@/lib/use-client';
import ProfileInfoForm from './ProfileInfoForm';

interface Props {
  initialUser: ClientUser;
}

function initials(user: ClientUser): string {
  const fn = user.firstName?.[0] ?? '';
  const ln = user.lastName?.[0] ?? '';
  const v = `${fn}${ln}`.toUpperCase();
  return v || user.email[0]?.toUpperCase() || '?';
}

function formatMemberSince(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
}

export default function ProfileClient({ initialUser }: Props) {
  const { user: liveUser } = useClient();
  const user = liveUser ?? initialUser;
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [delModalOpen, setDelModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Header carte avatar */}
      <section className="rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-6 md:p-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-fgc-yellow/40 font-display text-2xl text-fgc-purple shadow-fgc-3d-yellow-sm"
            style={{ background: 'linear-gradient(135deg, #ffd93d, #ff2d87)' }}
            aria-hidden="true"
          >
            {initials(user)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="font-display text-[1.4rem] uppercase text-fgc-cream">
              {user.fullName}
            </div>
            <div className="text-[0.95rem] text-fgc-cream/75">{user.email}</div>
            {user.createdAt && (
              <div className="mt-1 text-[0.85rem] text-fgc-cream/60">
                Membre depuis {formatMemberSince(user.createdAt)}
              </div>
            )}
          </div>
        </div>
      </section>

      <ProfileInfoForm user={user} />

      {/* Mot de passe */}
      <section className="rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-[1.1rem] uppercase tracking-fgc-cap text-fgc-yellow">
              Mot de passe
            </h2>
            <p className="text-[0.9rem] text-fgc-cream/70">
              Pour des raisons de sécurité, vous devrez ressaisir votre mot de passe actuel.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPwdModalOpen(true)}
            className="rounded-full border-2 border-fgc-yellow-shadow bg-fgc-yellow px-5 py-2.5 font-display text-[0.9rem] uppercase text-fgc-purple shadow-fgc-btn-yellow transition-transform hover:-translate-y-0.5 active:translate-y-px"
          >
            Modifier
          </button>
        </div>
      </section>

      {/* Compte / suppression */}
      <section className="rounded-fgc-lg border border-fgc-pink-hot/30 bg-fgc-card p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-[1.1rem] uppercase tracking-fgc-cap text-fgc-pink-hot">
              Supprimer mon compte
            </h2>
            <p className="text-[0.9rem] text-fgc-cream/70">
              Vos réservations seront conservées de façon anonymisée pour notre gestion interne.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDelModalOpen(true)}
            className="rounded-full border border-fgc-pink-hot/60 px-5 py-2.5 font-display text-[0.9rem] uppercase text-fgc-pink-hot transition-colors hover:bg-fgc-pink-hot/10"
          >
            Supprimer
          </button>
        </div>
      </section>

      {pwdModalOpen && <ChangePasswordModal onClose={() => setPwdModalOpen(false)} />}
      {delModalOpen && <DeleteAccountModal onClose={() => setDelModalOpen(false)} />}
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const mutation = useChangePassword();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (next.length < 10 || !/[A-Z]/.test(next) || !/[0-9]/.test(next)) {
      setError('Mot de passe : 10 caractères, une majuscule, un chiffre minimum.');
      return;
    }
    try {
      await mutation.mutateAsync({ currentPassword: current, newPassword: next });
      setDone(true);
    } catch (err) {
      if (err instanceof ClientApiError) {
        const body = err.body as { violations?: { message: string }[] } | null;
        setError(body?.violations?.[0]?.message ?? 'Modification impossible.');
      } else {
        setError('Erreur inattendue.');
      }
    }
  }

  return (
    <Modal onClose={onClose} title="Changer mon mot de passe">
      {done ? (
        <div className="text-center">
          <div className="mb-3 text-4xl">✅</div>
          <p className="text-fgc-cream">Mot de passe mis à jour.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 font-display text-[0.85rem] uppercase tracking-fgc-cap text-fgc-yellow hover:underline"
          >
            Fermer
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <FieldPwd label="Mot de passe actuel" value={current} onChange={setCurrent} autoComplete="current-password" />
          <FieldPwd label="Nouveau mot de passe" value={next} onChange={setNext} autoComplete="new-password" />
          <FieldPwd label="Confirmer le nouveau mot de passe" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          {error && (
            <div className="rounded-xl border border-fgc-pink-hot/40 bg-fgc-pink-hot/10 px-4 py-3 text-[0.9rem] text-fgc-cream">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="font-display text-[0.85rem] uppercase tracking-fgc-cap text-fgc-cream/70 hover:text-fgc-cream">
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-full border-2 border-fgc-yellow-shadow bg-fgc-yellow px-5 py-2.5 font-display text-[0.9rem] uppercase text-fgc-purple shadow-fgc-btn-yellow transition-transform hover:-translate-y-0.5 active:translate-y-px disabled:opacity-70"
            >
              {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function FieldPwd({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-display text-[0.78rem] uppercase tracking-wider text-fgc-cream/70">
        {label}
      </label>
      <input
        type="password"
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-fgc-cream outline-none transition-colors focus:border-fgc-yellow/50"
      />
    </div>
  );
}

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const del = useDeleteMe();
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (confirmText.trim().toUpperCase() !== 'SUPPRIMER') {
      setError('Tapez SUPPRIMER pour confirmer.');
      return;
    }
    try {
      await del.mutateAsync();
      await fetch('/api/client/logout', { method: 'POST' });
      router.refresh();
      router.push('/');
    } catch {
      setError('Suppression impossible. Réessayez plus tard.');
    }
  }

  return (
    <Modal onClose={onClose} title="Supprimer mon compte">
      <div className="space-y-4">
        <p className="text-[0.95rem] text-fgc-cream/85">
          Vos informations personnelles seront effacées de votre compte (prénom, nom, email, téléphone).
          <br />
          <strong className="text-fgc-yellow">Vos réservations seront conservées de façon anonymisée</strong> pour notre gestion interne (comptabilité, traçabilité).
        </p>
        <p className="text-[0.9rem] text-fgc-cream/70">
          Tapez <strong className="text-fgc-pink-hot">SUPPRIMER</strong> pour confirmer.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-fgc-cream outline-none transition-colors focus:border-fgc-pink-hot/50"
        />
        {error && (
          <div className="rounded-xl border border-fgc-pink-hot/40 bg-fgc-pink-hot/10 px-4 py-3 text-[0.9rem] text-fgc-cream">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="font-display text-[0.85rem] uppercase tracking-fgc-cap text-fgc-cream/70 hover:text-fgc-cream">
            Annuler
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={del.isPending}
            className="rounded-full border-2 border-fgc-pink-shadow bg-fgc-pink-hot px-5 py-2.5 font-display text-[0.9rem] uppercase text-white shadow-fgc-btn-pink transition-transform hover:-translate-y-0.5 active:translate-y-px disabled:opacity-70"
          >
            {del.isPending ? 'Suppression…' : 'Confirmer'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-fgc-bg-deeper/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[480px] rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-6 shadow-fgc-soft md:p-8">
        <h3 className="mb-4 font-display text-[1.15rem] uppercase tracking-fgc-cap text-fgc-yellow">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
