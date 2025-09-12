import { verifyToken } from './auth';
import prisma from './prisma';

export async function requireAuth(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token' });
    return null;
  }
  const token = auth.slice(7);
  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
  const user = await prisma.user.findUnique({ where: { id: payload.userId }});
  if (!user) { res.status(401).json({ error: 'User not found' }); return null; }
  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId }});
  if (!tenant) { res.status(500).json({ error: 'Tenant not found' }); return null; }

  req.user = user;
  req.tenant = tenant;
  return { user, tenant };
}
