import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';

/**
 * Cookie httpOnly du JWT espace client. Distinct du cookie admin (`admin_token`)
 * pour permettre à un même user d'être logué admin ET client en parallèle
 * dans deux onglets, et pour ne pas mélanger les contextes.
 */
export const CLIENT_COOKIE = 'client_token';
/** Aligné sur token_ttl Symfony (7 jours, cf. lexik_jwt_authentication.yaml). */
export const CLIENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

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

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';
}

/**
 * Récupère le client courant depuis le cookie JWT, mémoïsé par requête.
 * Retourne null si :
 *   - pas de cookie,
 *   - l'API répond 401 (token expiré, user désactivé),
 *   - le user n'a pas ROLE_CLIENT (cas où un admin a un cookie en cache de
 *     debug — on n'autorise pas l'accès aux pages /compte).
 */
export const getCurrentClient = cache(async (): Promise<ClientUser | null> => {
  const token = cookies().get(CLIENT_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${apiBase()}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const user = (await res.json()) as ClientUser;
    if (!user.roles?.includes('ROLE_CLIENT')) return null;
    return user;
  } catch {
    return null;
  }
});

/**
 * Login client : POST /api/auth/login Symfony. Vérifie ensuite que le user
 * est bien ROLE_CLIENT (un admin doit utiliser /admin/login).
 */
export async function loginClient(
  email: string,
  password: string,
): Promise<{ token: string; user: ClientUser } | { error: string; status: number }> {
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
      return { error: 'Erreur serveur, réessayez dans un instant.', status: res.status };
    }
    const body = (await res.json()) as { token: string };
    const token = body.token;

    // Récupère le profil pour vérifier ROLE_CLIENT + obtenir les infos user.
    const meRes = await fetch(`${apiBase()}/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!meRes.ok) {
      return {
        error: 'Ce compte n\'est pas un compte client. Utilisez /admin/login pour le back-office.',
        status: 403,
      };
    }
    const user = (await meRes.json()) as ClientUser;
    if (!user.roles?.includes('ROLE_CLIENT')) {
      return {
        error: 'Ce compte n\'est pas un compte client.',
        status: 403,
      };
    }
    return { token, user };
  } catch {
    return { error: 'Impossible de joindre le serveur.', status: 503 };
  }
}

/**
 * Register client : POST /api/auth/register Symfony. Renvoie token + user
 * directement (l'API émet le JWT à l'inscription).
 */
export async function registerClient(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  acceptRgpd: boolean;
  acceptNewsletter: boolean;
}): Promise<
  | { token: string; user: ClientUser }
  | { error: string; status: number; violations?: { propertyPath: string; message: string }[] }
> {
  try {
    const res = await fetch(`${apiBase()}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    if (res.status === 201) {
      const body = (await res.json()) as { token: string; user: ClientUser };
      return body;
    }
    const body = (await res.json().catch(() => ({}))) as {
      detail?: string;
      violations?: { propertyPath: string; message: string }[];
    };
    return {
      error: body.detail ?? 'Erreur serveur.',
      status: res.status,
      violations: body.violations,
    };
  } catch {
    return { error: 'Impossible de joindre le serveur.', status: 503 };
  }
}

export async function forgotPasswordRequest(email: string): Promise<void> {
  try {
    await fetch(`${apiBase()}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });
  } catch {
    /* swallow — pas d'info pour ne pas leak l'existence du compte */
  }
}
