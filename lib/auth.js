import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this';

export function signToken(user, tenantSlug) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenantSlug
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function validateUserCredentials(email, password) {
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId }});
  return { user, tenant };
}
