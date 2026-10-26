import { NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { jsonError, serverError } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'voter') return jsonError('Sign in as a voter to view the ballot.', 401);

  try {
    const [state] = await getDb().query<RowDataPacket[]>('SELECT is_open FROM election_settings WHERE id = 1');
    if (!state.length || !Boolean(state[0].is_open)) return jsonError('Voting is not open yet.', 403);
    const [rows] = await getDb().execute<RowDataPacket[]>(
      'SELECT candidate_id, position, firstname, lastname, year_level, gender, party, img FROM candidate ORDER BY position, lastname, firstname',
    );
    const positions = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = String(row.position);
      const group = positions.get(key) ?? [];
      group.push(row);
      positions.set(key, group);
    }
    return NextResponse.json({ positions: Array.from(positions, ([position, candidates]) => ({ position, candidates })) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'voter') return jsonError('Sign in as a voter to submit a ballot.', 401);

  let selections: Record<string, number>;
  try {
    const body = await request.json();
    const raw = body?.selections;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return jsonError('Select one candidate for each position.');
    selections = {};
    for (const [rawPosition, rawCandidate] of Object.entries(raw)) {
      const position = rawPosition.trim().replace(/\s+/g, ' ');
      const candidateId = Number(rawCandidate);
      if (!position || position.length > 100 || !Number.isSafeInteger(candidateId) || candidateId < 1) return jsonError('The ballot contains an invalid selection.');
      selections[position] = candidateId;
    }
  } catch {
    return jsonError('The ballot request is invalid.');
  }

  const db = getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [state] = await connection.query<RowDataPacket[]>('SELECT is_open FROM election_settings WHERE id = 1 FOR UPDATE');
    if (!state.length || !Boolean(state[0].is_open)) {
      await connection.rollback();
      return jsonError('Voting is currently closed.', 403);
    }
    const [voterRows] = await connection.execute<RowDataPacket[]>(
      'SELECT voters_id, account, status FROM voters WHERE voters_id = ? FOR UPDATE',
      [session.id],
    );
    const voter = voterRows[0];
    if (!voter || String(voter.account).toLowerCase() !== 'active' || voter.status !== 'Unvoted') {
      await connection.rollback();
      return jsonError('This voter account is not eligible to vote again.', 403);
    }

    const [candidateRows] = await connection.execute<RowDataPacket[]>(
      'SELECT candidate_id, position FROM candidate ORDER BY position, candidate_id',
    );
    const expectedPositions = [...new Set(candidateRows.map((row) => String(row.position)))];
    if (!expectedPositions.length || expectedPositions.length !== Object.keys(selections).length || expectedPositions.some((position) => !selections[position])) {
      await connection.rollback();
      return jsonError('Select exactly one candidate for every ballot position.');
    }

    const candidateById = new Map(candidateRows.map((row) => [Number(row.candidate_id), String(row.position)]));
    for (const [position, candidateId] of Object.entries(selections)) {
      if (candidateById.get(candidateId) !== position) {
        await connection.rollback();
        return jsonError('One of the selected candidates does not belong to that position.');
      }
    }

    for (const [position, candidateId] of Object.entries(selections)) {
      await connection.execute<ResultSetHeader>(
        'INSERT INTO votes (candidate_id, voters_id, position) VALUES (?, ?, ?)',
        [candidateId, session.id, position],
      );
    }
    await connection.execute("UPDATE voters SET status = 'Voted' WHERE voters_id = ?", [session.id]);
    await connection.commit();
    return NextResponse.json({ message: 'Your ballot has been submitted.' });
  } catch (error) {
    await connection.rollback();
    return serverError(error);
  } finally {
    connection.release();
  }
}
