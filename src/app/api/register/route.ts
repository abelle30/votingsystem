import { NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getDb } from '@/lib/db';
import { jsonError, serverError } from '@/lib/http';
import { hashPassword } from '@/lib/security';
import { isSqlDuplicate } from '@/lib/security';
import { text, validStudentId } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = text(typeof body?.studentId === 'string' ? body.studentId : null, 12).toUpperCase();
    const fullName = text(typeof body?.fullName === 'string' ? body.fullName : null, 225).replace(/\s+/g, ' ');
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!validStudentId(id) || fullName.length < 3 || password.length < 12 || password.length > 200) {
      return jsonError('Enter a valid student ID, your full name, and a password of at least 12 characters.');
    }

    const db = getDb();
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [eligible] = await connection.execute<RowDataPacket[]>(
        'SELECT names FROM ids WHERE id_number = ? FOR UPDATE',
        [id],
      );
      if (!eligible.length) {
        await connection.rollback();
        return jsonError('This student ID is not on the eligible voter list. Contact the election administrator.', 403);
      }

      const officialName = String(eligible[0].names).trim().replace(/\s+/g, ' ').toLocaleLowerCase();
      if (fullName.toLocaleLowerCase() !== officialName) {
        await connection.rollback();
        return jsonError('The name does not match the eligible voter record.', 403);
      }

      const [existing] = await connection.execute<RowDataPacket[]>(
        'SELECT voters_id FROM voters WHERE id_number = ? LIMIT 1',
        [id],
      );
      if (existing.length) {
        await connection.rollback();
        return jsonError('This student ID is already registered. Sign in instead.', 409);
      }

      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO voters (id_number, firstname, lastname, password, account, status) VALUES (?, ?, ?, ?, 'Active', 'Unvoted')",
        [id, fullName.split(' ')[0], fullName.split(' ').slice(1).join(' '), await hashPassword(password)],
      );
      await connection.commit();
      return NextResponse.json({ message: 'Voter account created.', voterId: result.insertId }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      if (isSqlDuplicate(error)) return jsonError('This student ID is already registered.', 409);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    return serverError(error);
  }
}
