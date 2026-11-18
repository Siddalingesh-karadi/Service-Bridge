import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorText } from '../api.js';
import '../phase2.css';

const STATUSES = ['under_review', 'approved', 'rejected', 'suspended', 'pending'];

export default function AdminHome() {
  const [status, setStatus] = useState('under_review');
  const [items, setItems] = useState([]);
  const [sel, setSel] = useState(null);
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');

  const loadList = () => api.get('/admin/professionals', { params: { status } }).then((r) => setItems(r.data.data.items)).catch((e) => setMsg(errorText(e)));
  useEffect(() => { setSel(null); loadList(); }, [status]);

  const open = (id) => api.get(`/admin/professionals/${id}`).then((r) => { setSel(r.data.data); setReason(''); setMsg(''); }).catch((e) => setMsg(errorText(e)));
  async function decide(decision) {
    setMsg('');
    try { await api.patch(`/admin/professionals/${sel.profile._id}/decision`, { decision, reason }); setSel(null); await loadList(); setMsg(`Done: ${decision}`); }
    catch (e) { setMsg(errorText(e)); }
  }

  return (
    <main className="wrap">
      <h1>Admin: professional verification</h1>
      <Link to="/admin/categories">Manage service categories</Link> · <Link to="/admin/payments">Payments and payouts</Link> · <Link to="/admin/video">Video verification</Link> · <Link to="/admin/complaints">Complaints</Link> · <Link to="/admin/analytics">Analytics</Link>
      <label style={{ maxWidth: 240 }}>Show<select value={status} onChange={(e) => setStatus(e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select></label>
      {msg && <p className={msg.startsWith('Done') ? 'ok' : 'error'} role="alert">{msg}</p>}
      <div className="split" style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
          {items.length === 0 && <p>No professionals with this status.</p>}
          {items.map((i) => <button key={i._id} className={`item ${sel?.profile._id === i._id ? 'on' : ''}`} onClick={() => open(i._id)}><strong>{i.userId?.name}</strong><br /><small>{i.categories.join(', ')} · {i.city}</small></button>)}
        </div>
        <div className="card">
          {!sel ? <p>Select a professional to review.</p> : (
            <>
              <h2 style={{ margin: 0 }}>{sel.profile.userId?.name} <span className={`badge ${sel.profile.status}`}>{sel.profile.status.replace('_', ' ')}</span></h2>
              <p>{sel.profile.userId?.email} · {sel.profile.userId?.phone}</p>
              <p><strong>Categories:</strong> {sel.profile.categories.join(', ')}<br /><strong>Skills:</strong> {sel.profile.skills.join(', ') || '-'}<br /><strong>Experience:</strong> {sel.profile.experienceYears} years<br /><strong>Areas:</strong> {sel.profile.serviceAreas.join(', ') || '-'}<br /><strong>About:</strong> {sel.profile.bio || '-'}</p>
              <p><strong>Documents:</strong></p>
              <ul>{sel.documents.map((d) => <li key={d._id}>{d.docType}: {d.documentRef}</li>)}</ul>
              <label>Reason (required for reject or suspend)<input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} /></label>
              <div className="row">
                <button className="btn" onClick={() => decide('approve')}>Approve</button>
                <button className="btn ghost" onClick={() => decide('reject')}>Reject</button>
                <button className="btn ghost" onClick={() => decide('suspend')}>Suspend</button>
              </div>
              <small>Live video verification will be added in a later phase. Until then, review is based on submitted details.</small>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
