import setCors from '../_cors';
import { validateUserCredentials, signToken } from '../../../lib/auth';

export default async function handler(req, res) {
  setCors(res);
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing' });

  const result = await validateUserCredentials(email, password);
  if (!result) return res.status(401).json({ error: 'Invalid credentials' });

  const { user, tenant } = result;
  const token = signToken(user, tenant.slug);
  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
    tenant: { id: tenant.id, slug: tenant.slug, plan: tenant.plan }
  });
}
