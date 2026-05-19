import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { CLIENT_COOKIE } from '@/lib/client-auth';

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';
}

/**
 * Proxy authentifié pour l'espace client.
 *
 *   /api/client/proxy/{...path}  →  ${API_BASE}/{...path}
 *
 * Lit le cookie `client_token` httpOnly et l'injecte en `Authorization: Bearer`.
 *
 * Couvre :
 *   - GET    /me, /me/reservations
 *   - PATCH  /me
 *   - POST   /me/change-password
 *   - DELETE /me
 *   - POST   /reservations/anniversaire (tunnel pré-rempli connecté)
 *   - POST   /entreprises/devis (B2B pré-rempli connecté)
 *
 * Pour le tunnel anniv et B2B qui sont publics : si le cookie est absent, on
 * forwarde quand même la requête (anonyme). Pour /me/* : 401 si pas de cookie.
 */
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

async function handle(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const token = cookies().get(CLIENT_COOKIE)?.value;
  const upstreamPath = params.path.join('/');
  const isMeEndpoint = upstreamPath === 'me' || upstreamPath.startsWith('me/');

  if (!token && isMeEndpoint) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const targetUrl = new URL(`${apiBase()}/${upstreamPath}`);
  request.nextUrl.searchParams.forEach((v, k) => targetUrl.searchParams.set(k, v));

  const isMutation = MUTATION_METHODS.has(request.method);
  const incomingContentType = request.headers.get('content-type');

  let body: BodyInit | undefined;
  if (isMutation && request.method !== 'DELETE') {
    body = await request.text();
  }

  const headers: Record<string, string> = {
    Accept:
      request.headers.get('accept') ?? 'application/ld+json,application/json',
    ...(incomingContentType ? { 'Content-Type': incomingContentType } : {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const upstream = await fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    body,
    cache: 'no-store',
  });

  const responseBody = await upstream.text();
  const passthroughHeaders = new Headers();
  const ct = upstream.headers.get('content-type');
  if (ct) passthroughHeaders.set('content-type', ct);

  return new NextResponse(responseBody || null, {
    status: upstream.status,
    headers: passthroughHeaders,
  });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
