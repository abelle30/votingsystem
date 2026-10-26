import { NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { jsonError, serverError } from '@/lib/http';
import { text, validStudentId } from '@/lib/validation';

export const runtime = 'nodejs';

async function isAdmin() {
  const session = await getSession();
  return session?.role === 'admin';
}

export async function GET() {
  if (!(await isAdmin())) return jsonError('Administrator access required.', 401);
  try {
    const [rows] = await getDb().query<RowDataPacket[]>(
      'SELECT ids.id_number, ids.names, voters.voters_id, voters.status, voters.account FROM ids LEFT JOIN voters ON voters.id_number = ids.id_number ORDER BY ids.id_number',
    );
    return NextResponse.json({ eligibleVoters: rows });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return jsonError('Administrator access required.', 401);
  try {
    const body = await request.json();
    const id = text(typeof body?.studentId === 'string' ? body.studentId : null, 12).toUpperCase();
    const names = text(typeof body?.names === 'string' ? body.names : null, 225);
    if (!validStudentId(id) || !names) return jsonError('Enter a valid student ID and student name.');
    await getDb().execute<ResultSetHeader>(
      'INSERT INTO ids (id_number, names) VALUES (?, ?)',
      [id, names],
    );
    return NextResponse.json({ message: 'Student added to the eligible voter list.' }, { status: 201 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      return jsonError('That student ID is already on the eligible voter list.', 409);
    }
    return serverError(error);
  }
}
