import { NextResponse } from 'next/server';
import { adminFetch, AdminApiError } from '@/lib/admin-api';

export async function POST() {
  try {
    await adminFetch('/admin/notifications/mark-read', {
      method: 'POST',
      redirectOn401: false,
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof AdminApiError) {
      return NextResponse.json({ error: 'api_error' }, { status: err.status });
    }
    return NextResponse.json({ error: 'unknown' }, { status: 500 });
  }
}
