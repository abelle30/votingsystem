import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { jsonError, serverError } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return jsonError('Administrator access required.', 401);
  try {
    const [state] = await getDb().query<RowDataPacket[]>('SELECT is_open FROM election_settings WHERE id = 1');
    if (!state.length) return jsonError('Election settings are missing. Import the latest database schema.', 503);
    if (Boolean(state[0].is_open)) return jsonError('Results are hidden while voting is open.', 403);
    const [rows] = await getDb().query<RowDataPacket[]>(
      'SELECT c.position, c.candidate_id, c.firstname, c.lastname, c.party, COUNT(v.vote_id) AS votes FROM candidate c LEFT JOIN votes v ON v.candidate_id = c.candidate_id GROUP BY c.position, c.candidate_id, c.firstname, c.lastname, c.party ORDER BY c.position, votes DESC, c.lastname',
    );
    const [totals] = await getDb().query<RowDataPacket[]>(
      "SELECT COUNT(*) AS registered, SUM(status = 'Voted') AS voted FROM voters",
    );
    return NextResponse.json({ results: rows, totals: totals[0] });
  } catch (error) {
    return serverError(error);
  }
}
