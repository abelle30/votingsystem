'use client';

import { useEffect, useState } from 'react';
import { api, Shell } from '@/components/ui';

type Candidate = { candidate_id: number; position: string; firstname: string; lastname: string; year_level: string; party: string };

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api<{ candidates: Candidate[] }>('/api/candidates');
        setCandidates(data.candidates);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Candidates are unavailable.');
      }
    };
    void load();
  }, []);
  const positions = candidates.reduce<Record<string, Candidate[]>>((groups, candidate) => {
    (groups[candidate.position] ??= []).push(candidate);
    return groups;
  }, {});
  return <Shell><main className="dashboard"><h1 className="page-title">Candidates</h1>{error ? <div className="alert error">{error}</div> : Object.keys(positions).length === 0 ? <div className="empty">No candidates have been added yet.</div> : <div className="position-grid">{Object.entries(positions).map(([position, entries]) => <section className="position-card" key={position}><h2>{position}</h2><div className="table-wrap"><table><thead><tr><th>Name</th><th>Year</th><th>Party</th></tr></thead><tbody>{entries.map((candidate) => <tr key={candidate.candidate_id}><td>{candidate.firstname} {candidate.lastname}</td><td>{candidate.year_level || '—'}</td><td>{candidate.party || '—'}</td></tr>)}</tbody></table></div></section>)}</div>}</main></Shell>;
}
