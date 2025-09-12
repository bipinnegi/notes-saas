import setCors from '../../_cors';
import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/middleware';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { slug } = req.query;
  const auth = await requireAuth(req, res);
  if (!auth) return;

  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Only admin' });
  if (req.tenant.slug !== slug) return res.status(403).json({ error: 'Tenant mismatch' });

  await prisma.tenant.update({
    where: { slug },
    data: { plan: 'PRO' }
  });

  res.json({ ok: true, newPlan: 'PRO' });
}
