'use client';

/**
 * Helper client-side qui appelle l'API Symfony via le proxy Next.
 * Tout passe par /api/admin/proxy/* afin de bénéficier du cookie httpOnly
 * + de la revalidation automatique du site public en mutation.
 */
import { QueryClient } from '@tanstack/react-query';

export class AdminClientError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string
  ) {
    super(message ?? `Admin client ${status}`);
    this.name = 'AdminClientError';
  }
}

type ApiCallOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
};

const ACCEPT_HEADER = 'application/ld+json';

export async function apiCall<T = unknown>(
  path: string,
  opts: ApiCallOptions = {}
): Promise<T> {
  const url = `/api/admin/proxy${path.startsWith('/') ? path : `/${path}`}`;
  const method = opts.method ?? 'GET';
  const headers: HeadersInit = { Accept: ACCEPT_HEADER };
  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/ld+json';
    body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, { method, headers, body, signal: opts.signal });
  if (!res.ok) {
    let parsed: unknown = null;
    try {
      parsed = await res.json();
    } catch {
      /* no body */
    }
    throw new AdminClientError(res.status, parsed);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Extracteur uniforme pour les collections JSON-LD ({ member: [...] } ou { 'hydra:member': [...] }). */
export function unwrapCollection<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== 'object') return [];
  const p = payload as Record<string, unknown>;
  const arr = (p['member'] ?? p['hydra:member']) as unknown;
  return Array.isArray(arr) ? (arr as T[]) : [];
}

let _client: QueryClient | null = null;
export function getQueryClient(): QueryClient {
  if (!_client) {
    _client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  }
  return _client;
}
