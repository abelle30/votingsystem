import { NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { jsonError, serverError } from '@/lib/http';
import { text } from '@/lib/validation';

export const runtime = 'nodejs';

async function isAdmin() {
  const session = await getSession();
  return session?.role === 'admin';
}

export async function GET() {
  if (!(await isAdmin())) return jsonError('Administrator access required.', 401);
  try {
    const [rows] = await getDb().query<RowDataPacket[]>(
      'SELECT candidate_id, position, firstname, lastname, year_level, gender, party, img FROM candidate ORDER BY position, lastname, firstname',
    );
    return NextResponse.json({ candidates: rows });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return jsonError('Administrator access required.', 401);
  try {
    const body = await request.json();
    const position = text(typeof body?.position === 'string' ? body.position : null, 100).replace(/\s+/g, ' ');
    const firstname = text(typeof body?.firstname === 'string' ? body.firstname : null, 100);
    const lastname = text(typeof body?.lastname === 'string' ? body.lastname : null, 100);
    const yearLevel = text(typeof body?.yearLevel === 'string' ? body.yearLevel : null, 100);
    const gender = text(typeof body?.gender === 'string' ? body.gender : null, 20);
    const party = text(typeof body?.party === 'string' ? body.party : null, 100);
    if (!position || !firstname || !lastname) return jsonError('Position, first name, and last name are required.');
    const connection = await getDb().getConnection();
    let result: ResultSetHeader;
    try {
      await connection.beginTransaction();
      const [settings] = await connection.query<RowDataPacket[]>('SELECT is_open FROM election_settings WHERE id = 1 FOR UPDATE');
      const [existingVotes] = await connection.query<RowDataPacket[]>('SELECT vote_id FROM votes LIMIT 1');
      if (!settings.length || Boolean(settings[0].is_open) || existingVotes.length > 0) {
        await connection.rollback();
        return jsonError('Candidate changes are locked after the election opens or the first vote is cast.', 409);
      }
      const [insert] = await connection.execute<ResultSetHeader>(
        'INSERT INTO candidate (position, firstname, lastname, year_level, gender, party) VALUES (?, ?, ?, ?, ?, ?)',
        [position, firstname, lastname, yearLevel, gender, party],
      );
      result = insert;
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return NextResponse.json({ candidateId: result.insertId, message: 'Candidate added.' }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return jsonError('Administrator access required.', 401);
  try {
    const body = await request.json();
    const id = Number(body?.candidateId);
    if (!Number.isSafeInteger(id) || id < 1) return jsonError('Invalid candidate ID.');
    const connection = await getDb().getConnection();
    let result: ResultSetHeader;
    try {
      await connection.beginTransaction();
      const [settings] = await connection.query<RowDataPacket[]>('SELECT is_open FROM election_settings WHERE id = 1 FOR UPDATE');
      const [existingVotes] = await connection.query<RowDataPacket[]>('SELECT vote_id FROM votes LIMIT 1');
      if (!settings.length || Boolean(settings[0].is_open) || existingVotes.length > 0) {
        await connection.rollback();
        return jsonError('Candidate changes are locked after the election opens or the first vote is cast.', 409);
      }
      const [deleted] = await connection.execute<ResultSetHeader>('DELETE FROM candidate WHERE candidate_id = ?', [id]);
      result = deleted;
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    if (result.affectedRows === 0) return jsonError('Candidate not found.', 404);
    return NextResponse.json({ message: 'Candidate removed.' });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_ROW_IS_REFERENCED_2') {
      return jsonError('Candidates with recorded votes cannot be removed.', 409);
    }
    return serverError(error);
  }
}
