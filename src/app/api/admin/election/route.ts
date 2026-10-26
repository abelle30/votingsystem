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
    const [rows] = await getDb().query<RowDataPacket[]>('SELECT is_open, updated_at FROM election_settings WHERE id = 1');
    return NextResponse.json({ isOpen: Boolean(rows[0]?.is_open) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return jsonError('Administrator access required.', 401);

  let isOpen: boolean;
  try {
    const body = await request.json();
    if (typeof body?.isOpen !== 'boolean') return jsonError('Choose whether to open or close the election.');
    isOpen = body.isOpen;
  } catch {
    return jsonError('Invalid election update request.');
  }

  const connection = await getDb().getConnection();
  try {
    await connection.beginTransaction();
    const [settings] = await connection.query<RowDataPacket[]>('SELECT is_open FROM election_settings WHERE id = 1 FOR UPDATE');
    if (!settings.length) {
      await connection.rollback();
      return jsonError('Election settings are missing. Import the latest database schema.', 503);
    }

    if (isOpen) {
      const [candidates] = await connection.query<RowDataPacket[]>('SELECT DISTINCT position FROM candidate');
      const [eligible] = await connection.query<RowDataPacket[]>('SELECT id_number FROM ids LIMIT 1');
      if (candidates.length === 0 || eligible.length === 0) {
        await connection.rollback();
        return jsonError('Add at least one candidate and one eligible student before opening the election.');
      }
    }

    await connection.execute('UPDATE election_settings SET is_open = ? WHERE id = 1', [isOpen ? 1 : 0]);
    await connection.commit();
    return NextResponse.json({ isOpen, message: isOpen ? 'Voting is now open.' : 'Voting is now closed.' });
  } catch (error) {
    await connection.rollback();
    return serverError(error);
  } finally {
    connection.release();
  }
}
