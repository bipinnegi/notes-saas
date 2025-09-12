import setCors from '../_cors';
import { requireAuth } from '../../../lib/middleware';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { id } = req.query;
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const { tenant, user } = auth;

  const note = await prisma.note.findUnique({ where: { id }});
  if (!note) return res.status(404).json({ error: 'Not found' });
  if (note.tenantId !== tenant.id) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') return res.json(note);

  if (req.method === 'PUT') {
    const { title, content } = req.body || {};
    const updated = await prisma.note.update({
      where: { id },
      data: { title, content }
    });
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    await prisma.note.delete({ where: { id }});
    return res.json({ ok: true });
  }

  res.status(405).end();
}
