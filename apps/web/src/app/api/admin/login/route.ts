import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  loginToApi,
} from '@/lib/admin-auth';

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload invalide.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Email ou mot de passe invalide.' },
      { status: 400 }
    );
  }

  const result = await loginToApi(parsed.data.email, parsed.data.password);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  cookies().set(ADMIN_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });

  return NextResponse.json({ user: result.user });
}
