import { useState } from 'react';
import Router from 'next/router';

export default function Index() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email, password: pw })
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || 'Login failed');
      return;
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('tenantSlug', data.tenant.slug);
    localStorage.setItem('userRole', data.user.role);
    Router.push('/notes');
  }

  return (
    <div style={{maxWidth:600, margin:'auto', padding:20}}>
      <h1>Notes SaaS — Login</h1>
      <form onSubmit={onSubmit}>
        <div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" /></div>
        <div><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="password" /></div>
        <button type="submit">Login</button>
      </form>
      {err && <p style={{color:'red'}}>{err}</p>}
      <hr />
      <p>Test accounts:</p>
      <ul>
        <li>admin@acme.test / password</li>
        <li>user@acme.test / password</li>
        <li>admin@globex.test / password</li>
        <li>user@globex.test / password</li>
      </ul>
    </div>
  );
}
