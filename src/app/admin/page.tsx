import Link from 'next/link';
import { AuthForm, Shell } from '@/components/ui';

export default function AdminLoginPage() {
  return <Shell><main className="auth-wrap"><section className="auth-card"><div className="eyebrow">Election management</div><h1>Administrator sign in</h1><p className="auth-subtitle">Manage eligible voters, candidates, and election results.</p><AuthForm role="admin"/><Link className="back-link" href="/">Return to voting portal</Link></section></main></Shell>;
}
