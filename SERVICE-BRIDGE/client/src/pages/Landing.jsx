import { Link } from 'react-router-dom';

const services = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'AC install and repair', 'Home cleaning', 'Appliance repair', 'More services'];
const steps = [
  ['Describe your problem', 'Choose a category, add details and your address.'],
  ['Compare quotations', 'Professionals send prices; you compare and choose.'],
  ['Confirm with OTP', 'Work starts and ends only with OTP confirmation.'],
  ['Pay and review', 'Pay online and rate your professional.'],
];

export default function Landing() {
  return (
    <main>
      <section className="hero wrap">
        <span className="pill">Shivamogga and Bengaluru</span>
        <h1>Trusted local help for your home, one booking away.</h1>
        <p>Find verified independent professionals, compare quotations, and confirm every visit with a secure OTP.</p>
        <div className="row"><Link to="/register" className="btn">Get started</Link><Link to="/login" className="btn ghost">Log in</Link></div>
      </section>
      <section className="wrap">
        <h2>Services</h2>
        <div className="grid">{services.map((s) => <div className="card" key={s}><strong>{s}</strong></div>)}</div>
      </section>
      <section className="band">
        <div className="wrap">
          <h2>How it works</h2>
          <div className="grid">{steps.map(([t, d], i) => <div className="card" key={t}><span className="num">{i + 1}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
        </div>
      </section>
      <footer className="foot">ServiceBridge · Academic prototype · PESITM, Shivamogga</footer>
    </main>
  );
}
