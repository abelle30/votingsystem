import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export type Session = { id: number; role: 'voter' | 'admin' };

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error('SESSION_SECRET must be set to a random secret of at least 32 characters.');
  }
  return new TextEncoder().encode(value);
}

export async function createSession(session: Session) {
  const token = await new SignJWT({ role: session.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(session.id))
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret());

  const store = await cookies();
  store.set('voting_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 8 * 60 * 60,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get('voting_session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    const id = Number(payload.sub);
    if (!Number.isSafeInteger(id) || id < 1) return null;
    if (payload.role !== 'voter' && payload.role !== 'admin') return null;
    return { id, role: payload.role };
  } catch {
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete('voting_session');
}
