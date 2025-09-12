import { useEffect, useState } from 'react';

function getToken() { return (typeof window !== 'undefined') ? localStorage.getItem('token') : null; }
function getTenantSlug() { return (typeof window !== 'undefined') ? localStorage.getItem('tenantSlug') : null; }
function getUserRole() { return (typeof window !== 'undefined') ? localStorage.getItem('userRole') : null; }

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [err, setErr] = useState('');
  const [limitHit, setLimitHit] = useState(false);

  useEffect(()=>{ fetchNotes(); }, []);

  async function fetchNotes() {
    const token = getToken();
    if (!token) { setErr('Not logged in'); return; }
    const res = await fetch('/api/notes', { headers: { Authorization: `Bearer ${token}` }});
    if (!res.ok) {
      setErr('Failed to load notes');
      return;
    }
    const data = await res.json();
    setNotes(data);
  }

  async function createNote(e) {
    e.preventDefault();
    setErr('');
    const token = getToken();
    if (!token) { setErr('Not logged in'); return; }
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
      body: JSON.stringify({ title, content })
    });
    if (res.status === 403) {
      const body = await res.json();
      if (body.error === 'Note limit reached') {
        setLimitHit(true);
        return;
      }
    }
    if (!res.ok) {
      setErr('Create failed');
      return;
    }
    const note = await res.json();
    setNotes([note, ...notes]);
    setTitle(''); setContent('');
  }

  async function deleteNote(id) {
    const token = getToken();
    if (!token) { setErr('Not logged in'); return; }
    const res = await fetch(`/api/notes/${id}`, { method:'DELETE', headers: { Authorization: `Bearer ${token}` }});
    if (res.ok) setNotes(notes.filter(n=>n.id!==id));
  }

  async function upgradeTenant() {
    const token = getToken();
    const slug = getTenantSlug();
    const res = await fetch(`/api/tenants/${slug}/upgrade`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      alert('Upgraded to PRO');
      setLimitHit(false);
    } else {
      const b = await res.json();
      alert('Upgrade failed: ' + (b?.error || ''));
    }
  }

  return (
    <div style={{maxWidth:800, margin:'auto',padding:20}}>
      <h1>Notes</h1>
      <form onSubmit={createNote}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
        <br/>
        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Content" />
        <br/>
        <button>Create</button>
      </form>

      {limitHit && (
        <div style={{border:'1px solid red', padding:10, marginTop:10}}>
          <p>You have reached your Free plan limit (3 notes).</p>
          {getUserRole() === 'ADMIN' ? (
            <button onClick={upgradeTenant}>Upgrade to Pro</button>
          ) : (
            <p>Ask your Admin to upgrade to Pro.</p>
          )}
        </div>
      )}

      <ul>
        {notes.map(n => (
          <li key={n.id}>
            <h3>{n.title}</h3>
            <p>{n.content}</p>
            <button onClick={()=>deleteNote(n.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
