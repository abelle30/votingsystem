import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { createSession, destroySession, getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { jsonError, serverError } from '@/lib/http';
import { isPasswordHash, verifyPassword, hashPassword } from '@/lib/security';
import { text } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body?.role === 'admin' ? 'admin' : body?.role === 'voter' ? 'voter' : null;
    const identity = text(typeof body?.identity === 'string' ? body.identity : null, 100);
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!role || !identity || password.length < 1 || password.length > 200) return jsonError('Enter your username or student ID and password.');

    const db = getDb();
    if (role === 'admin') {
      const [rows] = await db.execute<(RowDataPacket & { admin_id: number; password_hash: string })[]>('SELECT admin_id, password_hash FROM admin_users WHERE username = ? LIMIT 1', [identity]);
      const admin = rows[0];
      if (!admin || !(await verifyPassword(password, admin.password_hash))) return jsonError('Incorrect username or password.', 401);
      if (!isPasswordHash(admin.password_hash)) {
        await db.execute('UPDATE admin_users SET password_hash = ? WHERE admin_id = ?', [await hashPassword(password), admin.admin_id]);
      }
      await createSession({ id: Number(admin.admin_id), role });
      return NextResponse.json({ role });
    }

    const [rows] = await db.execute<(RowDataPacket & { voters_id: number; password: string; account: string; status: string })[]>(
      "SELECT voters_id, password, account, status FROM voters WHERE id_number = ? LIMIT 1",
      [identity],
    );
    const voter = rows[0];
    if (!voter || !(await verifyPassword(password, voter.password))) return jsonError('Incorrect student ID or password.', 401);
    if (String(voter.account).toLowerCase() !== 'active') return jsonError('Your voter account is not active.', 403);
    if (voter.status !== 'Unvoted') return jsonError('This account has already voted.', 403);
    if (!isPasswordHash(voter.password)) {
      await db.execute('UPDATE voters SET password = ? WHERE voters_id = ?', [await hashPassword(password), voter.voters_id]);
    }
    await createSession({ id: Number(voter.voters_id), role });
    return NextResponse.json({ role });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ message: 'Signed out.' });
}

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ session });
}
