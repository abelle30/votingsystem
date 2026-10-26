'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';

export async function api<T extends Record<string, unknown> = Record<string, unknown>>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: { 'content-type': 'application/json', ...options.headers },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result as T;
}

export function Shell({ children, signedIn = false, role }: { children: ReactNode; signedIn?: boolean; role?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await api('/api/auth', { method: 'DELETE' });
      router.push('/');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="shell topbar">
        <Link className="brand" href="/">Student Government Elections 2022</Link>
        <nav className="top-actions">
          <Link href="/">Home</Link>
          <Link href="/candidates">Candidates</Link>
          <Link href="/about">About AdU</Link>
          {signedIn ? <><Link href={role === 'admin' ? '/admin/dashboard' : '/ballot'}>{role === 'admin' ? 'Admin' : 'Ballot'}</Link><button className="button secondary" onClick={logout} disabled={busy}>Logout</button></> : <><Link href="/register">Register</Link><Link href="/login">Login</Link></>}
        </nav>
      </header>
      {children}
      <footer className="shell footer"><hr /><span>©2022. Developed by Group 3 : BSIT301.</span><br /><span>Online Voting System.</span><br /><span>Final Project 2022. Adamson University</span><br /><span>Contact: <a href="tel:8354-926">tel:8354-926</a> | Email: <a href="mailto:admission@adamson.edu.ph">admission@adamson.edu.ph</a></span></footer>
    </>
  );
}

export function Notice({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return <div className={`alert ${error ? 'error' : ''}`} role="status">{error || success}</div>;
}

export function AuthForm({ role }: { role: 'voter' | 'admin' }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      await api('/api/auth', { method: 'POST', body: JSON.stringify({ role, identity: form.get('identity'), password: form.get('password') }) });
      router.push(role === 'admin' ? '/admin/dashboard' : '/ballot');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in.');
      setBusy(false);
    }
  }
  return <form onSubmit={submit}>
    <div className="field"><label htmlFor="identity">{role === 'admin' ? 'Username' : 'Student ID'}</label><input id="identity" name="identity" required autoComplete="username" placeholder={role === 'admin' ? 'Administrator username' : 'Your student ID'} /></div>
    <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" name="password" required autoComplete={role === 'admin' ? 'current-password' : 'current-password'} /></div>
    <Notice error={error} /><button className="button full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</button>
  </form>;
}
