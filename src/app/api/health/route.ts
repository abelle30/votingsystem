import { NextResponse } from 'next/server';
import { pingDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await pingDb();
    return NextResponse.json({ status: 'ok', database: 'connected' });
  } catch {
    return NextResponse.json({ status: 'error', database: 'unavailable' }, { status: 503 });
  }
}
