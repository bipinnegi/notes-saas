const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  // Helper to hash password
  const hashPassword = (password) => bcrypt.hashSync(password, 10);

  // Create tenants
  const acme = await prisma.tenant.upsert({
    where: { slug: 'acme' },
    update: {},
    create: { name: 'Acme Corp', slug: 'acme', plan: 'FREE' },
  });

  const globex = await prisma.tenant.upsert({
    where: { slug: 'globex' },
    update: {},
    create: { name: 'Globex Inc', slug: 'globex', plan: 'FREE' },
  });

  // Create users
  await prisma.user.upsert({
    where: { email: 'admin@acme.test' },
    update: {},
    create: {
      email: 'admin@acme.test',
      password: hashPassword('password'),
      role: 'ADMIN',
      tenantId: acme.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@acme.test' },
    update: {},
    create: {
      email: 'user@acme.test',
      password: hashPassword('password'),
      role: 'MEMBER',
      tenantId: acme.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@globex.test' },
    update: {},
    create: {
      email: 'admin@globex.test',
      password: hashPassword('password'),
      role: 'ADMIN',
      tenantId: globex.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@globex.test' },
    update: {},
    create: {
      email: 'user@globex.test',
      password: hashPassword('password'),
      role: 'MEMBER',
      tenantId: globex.id,
    },
  });
}

main()
  .then(() => {
    console.log('Seeding completed 🌱');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
