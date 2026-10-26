'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { api, Notice, Shell } from '@/components/ui';

type Candidate = { candidate_id: number; position: string; firstname: string; lastname: string; year_level: string; gender: string; party: string };
type Position = { position: string; candidates: Candidate[] };

export default function BallotPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { api<{session?:{role:string}|null}>('/api/auth').then(({session})=>{if(!session || session.role!=='voter') router.replace('/login');}).then(()=>api<{positions:Position[]}>('/api/ballot')).then(({positions})=>setPositions(positions)).catch((cause)=>setError(cause instanceof Error?cause.message:'Could not load ballot.')).finally(()=>setLoading(false)); }, [router]);
  const complete = useMemo(() => positions.length > 0 && positions.every(({position})=>selections[position]), [positions,selections]);
  async function submit() {
    setBusy(true); setError('');
    try { await api('/api/ballot',{method:'POST',body:JSON.stringify({selections})}); setSubmitted(true); setError(''); } catch(cause) { setError(cause instanceof Error?cause.message:'Could not submit ballot.'); setBusy(false); }
  }
  return <Shell signedIn role="voter"><main className="shell dashboard"><div className="dash-head"><div><div className="eyebrow">Official student ballot</div><h1>{submitted?'Vote recorded':'Make your voice count'}</h1><p>{submitted?'Your ballot was submitted successfully. Each selection has been recorded.':'Choose one candidate for every position. Your selections are submitted together.'}</p></div><Link href="/" className="button secondary">Home</Link></div>
    {submitted ? <section className="panel"><div className="empty"><div className="avatar" style={{margin:'0 auto 14px',width:48,height:48}}>✓</div><h2>Thank you for voting</h2><p>Your ballot has been securely recorded. You can now sign out.</p></div></section> : loading ? <section className="panel"><p className="muted">Loading ballot…</p></section> : <>
      <section className="panel"><h2>Your choices</h2><p className="panel-intro">Select exactly one candidate in each position.</p>{positions.length===0?<div className="empty">No candidates have been added yet. Contact the election administrator.</div>:<div className="position-grid">{positions.map(({position,candidates})=><section className="position-card" key={position}><h3>{position}</h3>{candidates.map(candidate=><label className="candidate-option" key={candidate.candidate_id}><input type="radio" name={position} value={candidate.candidate_id} checked={selections[position]===candidate.candidate_id} onChange={()=>setSelections(current=>({...current,[position]:candidate.candidate_id}))}/><span><span className="candidate-name">{candidate.firstname} {candidate.lastname}</span><span className="candidate-meta">{[candidate.year_level,candidate.party].filter(Boolean).join(' · ')||'Candidate'}</span></span></label>)}</section>)}</div>}<Notice error={error}/><button className="button" style={{marginTop:18}} disabled={!complete||busy||positions.length===0} onClick={submit}>{busy?'Submitting ballot…':'Submit completed ballot'}</button></section>
    </>}</main></Shell>;
}
