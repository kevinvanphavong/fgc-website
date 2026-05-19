'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCall, AdminClientError } from '@/lib/admin-client';

export type UserRole = 'ROLE_STAFF' | 'ROLE_MANAGER' | 'ROLE_ADMIN';

export const USER_ROLES: UserRole[] = ['ROLE_STAFF', 'ROLE_MANAGER', 'ROLE_ADMIN'];

export const USER_ROLE_META: Record<UserRole, { label: string; description: string; bg: string; text: string }> = {
  ROLE_STAFF: {
    label: 'Staff',
    description: 'Accès au back-office (lecture, gestion des réservations, contenu).',
    bg: 'bg-admin-blue-soft',
    text: 'text-admin-blue',
  },
  ROLE_MANAGER: {
    label: 'Manager',
    description: 'Tout Staff + gestion des médias, B2B, dashboard avancé.',
    bg: 'bg-admin-amber-soft',
    text: 'text-admin-amber',
  },
  ROLE_ADMIN: {
    label: 'Administrateur',
    description: 'Tout Manager + gestion des utilisateurs et rôles.',
    bg: 'bg-admin-pink-soft',
    text: 'text-admin-pink',
  },
};

export interface AdminUserRow {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  roles: string[];
  role: UserRole;
  avatarColor: string | null;
  enabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface UserListResponse {
  items: AdminUserRow[];
}

const BASE_KEY = ['admin', 'users'] as const;

export function useUsersList() {
  return useQuery({
    queryKey: [...BASE_KEY, 'list'] as const,
    queryFn: () => apiCall<UserListResponse>('/admin/users').then((r) => r.items),
  });
}

export interface InviteInput {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

export function useUserInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: InviteInput) =>
      apiCall<AdminUserRow>('/admin/users/invite', { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: BASE_KEY }),
  });
}

export interface PatchUserInput {
  firstName?: string | null;
  lastName?: string | null;
  role?: UserRole;
  enabled?: boolean;
}

async function patchUser(id: number, body: PatchUserInput): Promise<AdminUserRow> {
  const res = await fetch(`/api/admin/proxy/admin/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let parsed: unknown = null;
    try {
      parsed = await res.json();
    } catch {
      /* no body */
    }
    throw new AdminClientError(res.status, parsed);
  }
  return (await res.json()) as AdminUserRow;
}

export function useUserPatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: PatchUserInput }) => patchUser(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: BASE_KEY }),
  });
}

export { AdminClientError };
