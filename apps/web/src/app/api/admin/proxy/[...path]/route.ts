import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from '@/lib/admin-auth';
import { CONTENT_TAG } from '@/lib/content-api';

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';
}

/**
 * Proxy générique vers Symfony pour les routes admin du module Contenus.
 * - Lit le cookie `admin_token` httpOnly, l'injecte en `Authorization: Bearer …`.
 * - Forwarde la méthode, le body, le content-type.
 * - Après chaque mutation réussie (POST/PUT/PATCH/DELETE), revalide tout le
 *   site public via `revalidatePath('/', 'layout')` (crude mais simple — le
 *   site est petit, la cache est repeuplée à la prochaine visite).
 *
 * URL forme : /api/admin/proxy/{...path}  →  ${API_BASE}/{...path}
 *
 * Exemple : POST /api/admin/proxy/hebdo_cards  →  POST http://127.0.0.1:8000/api/hebdo_cards
 */
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

async function handle(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const upstreamPath = params.path.join('/');
  const targetUrl = new URL(`${apiBase()}/${upstreamPath}`);
  // Forward query string
  request.nextUrl.searchParams.forEach((v, k) => targetUrl.searchParams.set(k, v));

  const isMutation = MUTATION_METHODS.has(request.method);
  const incomingContentType = request.headers.get('content-type');
  const isMultipart = incomingContentType?.startsWith('multipart/form-data') ?? false;

  // Multipart (upload média PR7) : on forwarde le body brut en stream — sinon
  // les boundaries multipart sont perdues si on passe par .text(). Pour le reste
  // (JSON), .text() reste plus lisible en debug.
  let body: BodyInit | undefined;
  if (isMutation && request.method !== 'DELETE') {
    if (isMultipart) {
      body = request.body as unknown as BodyInit;
    } else {
      body = await request.text();
    }
  }

  const fetchInit: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:
        request.headers.get('accept') ?? 'application/ld+json,application/json',
      ...(incomingContentType ? { 'Content-Type': incomingContentType } : {}),
    },
    body,
    cache: 'no-store',
  };
  if (isMultipart) {
    fetchInit.duplex = 'half'; // requis quand `body` est un ReadableStream
  }

  const upstream = await fetch(targetUrl.toString(), fetchInit);

  // Revalidate the entire public site on successful mutation.
  if (isMutation && upstream.ok) {
    try {
      // Revalidation ciblée par tag : tout le contenu éditable porte CONTENT_TAG
      // (cf. content-api.ts + reserver-anniversaire/page.tsx). Fiable même en dev,
      // contrairement à revalidatePath('/', 'layout') qui ne déclenche pas l'ISR
      // sous `next dev`. On garde revalidatePath en complément (no-op si tag suffit).
      revalidateTag(CONTENT_TAG);
      revalidatePath('/', 'layout');
    } catch {
      /* revalidate ne doit pas casser la réponse */
    }
  }

  // Stream back content + status.
  const contentType = upstream.headers.get('content-type') ?? 'application/json';
  const payload = await upstream.text();

  return new NextResponse(payload || null, {
    status: upstream.status,
    headers: { 'Content-Type': contentType },
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
