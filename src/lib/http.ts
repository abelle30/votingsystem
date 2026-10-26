import { NextResponse } from 'next/server';

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function serverError(error: unknown) {
  console.error('Request failed:', error);
  return jsonError('The request could not be completed. Check the database connection and schema.', 500);
}
