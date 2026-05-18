import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';

export const ADMIN_COOKIE = 'admin_token';
/** TTL aligné sur le JWT Symfony (cf. lexik_jwt_authentication.yaml). */
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

export type AdminUser = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  roles: string[];
  avatarColor: string | null;
};

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';
}

/**
 * Récupère le user courant depuis le JWT en cookie httpOnly.
 * Mémoïsé par requête via `react.cache` (un seul fetch /me par render tree).
 * Retourne `null` si pas de token ou si l'API répond 401.
 */
export const getCurrentUser = cache(async (): Promise<AdminUser | null> => {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${apiBase()}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as AdminUser;
  } catch {
    return null;
  }
});

export async function loginToApi(
  email: string,
  password: string
): Promise<{ token: string; user: AdminUser } | { error: string; status: number }> {
  try {
    const res = await fetch(`${apiBase()}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    if (res.status === 401) {
      return { error: 'Email ou mot de passe incorrect.', status: 401 };
    }
    if (!res.ok) {
      return { error: 'Erreur serveur, réessaie dans un instant.', status: res.status };
    }
    const body = (await res.json()) as { token: string; user: AdminUser };
    return body;
  } catch {
    return {
      error: 'Impossible de joindre le serveur.',
      status: 503,
    };
  }
}
