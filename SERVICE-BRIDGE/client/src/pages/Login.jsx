import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { errorText } from '../api.js';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try { const u = await login(form); nav(`/${u.role}`); }
    catch (err) { setError(errorText(err)); }
    finally { setBusy(false); }
  }

  return (
    <main className="wrap narrow">
      <h1>Log in</h1>
      <form className="card" onSubmit={submit}>
        <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Password<input type="password" value={form.password} onChange={set('password')} required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
        <p>New here? <Link to="/register">Create an account</Link></p>
      </form>
    </main>
  );
}
