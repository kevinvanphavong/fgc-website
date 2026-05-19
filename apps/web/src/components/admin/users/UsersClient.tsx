'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';
import Avatar from '@/components/admin/ui/Avatar';
import Drawer from '@/components/admin/ui/Drawer';
import { useToast } from '@/components/admin/ui/Toast';
import UserInviteModal from './UserInviteModal';
import { cn } from '@/lib/cn';
import {
  useUsersList,
  useUserPatch,
  USER_ROLES,
  USER_ROLE_META,
  AdminClientError,
  type AdminUserRow,
  type UserRole,
} from '@/lib/admin-hooks/useUsers';

interface ClientProps {
  currentUserId: number;
}

export default function UsersClient({ currentUserId }: ClientProps) {
  const toast = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [drawerId, setDrawerId] = useState<number | null>(null);

  const { data: users = [], isLoading, isError } = useUsersList();
  const patch = useUserPatch();

  const drawerUser = drawerId ? users.find((u) => u.id === drawerId) ?? null : null;

  async function changeRole(u: AdminUserRow, role: UserRole) {
    if (role === u.role) return;
    try {
      await patch.mutateAsync({ id: u.id, body: { role } });
      toast.success(`Rôle de ${u.fullName} → ${USER_ROLE_META[role].label}`);
    } catch (err) {
      const msg = errorMessage(err);
      toast.error('Modification refusée', msg);
    }
  }

  async function toggleEnabled(u: AdminUserRow) {
    try {
      await patch.mutateAsync({ id: u.id, body: { enabled: !u.enabled } });
      toast.success(`${u.fullName} ${!u.enabled ? 'activé' : 'désactivé'}`);
    } catch (err) {
      const msg = errorMessage(err);
      toast.error('Modification refusée', msg);
    }
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-admin-text">Utilisateurs &amp; rôles</h1>
          <p className="mt-0.5 text-sm text-admin-text-muted">
            Gestion des comptes du back-office (ROLE_ADMIN uniquement).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-admin-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-admin-brand-deep"
        >
          <Icon icon={UserPlus} size={14} />
          Inviter un utilisateur
        </button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* Tableau */}
        <div>
          {isError && (
            <div className="rounded-md border border-admin-red/40 bg-admin-red-soft p-3 text-sm text-admin-red">
              Échec du chargement.
            </div>
          )}
          {isLoading ? (
            <div className="rounded-lg border border-admin-border bg-admin-bg-elev p-12 text-center text-sm text-admin-text-muted">
              Chargement…
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-bg-elev">
              <table className="min-w-full divide-y divide-admin-border-soft text-sm">
                <thead className="bg-admin-bg-sunken/50 text-admin-text-muted">
                  <tr>
                    <Th>Utilisateur</Th>
                    <Th>Email</Th>
                    <Th>Rôle</Th>
                    <Th>Statut</Th>
                    <Th>Dernière connexion</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border-soft">
                  {users.map((u) => (
                    <UserRow
                      key={u.id}
                      u={u}
                      isSelf={u.id === currentUserId}
                      onClick={() => setDrawerId(u.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar droite — rôles & permissions */}
        <aside className="rounded-lg border border-admin-border bg-admin-bg-elev p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Rôles &amp; permissions
          </h2>
          <ul className="mt-3 space-y-3">
            {USER_ROLES.map((r) => {
              const m = USER_ROLE_META[r];
              return (
                <li key={r}>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${m.bg} ${m.text}`}
                  >
                    {m.label}
                  </span>
                  <p className="mt-1.5 text-xs leading-relaxed text-admin-text-muted">
                    {m.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>

      <UserInviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <Drawer
        open={drawerId !== null}
        onClose={() => setDrawerId(null)}
        title={drawerUser?.fullName ?? 'Utilisateur'}
        description={drawerUser?.email}
        width={480}
      >
        {drawerUser && (
          <UserDrawerBody
            user={drawerUser}
            isSelf={drawerUser.id === currentUserId}
            onRoleChange={(role) => changeRole(drawerUser, role)}
            onToggleEnabled={() => toggleEnabled(drawerUser)}
            busy={patch.isPending}
          />
        )}
      </Drawer>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-[0.7rem] font-medium uppercase tracking-wider">
      {children}
    </th>
  );
}

function UserRow({
  u,
  isSelf,
  onClick,
}: {
  u: AdminUserRow;
  isSelf: boolean;
  onClick: () => void;
}) {
  const m = USER_ROLE_META[u.role];
  return (
    <tr className="cursor-pointer hover:bg-admin-bg-sunken/40" onClick={onClick}>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <Avatar
            name={u.fullName}
            gradient={u.avatarColor ?? undefined}
            size="sm"
          />
          <span className="font-medium text-admin-text">
            {u.fullName}
            {isSelf && (
              <span className="ml-1.5 text-[0.7rem] text-admin-text-muted">(vous)</span>
            )}
          </span>
        </div>
      </td>
      <td className="px-3 py-2 text-admin-text-muted">{u.email}</td>
      <td className="px-3 py-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${m.bg} ${m.text}`}
        >
          {m.label}
        </span>
      </td>
      <td className="px-3 py-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 text-[0.7rem]',
            u.enabled ? 'text-admin-green' : 'text-admin-text-muted',
          )}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${u.enabled ? 'bg-admin-green' : 'bg-admin-text-muted'}`}
            aria-hidden
          />
          {u.enabled ? 'Actif' : 'Désactivé'}
        </span>
      </td>
      <td className="px-3 py-2 text-admin-text-muted">
        {u.lastLoginAt
          ? new Date(u.lastLoginAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—'}
      </td>
    </tr>
  );
}

function UserDrawerBody({
  user,
  isSelf,
  onRoleChange,
  onToggleEnabled,
  busy,
}: {
  user: AdminUserRow;
  isSelf: boolean;
  onRoleChange: (role: UserRole) => void;
  onToggleEnabled: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
          Rôle
        </h3>
        <select
          value={user.role}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          disabled={busy || isSelf}
          className="w-full rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring disabled:opacity-60"
        >
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {USER_ROLE_META[r].label}
            </option>
          ))}
        </select>
        {isSelf && (
          <p className="mt-1 text-[0.7rem] text-admin-text-muted">
            Vous ne pouvez pas modifier votre propre rôle.
          </p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
          Statut
        </h3>
        <button
          type="button"
          onClick={onToggleEnabled}
          disabled={busy || isSelf}
          className={cn(
            'rounded-md border px-3 py-1.5 text-sm font-medium transition',
            user.enabled
              ? 'border-admin-red/40 bg-admin-red-soft text-admin-red hover:bg-admin-red/10'
              : 'border-admin-green/40 bg-admin-green-soft text-admin-green hover:bg-admin-green/10',
            (busy || isSelf) && 'opacity-60',
          )}
        >
          {user.enabled ? 'Désactiver le compte' : 'Activer le compte'}
        </button>
        {isSelf && (
          <p className="mt-1 text-[0.7rem] text-admin-text-muted">
            Vous ne pouvez pas vous désactiver vous-même.
          </p>
        )}
      </section>

      <section className="grid grid-cols-2 gap-y-2 text-sm">
        <Detail label="Email">{user.email}</Detail>
        <Detail label="Créé le">
          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
        </Detail>
        <Detail label="Dernière connexion">
          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR') : '—'}
        </Detail>
      </section>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.7rem] uppercase tracking-wider text-admin-text-muted">{label}</dt>
      <dd className="mt-0.5 text-admin-text">{children}</dd>
    </div>
  );
}

function errorMessage(err: unknown): string {
  if (err instanceof AdminClientError) {
    const body = err.body as { error?: string; detail?: string } | null;
    return body?.error ?? body?.detail ?? `Erreur ${err.status}`;
  }
  return (err as Error)?.message ?? 'Erreur inconnue';
}
