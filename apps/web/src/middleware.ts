import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE = 'admin_token';
const CLIENT_COOKIE = 'client_token';

/**
 * Protège deux périmètres distincts :
 *   - `/admin/*` (back-office staff)    → cookie `admin_token` requis
 *   - `/compte/*` (espace client public) → cookie `client_token` requis
 *
 * Un seul matcher fusionné : Next.js ne supporte pas deux matchers indépendants
 * dans un middleware. On branche par segment de path.
 *
 * On NE vérifie PAS la validité du JWT ici (l'API le valide à chaque appel) :
 * c'est juste une garde de présence pour éviter d'afficher le shell vide.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // --- Admin ---
  if (pathname === '/admin/login' || pathname === '/admin/setup-password') {
    return NextResponse.next();
  }
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (token) return NextResponse.next();
    const target = `/admin/login?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(new URL(target, request.url));
  }

  // --- Espace client ---
  if (pathname.startsWith('/compte')) {
    const token = request.cookies.get(CLIENT_COOKIE)?.value;
    if (token) return NextResponse.next();
    const target = `/connexion?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/compte/:path*'],
};
