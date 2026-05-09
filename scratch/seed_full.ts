import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 64);
  return `scrypt:${salt}:${key.toString('hex')}`;
}

async function main() {
  console.log('🌱 بدء تعبئة قاعدة البيانات...');

  // 1. Users
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashPassword('admin123') },
    create: { name: 'مدير النظام', username: 'admin', password: hashPassword('admin123'), role: 'admin', phone: '01012345678' },
  });

  const teacher1 = await prisma.user.upsert({
    where: { username: 'teacher1' },
    update: {},
    create: { name: 'أ. محمد إبراهيم', username: 'teacher1', password: hashPassword('teacher123'), role: 'teacher', phone: '01112345678' },
  });

  const teacher2 = await prisma.user.upsert({
    where: { username: 'teacher2' },
    update: {},
    create: { name: 'أ. أحمد عبدالله', username: 'teacher2', password: hashPassword('teacher123'), role: 'teacher', phone: '01212345678' },
  });

  console.log('✅ تم إنشاء المستخدمين');

  // 2. Classes
  const class1 = await prisma.class.upsert({
    where: { id: 'class-1' },
    update: {},
    create: { id: 'class-1', name: 'الفصل الأول - المبتدئون', teacherId: teacher1.id, description: 'طلاب في المراحل الأولى من الحفظ' },
  });

  const class2 = await prisma.class.upsert({
    where: { id: 'class-2' },
    update: {},
    create: { id: 'class-2', name: 'الفصل الثاني - المتوسطون', teacherId: teacher1.id, description: 'طلاب في المرحلة المتوسطة' },
  });

  const class3 = await prisma.class.upsert({
    where: { id: 'class-3' },
    update: {},
    create: { id: 'class-3', name: 'الفصل الثالث - المتقدمون', teacherId: teacher2.id, description: 'طلاب في المرحلة المتقدمة' },
  });

  console.log('✅ تم إنشاء الفصول');

  // 3. Students
  const studentsData = [
    { name: 'عمر محمد أحمد علي', gender: 'male', classId: class1.id, parentName: 'محمد أحمد علي', parentPhone: '01022222222', noorAlBayanLevel: 3, birthDate: '2016-03-15' },
    { name: 'آية عبدالرحمن سيد', gender: 'female', classId: class3.id, parentName: 'عبدالرحمن سيد', parentPhone: '01220947088', noorAlBayanLevel: 8, birthDate: '2015-07-20' },
    { name: 'يوسف إبراهيم حسن', gender: 'male', classId: class2.id, parentName: 'إبراهيم حسن', parentPhone: '01033333333', noorAlBayanLevel: 5, birthDate: '2016-01-10' },
    { name: 'فاطمة علي محمود', gender: 'female', classId: class1.id, parentName: 'علي محمود', parentPhone: '01044444444', noorAlBayanLevel: 2, birthDate: '2017-05-05' },
    { name: 'أحمد خالد رضا', gender: 'male', classId: class3.id, parentName: 'خالد رضا', parentPhone: '01055555555', noorAlBayanLevel: 10, birthDate: '2014-09-12' },
    { name: 'مريم طارق سالم', gender: 'female', classId: class2.id, parentName: 'طارق سالم', parentPhone: '01066666666', noorAlBayanLevel: 6, birthDate: '2015-11-25' },
    { name: 'إبراهيم عمر شريف', gender: 'male', classId: class1.id, parentName: 'عمر شريف', parentPhone: '01077777777', noorAlBayanLevel: 1, birthDate: '2017-02-18' },
    { name: 'زينب حسن فارق', gender: 'female', classId: class3.id, parentName: 'حسن فارق', parentPhone: '01088888888', noorAlBayanLevel: 9, birthDate: '2014-06-30' },
    { name: 'عبدالله سامي ناصر', gender: 'male', classId: class2.id, parentName: 'سامي ناصر', parentPhone: '01099999999', noorAlBayanLevel: 4, birthDate: '2016-08-14' },
    { name: 'نور الهدى جمال', gender: 'female', classId: class2.id, parentName: 'جمال وفاء', parentPhone: '01010101010', noorAlBayanLevel: 7, birthDate: '2015-04-22' },
  ];

  const students: any[] = [];
  for (const s of studentsData) {
    const student = await prisma.student.create({
      data: { ...s, approvalStatus: 'approved', active: true },
    });
    students.push(student);
  }

  console.log(`✅ تم إنشاء ${students.length} طلاب`);

  // 4. Attendance (last 7 days)
  const today = new Date();
  for (let d = 6; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    for (const student of students) {
      const rand = Math.random();
      const status = rand > 0.85 ? 'absent' : rand > 0.75 ? 'late' : 'present';
      try {
        await prisma.attendance.create({
          data: { studentId: student.id, date: dateStr, status, recordedBy: teacher1.id },
        });
      } catch (_) {}
    }
  }

  console.log('✅ تم إنشاء سجلات الحضور');

  // 5. Memorization records
  const surahs = [
    { num: 78, name: 'النبأ' }, { num: 79, name: 'النازعات' }, { num: 80, name: 'عبس' },
    { num: 81, name: 'التكوير' }, { num: 87, name: 'الأعلى' }, { num: 112, name: 'الإخلاص' },
    { num: 113, name: 'الفلق' }, { num: 114, name: 'الناس' },
  ];
  const grades = ['excellent', 'very_good', 'good', 'acceptable'];
  const types = ['sabak', 'sabqi', 'manzil'];

  for (let i = 0; i < 30; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const surah = surahs[Math.floor(Math.random() * surahs.length)];
    const date = new Date();
    date.setDate(today.getDate() - Math.floor(Math.random() * 14));
    await prisma.memorization.create({
      data: {
        studentId: student.id,
        type: types[Math.floor(Math.random() * types.length)],
        surahNumber: surah.num,
        surahName: surah.name,
        fromAyah: 1,
        toAyah: 10,
        totalAyahs: 10,
        grade: grades[Math.floor(Math.random() * grades.length)],
        date: date.toISOString().split('T')[0],
        teacherId: Math.random() > 0.5 ? teacher1.id : teacher2.id,
      },
    });
  }

  console.log('✅ تم إنشاء سجلات الحفظ');

  // 6. Payments
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
  for (const student of students.slice(0, 8)) {
    for (const month of months) {
      await prisma.payment.create({
        data: {
          studentId: student.id,
          amount: 150,
          type: 'monthly',
          month,
          year: 2026,
          paymentDate: `${month}-01`,
          receivedBy: admin.id,
          notes: `رسوم شهر ${month}`,
        },
      });
    }
  }

  console.log('✅ تم إنشاء سجلات المدفوعات');

  // 7. Settings
  await prisma.setting.upsert({ where: { keyName: 'app_name' }, update: {}, create: { keyName: 'app_name', keyValue: 'براعم تحفيظ القرآن الكريم' } });
  await prisma.setting.upsert({ where: { keyName: 'contact_phone' }, update: {}, create: { keyName: 'contact_phone', keyValue: '01220947088' } });
  await prisma.setting.upsert({ where: { keyName: 'registration_enabled' }, update: {}, create: { keyName: 'registration_enabled', keyValue: '1' } });

  console.log('✅ تم إنشاء الإعدادات');
  console.log('\n🎉 اكتملت التعبئة بنجاح!');
  console.log('   👤 admin / admin123');
  console.log('   👤 teacher1 / teacher123');
  console.log(`   👨‍🎓 ${students.length} طالب`);
  console.log('   📚 3 فصول');
  console.log('   📖 30 سجل حفظ');
  console.log('   💰 40 دفعة مالية');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
