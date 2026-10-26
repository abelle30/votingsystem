'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api, Notice, Shell } from '@/components/ui';

export default function SetupPage() {
  const router=useRouter();
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');const data=new FormData(event.currentTarget);try{await api('/api/setup',{method:'POST',body:JSON.stringify({token:data.get('token'),username:data.get('username'),password:data.get('password')})});router.push('/admin');}catch(cause){setError(cause instanceof Error?cause.message:'Setup failed.');setBusy(false);}}
  return <Shell><main className="auth-wrap"><section className="auth-card"><div className="eyebrow">First-time setup</div><h1>Create administrator</h1><p className="auth-subtitle">Use the one-time setup token configured in the deployment environment. Setup closes automatically after the first admin is created.</p><form onSubmit={submit}><div className="field"><label htmlFor="token">Setup token</label><input id="token" name="token" type="password" autoComplete="off" required minLength={24}/></div><div className="field"><label htmlFor="username">Administrator username</label><input id="username" name="username" required minLength={3} maxLength={100} autoComplete="username"/></div><div className="field"><label htmlFor="password">Strong password</label><input id="password" name="password" type="password" required minLength={12} maxLength={200} autoComplete="new-password"/></div><Notice error={error}/><button className="button full" disabled={busy}>{busy?'Creating administrator…':'Create administrator'}</button></form><Link className="back-link" href="/admin">Already set up? Sign in</Link></section></main></Shell>;
}
