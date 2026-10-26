import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/security';
import { text } from '@/lib/validation';

export const runtime = 'nodejs';

function equalSecret(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expectedToken = process.env.ADMIN_SETUP_TOKEN;
  if (!expectedToken || expectedToken.length < 24) {
    return NextResponse.json({ error: 'Admin bootstrap is not configured.' }, { status: 503 });
  }

  let data: { token?: unknown; username?: unknown; password?: unknown };
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const token = typeof data.token === 'string' ? data.token : '';
  if (!equalSecret(token, expectedToken)) {
    return NextResponse.json({ error: 'Invalid setup token.' }, { status: 403 });
  }

  const username = text(typeof data.username === 'string' ? data.username : null, 100);
  const password = typeof data.password === 'string' ? data.password : '';
  if (!/^[a-zA-Z0-9_.-]{3,100}$/.test(username) || password.length < 12 || password.length > 200) {
    return NextResponse.json({ error: 'Use a valid username and a password of 12–200 characters.' }, { status: 400 });
  }

  const db = getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [lockRows] = await connection.query<RowDataPacket[]>('SELECT GET_LOCK(?, 5) AS acquired', ['votingsystem_admin_bootstrap']);
    if (Number(lockRows[0]?.acquired) !== 1) {
      await connection.rollback();
      return NextResponse.json({ error: 'Administrator setup is busy. Try again.' }, { status: 503 });
    }

    const [admins] = await connection.query('SELECT admin_id FROM admin_users LIMIT 1 FOR UPDATE');
    if ((admins as unknown[]).length > 0) {
      await connection.rollback();
      return NextResponse.json({ error: 'An administrator already exists. Bootstrap is closed.' }, { status: 409 });
    }

    await connection.execute(
      'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
      [username, await hashPassword(password)],
    );
    await connection.commit();
    return NextResponse.json({ message: 'Administrator created. Sign in to continue.' }, { status: 201 });
  } catch {
    await connection.rollback();
    return NextResponse.json({ error: 'Could not create administrator.' }, { status: 500 });
  } finally {
    await connection.query('SELECT RELEASE_LOCK(?)', ['votingsystem_admin_bootstrap']).catch(() => undefined);
    connection.release();
  }
}
