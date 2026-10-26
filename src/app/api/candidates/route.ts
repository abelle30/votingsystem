import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { getDb } from '@/lib/db';
import { serverError } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [candidates] = await getDb().query<RowDataPacket[]>(
      'SELECT candidate_id, position, firstname, lastname, year_level, gender, party FROM candidate ORDER BY position, lastname, firstname',
    );
    return NextResponse.json({ candidates });
  } catch (error) {
    return serverError(error);
  }
}
