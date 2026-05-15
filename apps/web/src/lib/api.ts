/**
 * Helper d'appel à l'API Symfony (apps/api).
 *
 * Usage :
 *   const data = await api<MyType>('/contact', { method: 'POST', json: payload });
 *
 * - `NEXT_PUBLIC_API_BASE_URL` pointe vers la racine `/api` du backend.
 * - En dev, un rewrite next.config.mjs renvoie `/api/*` vers Symfony — on peut
 *   donc appeler `api('/contact')` côté client sans CORS.
 * - Côté serveur (RSC, route handlers), on utilise l'URL absolue.
 * - Toute erreur HTTP renvoie une `ApiError` typée portant `status` et `body`.
 */

const ABSOLUTE_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string
  ) {
    super(message ?? `API ${status}`);
    this.name = 'ApiError';
  }
}

type ApiOptions = Omit<RequestInit, 'body'> & {
  /** Payload JSON — sérialisé automatiquement et avec Content-Type adéquat */
  json?: unknown;
  /** JWT — typiquement récupéré depuis un cookie httpOnly côté server, ou un store côté client */
  token?: string;
  /** Force l'URL absolue (utile côté server / route handlers) */
  absolute?: boolean;
};

export async function api<T = unknown>(
  path: string,
  opts: ApiOptions = {}
): Promise<T> {
  const { json, token, absolute, headers, ...rest } = opts;

  const url =
    typeof window === 'undefined' || absolute
      ? `${ABSOLUTE_BASE}${path}`
      : `/api${path}`; // proxy via next.config.mjs rewrite

  const finalHeaders: HeadersInit = {
    Accept: 'application/ld+json,application/json',
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: json ? JSON.stringify(json) : (rest as RequestInit).body,
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* pas de body JSON */
    }
    throw new ApiError(res.status, body);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
