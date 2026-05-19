import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { CLIENT_COOKIE } from '@/lib/client-auth';

export async function POST() {
  cookies().delete(CLIENT_COOKIE);
  return NextResponse.json({ ok: true });
}
