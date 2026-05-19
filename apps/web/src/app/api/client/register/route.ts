import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  CLIENT_COOKIE,
  CLIENT_COOKIE_MAX_AGE,
  registerClient,
} from '@/lib/client-auth';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload invalide.' }, { status: 400 });
  }

  const result = await registerClient(payload as Parameters<typeof registerClient>[0]);
  if ('error' in result) {
    return NextResponse.json(
      { error: result.error, violations: result.violations },
      { status: result.status }
    );
  }

  cookies().set(CLIENT_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CLIENT_COOKIE_MAX_AGE,
  });

  return NextResponse.json({ user: result.user }, { status: 201 });
}
