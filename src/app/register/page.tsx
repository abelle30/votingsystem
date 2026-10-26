'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api, Notice, Shell } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const values = new FormData(event.currentTarget);
    try {
      await api('/api/register', { method: 'POST', body: JSON.stringify({ studentId: values.get('studentId'), fullName: values.get('fullName'), password: values.get('password') }) });
      router.push('/login?registered=1');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Registration failed.');
      setBusy(false);
    }
  }
  return <Shell><main className="auth-wrap"><section className="auth-card"><div className="eyebrow">Voter registration</div><h1>Create your account</h1><p className="auth-subtitle">Registration is limited to student IDs added by an election administrator.</p><form onSubmit={submit}><div className="field"><label htmlFor="studentId">Student ID</label><input id="studentId" name="studentId" required maxLength={12} autoComplete="username" placeholder="Your eligible student ID"/></div><div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" required maxLength={225} autoComplete="name"/><span className="muted" style={{fontSize:12}}>Enter the name exactly as it appears on the eligible voter list.</span></div><div className="field"><label htmlFor="password">Create password</label><input id="password" name="password" type="password" minLength={12} maxLength={200} required autoComplete="new-password"/><span className="muted" style={{fontSize:12}}>Use at least 12 characters.</span></div><Notice error={error}/><button className="button full" disabled={busy}>{busy?'Creating account…':'Create voter account'}</button></form><Link className="back-link" href="/login">Already registered? Sign in</Link></section></main></Shell>;
}
