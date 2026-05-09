import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'crypto';

const prisma = new PrismaClient();

function hash(p: string) {
  const s = randomBytes(16).toString('hex');
  const k = scryptSync(p, s, 64);
  return `scrypt:${s}:${k.toString('hex')}`;
}

async function main() {
  const superadmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { password: hash('super@2026'), role: 'superadmin' },
    create: {
      name: 'مشغل النظام',
      username: 'superadmin',
      password: hash('super@2026'),
      role: 'superadmin',
      phone: '01000000000',
    },
  });
  console.log('✅ Super Admin created:', superadmin.username);
  console.log('   Password: super@2026');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
