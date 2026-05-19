import { NextResponse } from 'next/server';
import { z } from 'zod';
import { forgotPasswordRequest } from '@/lib/client-auth';

const bodySchema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    // Toujours 204 pour ne pas leak l'existence d'un compte.
    return new NextResponse(null, { status: 204 });
  }
  const parsed = bodySchema.safeParse(payload);
  if (parsed.success) {
    await forgotPasswordRequest(parsed.data.email);
  }
  return new NextResponse(null, { status: 204 });
}
