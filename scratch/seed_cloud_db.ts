import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

async function main() {
  const adminPassword = 'admin123';
  const hashed = await hashPassword(adminPassword);

  console.log('Inserting admin user...');
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashed },
    create: {
      name: 'مدير النظام',
      username: 'admin',
      password: hashed,
      role: 'admin',
    },
  });

  console.log('Admin user created/updated successfully:', admin.username);
  
  // Seed some settings
  const settings = [
    { keyName: 'app_name', keyValue: 'براعم تحفيظ القرآن الكريم' },
    { keyName: 'registration_enabled', keyValue: '1' }
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { keyName: s.keyName },
      update: { keyValue: s.keyValue },
      create: s,
    });
  }
  
  console.log('Settings seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
