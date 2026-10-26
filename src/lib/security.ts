import 'server-only';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const passwordPattern = /^scrypt\$([a-f0-9]{32})\$([a-f0-9]{128})$/;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${key.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const match = passwordPattern.exec(stored);
  if (match) {
    const candidate = (await scrypt(password, match[1], 64)) as Buffer;
    return timingSafeEqual(candidate, Buffer.from(match[2], 'hex'));
  }

  // The historical SQL schema stored plaintext passwords. Accept those for
  // migration, then replace the value with a scrypt hash after a valid login.
  const left = Buffer.from(password);
  const right = Buffer.from(stored);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isPasswordHash(value: string) {
  return passwordPattern.test(value);
}

export function isSqlDuplicate(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY';
}
