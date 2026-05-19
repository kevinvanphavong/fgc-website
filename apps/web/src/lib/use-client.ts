'use client';

/**
 * Espace client — helpers React Query côté client (cf. `lib/client-auth.ts`
 * pour les helpers server-side).
 *
 * - `useClient()` lit `/api/client/proxy/me` et expose `{ user, isLoading }`.
 * - `useClientMutation()` couvre login/register/logout/changePassword/deleteMe.
 *
 * Tout passe par le proxy Next `/api/client/proxy/*` qui injecte le cookie
 * `client_token` côté server.
 */
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export type ClientUser = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  phone: string | null;
  acceptNewsletter: boolean;
  createdAt: string | null;
  roles: string[];
};

export class ClientApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(message ?? `Client API ${status}`);
    this.name = 'ClientApiError';
  }
}

async function clientCall<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown; contentType?: string } = {},
): Promise<T> {
  const url = `/api/client/proxy${path.startsWith('/') ? path : `/${path}`}`;
  const method = opts.method ?? 'GET';
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    headers['Content-Type'] = opts.contentType ?? 'application/json';
    body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, { method, headers, body, cache: 'no-store' });
  if (!res.ok) {
    let parsed: unknown = null;
    try {
      parsed = await res.json();
    } catch {
      /* no body */
    }
    throw new ClientApiError(res.status, parsed);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Hook principal de l'espace client. Renvoie `{ user, isLoading, login, logout,
 * refetch, error }` (signature alignée sur le prompt PR11+PR14).
 *
 * - `user` : `ClientUser | null` (null = déconnecté).
 * - `login(email, password)` : POST /api/client/login → invalide la query `me`.
 * - `logout()` : POST /api/client/logout → set le cache `me` à null.
 * - `refetch()` : force le re-fetch de /api/me.
 *
 * Les hooks de mutation granulaires `useLoginClient`/`useLogoutClient` restent
 * exportés pour les pages qui veulent l'état `isPending`/`error` détaillé
 * (typiquement le form de login). `useClient()` est la voie courte pour les
 * consumers simples (Header, banner "Vous êtes connecté", garde de route).
 */
export function useClient() {
  const qc = useQueryClient();
  const q = useQuery<ClientUser | null>({
    queryKey: ['client', 'me'],
    queryFn: async () => {
      try {
        return await clientCall<ClientUser>('/me');
      } catch (e) {
        if (e instanceof ClientApiError && e.status === 401) return null;
        throw e;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  async function login(payload: { email: string; password: string }): Promise<ClientUser> {
    const res = await fetch('/api/client/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ClientApiError(res.status, body);
    }
    const body = (await res.json()) as { user: ClientUser };
    await qc.invalidateQueries({ queryKey: ['client', 'me'] });
    return body.user;
  }

  async function logout(): Promise<void> {
    await fetch('/api/client/logout', { method: 'POST' });
    qc.setQueryData(['client', 'me'], null);
  }

  return {
    user: q.data ?? null,
    isLoading: q.isLoading,
    error: q.error,
    login,
    logout,
    refetch: q.refetch,
  };
}

let _qc: QueryClient | null = null;
export function getClientQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server : un nouveau client à chaque tree de render — pas de partage.
    return new QueryClient({
      defaultOptions: {
        queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
      },
    });
  }
  if (!_qc) {
    _qc = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
      },
    });
  }
  return _qc;
}

export function useLoginClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const res = await fetch('/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ClientApiError(res.status, body);
      }
      return (await res.json()) as { user: ClientUser };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client', 'me'] }),
  });
}

export function useRegisterClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string | null;
      acceptRgpd: boolean;
      acceptNewsletter: boolean;
    }) => {
      const res = await fetch('/api/client/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status !== 201) {
        const body = await res.json().catch(() => ({}));
        throw new ClientApiError(res.status, body);
      }
      return (await res.json()) as { user: ClientUser };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client', 'me'] }),
  });
}

export function useLogoutClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch('/api/client/logout', { method: 'POST' });
    },
    onSuccess: () => {
      qc.setQueryData(['client', 'me'], null);
    },
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Pick<ClientUser, 'firstName' | 'lastName' | 'phone' | 'acceptNewsletter'>>) => {
      return clientCall<ClientUser>('/me', {
        method: 'PATCH',
        body: patch,
        contentType: 'application/merge-patch+json',
      });
    },
    onSuccess: (data) => qc.setQueryData(['client', 'me'], data),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) =>
      clientCall('/me/change-password', { method: 'POST', body: payload }),
  });
}

export function useDeleteMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => clientCall('/me', { method: 'DELETE' }),
    onSuccess: () => qc.setQueryData(['client', 'me'], null),
  });
}

export type ReservationItem = {
  kind: 'anniv' | 'b2b';
  id: number;
  reference: string;
  status: string;
  statusLabel: string;
  eventDate: string | null;
  timeSlot: string | null;
  summary: string;
  totalCents: number | null;
  createdAt: string | null;
};

export function useMyReservations() {
  return useQuery<{
    items: ReservationItem[];
    total: number;
    page: number;
    perPage: number;
  }>({
    queryKey: ['client', 'reservations'],
    queryFn: async () => clientCall('/me/reservations'),
    staleTime: 30_000,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      await fetch('/api/client/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    },
  });
}
