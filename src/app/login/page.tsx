'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthForm, Shell } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  return <Shell><main className="auth-wrap"><section className="auth-card"><div style={{textAlign:'center',marginBottom:18}}>Login As:<select aria-label="Login as" defaultValue="voter" onChange={(event)=>{if(event.target.value==='admin') router.push('/admin');}} style={{display:'block',margin:'8px auto',padding:7,color:'green'}}><option value="admin">System CSCA</option><option value="voter">Student Voter</option></select></div><h1 style={{textAlign:'center'}}>Student Login</h1><AuthForm role="voter"/><Link className="button full" href="/register" style={{marginTop:10}}>Register</Link></section></main></Shell>;
}
