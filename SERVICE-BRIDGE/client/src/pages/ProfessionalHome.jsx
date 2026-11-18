import { useEffect, useState } from 'react';
import { api, errorText } from '../api.js';
import ProfessionalLocation from './ProfessionalLocation.jsx';
import VideoVerificationCard from './VideoVerificationCard.jsx';
import '../phase2.css';

const LABEL = { pending: 'Pending', under_review: 'Under review', approved: 'Approved', rejected: 'Rejected', suspended: 'Suspended' };
const split = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

export default function ProfessionalHome() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ bio: '', categories: [], skills: '', experienceYears: 0, serviceAreas: '', city: 'Shivamogga' });
  const [doc, setDoc] = useState({ docType: 'identity', documentRef: '', consent: false });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [cats, setCats] = useState([]);

  async function load() {
    const d = (await api.get('/professionals/me')).data.data;
    setData(d);
    if (d.profile) {
      const p = d.profile;
      setForm({ bio: p.bio || '', categories: p.categories, skills: p.skills.join(', '), experienceYears: p.experienceYears, serviceAreas: p.serviceAreas.join(', '), city: p.city || 'Shivamogga' });
    }
  }
  useEffect(() => { api.get('/categories').then((r) => setCats(r.data.data.items)); }, []);
  useEffect(() => { load().catch((e) => setMsg({ type: 'error', text: errorText(e) })); }, []);

  async function run(fn, okText) {
    setMsg({ type: '', text: '' });
    try { await fn(); await load(); setMsg({ type: 'ok', text: okText }); }
    catch (e) { setMsg({ type: 'error', text: errorText(e) }); }
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggle = (c) => setForm({ ...form, categories: form.categories.includes(c) ? form.categories.filter((x) => x !== c) : [...form.categories, c] });

  if (!data) return <p className="center">Loading…</p>;
  const p = data.profile;
  const editable = !p || ['pending', 'rejected'].includes(p.status);

  return (
    <main className="wrap">
      <h1>Professional dashboard</h1>
      <div className="card">
        <p>Verification status: <span className={`badge ${p?.status || 'pending'}`}>{p ? LABEL[p.status] : 'Profile not created'}</span></p>
        {p?.status === 'rejected' && <p className="error">Reason: {p.rejectionReason}</p>}
        {p?.status === 'under_review' && <p>An admin is reviewing your details.</p>}
        {p?.status === 'approved' && <p>You are verified and can receive customer requests (coming in a later phase).</p>}
        {p?.status === 'suspended' && <p className="error">Your account is suspended. Reason: {p.rejectionReason}</p>}
      </div>
      {msg.text && <p className={msg.type === 'error' ? 'error' : 'ok'} role="alert">{msg.text}</p>}

      <h2>1. Your profile</h2>
      <form className="card" onSubmit={(e) => { e.preventDefault(); run(() => api.put('/professionals/profile', { ...form, skills: split(form.skills), serviceAreas: split(form.serviceAreas), experienceYears: Number(form.experienceYears) }), 'Profile saved'); }}>
        <fieldset disabled={!editable} style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          <div className="checks">{cats.map((c) => <label key={c.slug}><input type="checkbox" checked={form.categories.includes(c.slug)} onChange={() => toggle(c.slug)} />{c.name}</label>)}</div>
          <label>About you<input value={form.bio} onChange={set('bio')} maxLength={500} /></label>
          <label>Skills (comma separated)<input value={form.skills} onChange={set('skills')} /></label>
          <label>Years of experience<input type="number" min="0" max="60" value={form.experienceYears} onChange={set('experienceYears')} /></label>
          <label>Service areas (comma separated)<input value={form.serviceAreas} onChange={set('serviceAreas')} /></label>
          <label>City<select value={form.city} onChange={set('city')}><option>Shivamogga</option><option>Bengaluru</option></select></label>
          <button className="btn">Save profile</button>
        </fieldset>
      </form>

      {p && <ProfessionalLocation profile={p} onChange={load} />}
      {p?.status === 'under_review' && <VideoVerificationCard />}

      <h2>2. Verification documents (demo)</h2>
      <div className="card">
        <p>Use fake reference text only, for example “DEMO-1234”. Never enter real ID numbers in this prototype.</p>
        <ul>{data.documents.map((d) => <li key={d._id}>{d.docType}: {d.documentRef}</li>)}</ul>
        {editable && p && (
          <form onSubmit={(e) => { e.preventDefault(); run(() => api.post('/professionals/documents', doc), 'Document added'); }} style={{ display: 'grid', gap: 12 }}>
            <label>Type<select value={doc.docType} onChange={(e) => setDoc({ ...doc, docType: e.target.value })}><option value="identity">Identity</option><option value="address">Address</option><option value="skill_certificate">Skill certificate</option></select></label>
            <label>Demo reference<input value={doc.documentRef} onChange={(e) => setDoc({ ...doc, documentRef: e.target.value })} /></label>
            <label className="checks"><input type="checkbox" checked={doc.consent} onChange={(e) => setDoc({ ...doc, consent: e.target.checked })} />I consent to ServiceBridge using this only for verification.</label>
            <button className="btn ghost">Add document</button>
          </form>
        )}
      </div>

      {editable && p && (
        <>
          <h2>3. Submit for review</h2>
          <button className="btn" onClick={() => run(() => api.post('/professionals/submit'), 'Submitted for review')}>Submit for verification</button>
        </>
      )}
    </main>
  );
}
