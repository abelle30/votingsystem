'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, Notice, Shell } from '@/components/ui';

type Candidate = { candidate_id: number; position: string; firstname: string; lastname: string; year_level: string; party: string };
type Eligibility = { id_number: string; names: string; voters_id: number | null; status: string | null; account: string | null };
type Result = { position: string; candidate_id: number; firstname: string; lastname: string; party: string; votes: number };
type ElectionTotals = { registered: number | string; voted: number | string };
type Groups = Record<string, Result[]>;

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'candidates' | 'voters' | 'results'>('overview');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [eligibility, setEligibility] = useState<Eligibility[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [totals, setTotals] = useState<ElectionTotals>({ registered: 0, voted: 0 });
  const [electionOpen, setElectionOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const auth = await api<{ session?: { role: string } | null }>('/api/auth');
    if (!auth.session || auth.session.role !== 'admin') {
      router.replace('/admin');
      return;
    }
    const [candidateData, voterData, election] = await Promise.all([
      api<{ candidates: Candidate[] }>('/api/admin/candidates'),
      api<{ eligibleVoters: Eligibility[] }>('/api/admin/eligibility'),
      api<{ isOpen: boolean }>('/api/admin/election'),
    ]);
    const resultData = election.isOpen ? { results: [] as Result[], totals: { registered: 0, voted: 0 } } : await api<{ results: Result[]; totals: ElectionTotals }>('/api/admin/results');
    setCandidates(candidateData.candidates);
    setEligibility(voterData.eligibleVoters);
    setResults(resultData.results);
    setTotals(resultData.totals);
    setElectionOpen(election.isOpen);
  }, [router]);

  useEffect(() => {
    const load = async () => {
      try {
        await refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Unable to load dashboard.');
      }
    };
    void load();
  }, [refresh]);

  async function addCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    const values = new FormData(event.currentTarget);
    try {
      await api('/api/admin/candidates', {
        method: 'POST',
        body: JSON.stringify({ position: values.get('position'), firstname: values.get('firstname'), lastname: values.get('lastname'), yearLevel: values.get('yearLevel'), party: values.get('party') }),
      });
      event.currentTarget.reset();
      setSuccess('Candidate added.');
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to add candidate.');
    } finally {
      setBusy(false);
    }
  }

  async function addVoter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    const values = new FormData(event.currentTarget);
    try {
      await api('/api/admin/eligibility', { method: 'POST', body: JSON.stringify({ studentId: values.get('studentId'), names: values.get('names') }) });
      event.currentTarget.reset();
      setSuccess('Student added to eligible voter list.');
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to add student.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteCandidate(id: number) {
    if (!confirm('Remove this candidate? Candidates with votes cannot be deleted.')) return;
    setError('');
    setSuccess('');
    try {
      await api('/api/admin/candidates', { method: 'DELETE', body: JSON.stringify({ candidateId: id }) });
      setSuccess('Candidate removed.');
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to remove candidate.');
    }
  }

  async function toggleElection() {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const result = await api<{ message: string; isOpen: boolean }>('/api/admin/election', { method: 'POST', body: JSON.stringify({ isOpen: !electionOpen }) });
      setElectionOpen(result.isOpen);
      setSuccess(result.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update election status.');
    } finally {
      setBusy(false);
    }
  }

  const groupedResults = results.reduce<Groups>((groups, row) => {
    (groups[row.position] ??= []).push(row);
    return groups;
  }, {});
  const positionsCount = new Set(candidates.map((candidate) => candidate.position)).size;

  return (
    <Shell signedIn role="admin">
      <main className="shell dashboard">
        <div className="dash-head">
          <div><div className="eyebrow">Election control room</div><h1>Admin dashboard</h1><p>Manage the ballot and review election activity.</p></div>
          <button className="button secondary" onClick={() => refresh().catch((cause) => setError(cause.message))}>Refresh data</button>
        </div>
        <div className="tabs">
          {(['overview', 'candidates', 'voters', 'results'] as const).map((key) => (
            <button key={key} onClick={() => setTab(key)} className={`tab ${tab === key ? 'active' : ''}`}>
              {key === 'overview' ? 'Overview' : key === 'candidates' ? 'Candidates' : key === 'voters' ? 'Eligible voters' : 'Results'}
            </button>
          ))}
        </div>
        <Notice error={error} success={success} />

        {tab === 'overview' && <>
          <div className="stat-grid">
            <div className="stat"><strong>{Number(totals.registered || 0)}</strong><span>Registered voters</span></div>
            <div className="stat"><strong>{Number(totals.voted || 0)}</strong><span>Voters submitted</span></div>
            <div className="stat"><strong>{candidates.length}</strong><span>Ballot candidates</span></div>
          </div>
          <section className="panel">
            <h2>Election control</h2>
            <p className="panel-intro">{electionOpen ? 'Voting is open. Candidate changes are locked.' : 'Review the ballot carefully before opening voting.'}</p>
            <span className="status-pill">{electionOpen ? 'Voting open' : 'Voting closed'}</span>
            <div><button className={`button ${electionOpen ? 'danger' : ''}`} style={{ marginTop: 16 }} onClick={toggleElection} disabled={busy}>{busy ? 'Updating…' : electionOpen ? 'Close voting' : 'Open voting'}</button></div>
          </section>
          <section className="panel">
            <h2>Election setup</h2><p className="panel-intro">Add candidates and eligible student IDs before opening voting.</p>
            <div className="admin-grid">
              <div><span className="status-pill">{candidates.length ? 'Candidates ready' : 'Needs candidates'}</span><p className="muted">{positionsCount} ballot positions configured.</p><button className="button secondary" onClick={() => setTab('candidates')}>Manage candidates</button></div>
              <div><span className="status-pill">{eligibility.length} IDs on list</span><p className="muted">Only students on the eligibility list can register.</p><button className="button secondary" onClick={() => setTab('voters')}>Manage eligible voters</button></div>
            </div>
          </section>
          {!electionOpen && <section className="panel"><h2>Current results</h2><p className="panel-intro">Vote counts are hidden while voting is open.</p><ResultsTable groups={groupedResults} /></section>}
        </>}

        {tab === 'candidates' && <div className="admin-grid">
          <section className="panel">
            <h2>Add candidate</h2><p className="panel-intro">Candidates appear in the ballot position you specify.</p>
            <form onSubmit={addCandidate}>
              <div className="field"><label>Position</label><input name="position" maxLength={100} placeholder="e.g. President" required disabled={electionOpen} /></div>
              <div className="inline-fields"><div className="field"><label>First name</label><input name="firstname" maxLength={100} required disabled={electionOpen} /></div><div className="field"><label>Last name</label><input name="lastname" maxLength={100} required disabled={electionOpen} /></div></div>
              <div className="inline-fields"><div className="field"><label>Year level</label><input name="yearLevel" maxLength={100} placeholder="Optional" disabled={electionOpen} /></div><div className="field"><label>Party / slate</label><input name="party" maxLength={100} placeholder="Optional" disabled={electionOpen} /></div></div>
              <button className="button" disabled={busy || electionOpen}>{busy ? 'Saving…' : electionOpen ? 'Voting is open' : 'Add candidate'}</button>
            </form>
          </section>
          <section className="panel"><h2>Candidate list</h2><p className="panel-intro">Candidates already on the ballot.</p>
            <div className="table-wrap"><table><thead><tr><th>Position</th><th>Name</th><th>Party</th><th /></tr></thead><tbody>
              {candidates.map((candidate) => <tr key={candidate.candidate_id}><td>{candidate.position}</td><td>{candidate.firstname} {candidate.lastname}</td><td>{candidate.party || '—'}</td><td><button className="button danger" disabled={electionOpen} onClick={() => deleteCandidate(candidate.candidate_id)}>Remove</button></td></tr>)}
            </tbody></table>{candidates.length === 0 && <div className="empty">No candidates added yet.</div>}</div>
          </section>
        </div>}

        {tab === 'voters' && <div className="admin-grid">
          <section className="panel"><h2>Add eligible student</h2><p className="panel-intro">Only IDs listed here may create voter accounts.</p>
            <form onSubmit={addVoter}><div className="field"><label>Student ID</label><input name="studentId" maxLength={12} required /></div><div className="field"><label>Official student name</label><input name="names" maxLength={225} required /></div><button className="button" disabled={busy}>{busy ? 'Saving…' : 'Add to eligible list'}</button></form>
          </section>
          <section className="panel"><h2>Eligibility list</h2><p className="panel-intro">Account status is shown when a student registers.</p>
            <div className="table-wrap"><table><thead><tr><th>Student ID</th><th>Name</th><th>Account</th><th>Vote</th></tr></thead><tbody>
              {eligibility.map((voter) => <tr key={voter.id_number}><td>{voter.id_number}</td><td>{voter.names}</td><td>{voter.voters_id ? voter.account : 'Not registered'}</td><td>{voter.status || '—'}</td></tr>)}
            </tbody></table>{eligibility.length === 0 && <div className="empty">No students on the eligibility list yet.</div>}</div>
          </section>
        </div>}

        {tab === 'results' && <section className="panel"><h2>Election results</h2><p className="panel-intro">Results are available after voting closes.</p>{electionOpen ? <div className="empty">Close voting to reveal the final results.</div> : <ResultsTable groups={groupedResults} />}</section>}
      </main>
    </Shell>
  );
}

function ResultsTable({ groups }: { groups: Groups }) {
  const entries = Object.entries(groups);
  if (entries.length === 0) return <div className="empty">No candidates or results yet. Add candidates to set up the ballot.</div>;
  return <div className="position-grid">{entries.map(([position, rows]) => <section className="position-card" key={position}><h3>{position}</h3><div className="table-wrap"><table><thead><tr><th>Candidate</th><th>Party</th><th>Votes</th></tr></thead><tbody>{rows.map((row) => <tr key={row.candidate_id}><td>{row.firstname} {row.lastname}</td><td>{row.party || '—'}</td><td><strong>{row.votes}</strong></td></tr>)}</tbody></table></div></section>)}</div>;
}
