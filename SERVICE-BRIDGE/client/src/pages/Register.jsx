import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { errorText } from '../api.js';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer', city: 'Shivamogga' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try { const u = await register(form); nav(`/${u.role}`); }
    catch (err) { setError(errorText(err)); }
    finally { setBusy(false); }
  }

  return (
    <main className="wrap narrow">
      <h1>Create your account</h1>
      <form className="card" onSubmit={submit}>
        <label>I am a
          <select value={form.role} onChange={set('role')}>
            <option value="customer">Customer</option>
            <option value="professional">Service professional</option>
          </select>
        </label>
        <label>Full name<input value={form.name} onChange={set('name')} required /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Mobile number<input inputMode="numeric" maxLength={10} value={form.phone} onChange={set('phone')} required /></label>
        <label>City
          <select value={form.city} onChange={set('city')}>
            <option>Shivamogga</option>
            <option>Bengaluru</option>
          </select>
        </label>
        <label>Password<input type="password" value={form.password} onChange={set('password')} required /></label>
        <small>At least 8 characters with a letter and a number.</small>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
        <p>Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </main>
  );
}
