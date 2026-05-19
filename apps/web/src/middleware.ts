import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE = 'admin_token';

/**
 * Protège `/admin/*` côté Edge :
 * - Pas de token → redirect /admin/login?next=<original>.
 * - On NE vérifie PAS la validité du JWT ici (l'API le valide à chaque appel) ;
 *   c'est juste une garde de présence pour éviter d'afficher le shell vide.
 *
 * Le matcher exclut /admin/login (sinon boucle) et les assets Next.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Routes auth publiques (login + setup mot de passe via lien d'invitation).
  if (pathname === '/admin/login' || pathname === '/admin/setup-password') {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (token) {
    return NextResponse.next();
  }

  const target = `/admin/login?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(new URL(target, request.url));
}

export const config = {
  matcher: ['/admin/:path*'],
};
