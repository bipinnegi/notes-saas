import setCors from '../_cors';
import { requireAuth } from '../../../lib/middleware';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { user, tenant } = auth;

  if (req.method === 'GET') {
    const notes = await prisma.note.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(notes);
  }

  if (req.method === 'POST') {
    const { title, content } = req.body || {};
    if (!title) return res.status(400).json({ error: 'Title required' });

    if (tenant.plan === 'FREE') {
      const count = await prisma.note.count({ where: { tenantId: tenant.id }});
      if (count >= 3) {
        return res.status(403).json({ error: 'Note limit reached', limit: 3 });
      }
    }

    const note = await prisma.note.create({
      data: {
        title, content,
        tenantId: tenant.id,
        authorId: user.id
      }
    });
    return res.status(201).json(note);
  }

  res.status(405).end();
}
