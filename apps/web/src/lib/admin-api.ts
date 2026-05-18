import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE } from './admin-auth';

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';
}

export class AdminApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(`Admin API ${status}`);
    this.name = 'AdminApiError';
  }
}

type AdminFetchOptions = Omit<RequestInit, 'body'> & {
  json?: unknown;
  /** Si true (par défaut), 401 → redirect vers /admin/login. */
  redirectOn401?: boolean;
};

/**
 * Helper fetch typé côté server pour /api/admin/*.
 * - Propage le cookie `admin_token` en Authorization: Bearer.
 * - 401 → redirect /admin/login (sauf si redirectOn401: false).
 * - Autres erreurs → AdminApiError.
 */
export async function adminFetch<T = unknown>(
  path: string,
  opts: AdminFetchOptions = {}
): Promise<T> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  const { json, redirectOn401 = true, headers, ...rest } = opts;

  const res = await fetch(`${apiBase()}${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : (rest as RequestInit).body,
    cache: 'no-store',
  });

  if (res.status === 401 && redirectOn401) {
    redirect('/admin/login');
  }

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    throw new AdminApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ----------------------- Dashboard typings -----------------------

export type DashboardKpi = {
  value: number;
  delta: number;
  spark: number[];
};

export type DashboardActivity = {
  id: string;
  type: 'reservation' | 'payment' | 'user' | 'system';
  label: string;
  meta: string;
  at: string;
};

export type DashboardNotification = {
  id: string;
  title: string;
  body: string;
  at: string;
  unread: boolean;
};

export type DashboardPayload = {
  meta: { demo: boolean; generatedAt: string };
  kpis: {
    revenueToday: DashboardKpi;
    reservationsToday: DashboardKpi;
    occupancyRate: DashboardKpi;
    revenueMonth: DashboardKpi;
  };
  recentActivity: DashboardActivity[];
  notifications: DashboardNotification[];
};

/**
 * Mémoïsé par requête : appelable depuis le layout (notifications topbar) ET
 * depuis la page (KPIs) sans double fetch.
 */
export const getDashboard = cache(
  (): Promise<DashboardPayload> => adminFetch<DashboardPayload>('/admin/dashboard')
);

/**
 * Renvoie seulement les notifications. La couche admin-api.ts cache le fetch
 * complet du dashboard — appeler ceci depuis le layout n'ajoute pas de requête.
 */
export async function getNotifications(): Promise<DashboardNotification[]> {
  try {
    const data = await getDashboard();
    return data.notifications;
  } catch {
    return [];
  }
}
