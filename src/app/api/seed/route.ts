import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { hashPassword } from '@/lib/password'

// POST - Seed database with sample data (admin only, or first-time setup if no users exist)
export async function POST(request: NextRequest) {
  try {
    // Check if any users exist - if not, allow first-time setup without auth
    const existingUsers = await db.user.count()
    if (existingUsers > 0) {
      // Require admin authentication for re-seeding
      const user = await getSession()
      if (!user) {
        return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
      }
      if (user.role !== 'admin') {
        return NextResponse.json({ error: 'صلاحيات غير كافية - يتطلب صلاحيات المدير' }, { status: 403 })
      }
    }

    // Clear existing data (respect foreign key order)
    await db.activityLog.deleteMany()
    await db.studentSkill.deleteMany()
    await db.homework.deleteMany()
    await db.memorization.deleteMany()
    await db.payment.deleteMany()
    await db.attendance.deleteMany()
    await db.student.deleteMany()
    await db.notification.deleteMany()
    await db.class.deleteMany()
    await db.setting.deleteMany()
    await db.backup.deleteMany()
    await db.user.deleteMany()

    // 1. Create admin user
    const hashedPassword = await hashPassword('admin123')
    const admin = await db.user.create({
      data: {
        name: 'مدير النظام',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        phone: '0501234567',
        email: 'admin@quran-kh.edu',
        active: true,
      },
    })

    // 2. Create 3 teachers
    const teachers = await Promise.all([
      db.user.create({
        data: {
          name: 'أحمد محمد الشريف',
          username: 'teacher1',
          password: await hashPassword('teacher123'),
          role: 'teacher',
          phone: '0551111111',
          active: true,
        },
      }),
      db.user.create({
        data: {
          name: 'خالد عبدالله العمري',
          username: 'teacher2',
          password: await hashPassword('teacher123'),
          role: 'teacher',
          phone: '0552222222',
          active: true,
        },
      }),
      db.user.create({
        data: {
          name: 'سعد إبراهيم الدوسري',
          username: 'teacher3',
          password: await hashPassword('teacher123'),
          role: 'teacher',
          phone: '0553333333',
          active: true,
        },
      }),
    ])

    // 3. Create 4 classes
    const classes = await Promise.all([
      db.class.create({
        data: {
          name: 'حفظ الفاتحة والبقرة',
          teacherId: teachers[0].id,
          description: 'مستوى مبتدئ - حفظ سورة الفاتحة والبقرة',
          active: true,
        },
      }),
      db.class.create({
        data: {
          name: 'حفظ آل عمران والنساء',
          teacherId: teachers[1].id,
          description: 'مستوى متوسط - حفظ سور آل عمران والنساء',
          active: true,
        },
      }),
      db.class.create({
        data: {
          name: 'حفظ المائدة والأنعام',
          teacherId: teachers[2].id,
          description: 'مستوى متقدم - حفظ سور المائدة والأنعام',
          active: true,
        },
      }),
      db.class.create({
        data: {
          name: 'مراجعة الجزء الأول',
          teacherId: teachers[0].id,
          description: 'مراجعة وتثبيت الجزء الأول من القرآن الكريم',
          active: true,
        },
      }),
    ])

    // 4. Create 20 students with Arabic names
    const studentData = [
      { name: 'محمد أحمد الحربي', gender: 'male', classIdx: 0, parentName: 'أحمد الحربي', parentPhone: '0561111111', approvalStatus: 'approved' },
      { name: 'عبدالرحمن سعد القحطاني', gender: 'male', classIdx: 0, parentName: 'سعد القحطاني', parentPhone: '0562222222', approvalStatus: 'approved' },
      { name: 'فاطمة علي الغامدي', gender: 'female', classIdx: 1, parentName: 'علي الغامدي', parentPhone: '0563333333', approvalStatus: 'approved' },
      { name: 'عمر ناصر المطيري', gender: 'male', classIdx: 1, parentName: 'ناصر المطيري', parentPhone: '0564444444', approvalStatus: 'approved' },
      { name: 'يوسف خالد الزهراني', gender: 'male', classIdx: 2, parentName: 'خالد الزهراني', parentPhone: '0565555555', approvalStatus: 'approved' },
      { name: 'آمنة حسن الشهري', gender: 'female', classIdx: 2, parentName: 'حسن الشهري', parentPhone: '0566666666', approvalStatus: 'approved' },
      { name: 'إبراهيم محمد العتيبي', gender: 'male', classIdx: 3, parentName: 'محمد العتيبي', parentPhone: '0567777777', approvalStatus: 'approved' },
      { name: 'نورة سليمان البقمي', gender: 'female', classIdx: 0, parentName: 'سليمان البقمي', parentPhone: '0568888888', approvalStatus: 'approved' },
      { name: 'سلطان فيصل الرشيدي', gender: 'male', classIdx: 1, parentName: 'فيصل الرشيدي', parentPhone: '0569999999', approvalStatus: 'approved' },
      { name: 'مريم عبدالعزيز السبيعي', gender: 'female', classIdx: 3, parentName: 'عبدالعزيز السبيعي', parentPhone: '0561000000', approvalStatus: 'approved' },
      { name: 'حمزة طارق الوادعي', gender: 'male', classIdx: 0, parentName: 'طارق الوادعي', parentPhone: '0562000000', approvalStatus: 'approved' },
      { name: 'زينب وليد المالكي', gender: 'female', classIdx: 2, parentName: 'وليد المالكي', parentPhone: '0563000000', approvalStatus: 'approved' },
      { name: 'أنس بدر الحارثي', gender: 'male', classIdx: 3, parentName: 'بدر الحارثي', parentPhone: '0564000000', approvalStatus: 'approved' },
      { name: 'سارة ماجد الكناني', gender: 'female', classIdx: 1, parentName: 'ماجد الكناني', parentPhone: '0565000000', approvalStatus: 'approved' },
      { name: 'بلال راشد الجهني', gender: 'male', classIdx: 0, parentName: 'راشد الجهني', parentPhone: '0566000000', approvalStatus: 'pending' },
      { name: 'هدى صالح العنزي', gender: 'female', classIdx: 2, parentName: 'صالح العنزي', parentPhone: '0567000000', approvalStatus: 'approved' },
      { name: 'أسامة عبدالرحمن الفيفي', gender: 'male', classIdx: 3, parentName: 'عبدالرحمن الفيفي', parentPhone: '0568000000', approvalStatus: 'approved' },
      { name: 'لينا عادل الشمري', gender: 'female', classIdx: 1, parentName: 'عادل الشمري', parentPhone: '0569000000', approvalStatus: 'pending' },
      { name: 'معاذ هشام الصاعدي', gender: 'male', classIdx: 2, parentName: 'هشام الصاعدي', parentPhone: '0560100000', approvalStatus: 'approved' },
      { name: 'ريم فواز القرني', gender: 'female', classIdx: 3, parentName: 'فواز القرني', parentPhone: '0560200000', approvalStatus: 'rejected' },
    ]

    const students = await Promise.all(
      studentData.map((s, i) =>
        db.student.create({
          data: {
            name: s.name,
            gender: s.gender,
            classId: classes[s.classIdx].id,
            parentName: s.parentName,
            parentPhone: s.parentPhone,
            birthDate: `2018-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
            address: 'المدينة المنورة',
            enrollmentDate: '2024-09-01',
            active: true,
            approvalStatus: s.approvalStatus,
            noorAlBayanLevel: i % 5,
          },
        })
      )
    )

    // 5. Create sample attendance (last 7 days for all approved students)
    const today = new Date()
    const attendanceStatuses = ['present', 'absent', 'late', 'excused']
    const approvedStudents = students.filter(
      (_, i) => studentData[i].approvalStatus === 'approved'
    )

    const attendancePromises: Promise<unknown>[] = []
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today)
      date.setDate(date.getDate() - dayOffset)
      const dateStr = date.toISOString().split('T')[0]

      for (const student of approvedStudents) {
        const status = attendanceStatuses[Math.floor(Math.random() * 10) < 7 ? 0 : Math.floor(Math.random() * 4)]
        attendancePromises.push(
          db.attendance.create({
            data: {
              studentId: student.id,
              date: dateStr,
              status,
              recordedBy: admin.id,
              notes: status === 'absent' ? 'غياب بدون عذر' : status === 'late' ? 'تأخير 10 دقائق' : status === 'excused' ? 'عذر مرضي' : null,
            },
          })
        )
      }
    }
    await Promise.all(attendancePromises)

    // 6. Create sample memorization
    const surahs = [
      { number: 1, name: 'الفاتحة', totalAyahs: 7 },
      { number: 2, name: 'البقرة', totalAyahs: 286 },
      { number: 3, name: 'آل عمران', totalAyahs: 200 },
      { number: 4, name: 'النساء', totalAyahs: 176 },
      { number: 5, name: 'المائدة', totalAyahs: 120 },
      { number: 6, name: 'الأنعام', totalAyahs: 165 },
    ]
    const memorizationTypes = ['sabak', 'sabqi', 'manzil']
    const grades = ['excellent', 'very_good', 'good', 'acceptable', 'weak']

    const memorizationPromises: Promise<unknown>[] = []
    for (const student of approvedStudents.slice(0, 15)) {
      for (let j = 0; j < 3; j++) {
        const surah = surahs[Math.floor(Math.random() * surahs.length)]
        const type = memorizationTypes[j]
        const grade = grades[Math.floor(Math.random() * grades.length)]
        const daysAgo = Math.floor(Math.random() * 30)
        const date = new Date(today)
        date.setDate(date.getDate() - daysAgo)

        memorizationPromises.push(
          db.memorization.create({
            data: {
              studentId: student.id,
              type,
              surahNumber: surah.number,
              surahName: surah.name,
              fromAyah: 1,
              toAyah: Math.min(20, surah.totalAyahs),
              totalAyahs: surah.totalAyahs,
              grade,
              date: date.toISOString().split('T')[0],
              teacherId: teachers[Math.floor(Math.random() * teachers.length)].id,
              notes: grade === 'weak' ? 'يحتاج مراجعة إضافية' : null,
            },
          })
        )
      }
    }
    await Promise.all(memorizationPromises)

    // 7. Create sample payments
    const months = ['2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03']

    const paymentPromises: Promise<unknown>[] = []
    for (const student of approvedStudents) {
      // Registration fee
      paymentPromises.push(
        db.payment.create({
          data: {
            studentId: student.id,
            amount: 200,
            type: 'registration',
            paymentDate: '2024-09-01',
            receivedBy: admin.id,
            notes: 'رسوم التسجيل',
          },
        })
      )
      // Monthly fees (random months)
      for (const month of months) {
        if (Math.random() > 0.3) {
          const [year, m] = month.split('-')
          paymentPromises.push(
            db.payment.create({
              data: {
                studentId: student.id,
                amount: 300,
                type: 'monthly',
                month: m,
                year: parseInt(year),
                paymentDate: `${month}-05`,
                receivedBy: admin.id,
                notes: 'رسوم شهرية',
              },
            })
          )
        }
      }
    }
    await Promise.all(paymentPromises)

    // 8. Create sample notifications
    const notifications = await Promise.all([
      db.notification.create({
        data: {
          title: 'بدء التسجيل للفصل الدراسي الجديد',
          message: 'يسرنا الإعلان عن بدء التسجيل للفصل الدراسي الثاني لعام 1446 هـ',
          target: 'all',
          createdBy: admin.id,
        },
      }),
      db.notification.create({
        data: {
          title: 'اجتماع المعلمين',
          message: 'يرجى حضور اجتماع المعلمين يوم الأحد القادم بعد صلاة العصر',
          target: 'teacher',
          createdBy: admin.id,
        },
      }),
      db.notification.create({
        data: {
          title: 'تحديث جداول الحلقات',
          message: 'تم تحديث جداول الحلقات القرآنية للأسبوع القادم',
          target: 'all',
          createdBy: admin.id,
        },
      }),
      db.notification.create({
        data: {
          title: 'مسابقة حفظ القرآن',
          message: 'تعلن الإدارة عن مسابقة حفظ القرآن الكريم بنهاية الشهر',
          target: 'all',
          createdBy: admin.id,
        },
      }),
      db.notification.create({
        data: {
          title: 'صيانة المبنى',
          message: 'سيتم إجراء صيانة للمبنى يوم الخميس القادم',
          target: 'admin',
          createdBy: admin.id,
        },
      }),
    ])

    // 9. Create sample settings
    await Promise.all([
      db.setting.create({ data: { keyName: 'school_name', keyValue: 'براعم تحفيظ القرآن الكريم' } }),
      db.setting.create({ data: { keyName: 'school_phone', keyValue: '0501234567' } }),
      db.setting.create({ data: { keyName: 'school_email', keyValue: 'info@quran-kh.edu' } }),
      db.setting.create({ data: { keyName: 'school_address', keyValue: 'المدينة المنورة - حي العزيزية' } }),
      db.setting.create({ data: { keyName: 'registration_fee', keyValue: '200' } }),
      db.setting.create({ data: { keyName: 'monthly_fee', keyValue: '300' } }),
      db.setting.create({ data: { keyName: 'academic_year', keyValue: '1446-1447' } }),
    ])

    // 10. Create sample homework
    await Promise.all([
      db.homework.create({
        data: {
          title: 'حفظ سورة الفاتحة',
          subject: 'حفظ',
          description: 'حفظ سورة الفاتحة كاملة مع التجويد',
          classId: classes[0].id,
        },
      }),
      db.homework.create({
        data: {
          title: 'مراجعة آية الكرسي',
          subject: 'مراجعة',
          description: 'مراجعة وتثبيت آية الكرسي من سورة البقرة',
          classId: classes[0].id,
        },
      }),
      db.homework.create({
        data: {
          title: 'حفظ أول 20 آية من آل عمران',
          subject: 'حفظ',
          description: 'حفظ العشرين آية الأولى من سورة آل عمران',
          classId: classes[1].id,
        },
      }),
      db.homework.create({
        data: {
          title: 'حفظ سورة المائدة - الجزء الأول',
          subject: 'حفظ',
          description: 'حفظ أول 30 آية من سورة المائدة',
          classId: classes[2].id,
        },
      }),
    ])

    // 11. Create sample skills
    const skillCategories = [
      { category: 'حفظ', skills: ['سرعة الحفظ', 'دقة الحفظ', 'الربط بين الآيات'] },
      { category: 'تجويد', skills: ['أحكام النون الساكنة', 'أحكام المد', 'مخارج الحروف'] },
      { category: 'سلوك', skills: ['الانتظام', 'الاحترام', 'التعاون'] },
    ]

    const skillPromises: Promise<unknown>[] = []
    for (const student of approvedStudents.slice(0, 10)) {
      for (const cat of skillCategories) {
        for (const skill of cat.skills) {
          skillPromises.push(
            db.studentSkill.create({
              data: {
                studentId: student.id,
                skillName: skill,
                skillCategory: cat.category,
                rating: Math.floor(Math.random() * 5) + 1,
              },
            })
          )
        }
      }
    }
    await Promise.all(skillPromises)

    return NextResponse.json({
      success: true,
      message: 'تم تهيئة قاعدة البيانات بنجاح',
      counts: {
        users: 4, // 1 admin + 3 teachers
        classes: classes.length,
        students: students.length,
        notifications: notifications.length,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تهيئة قاعدة البيانات', details: String(error) },
      { status: 500 }
    )
  }
}
