import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Parent portal data by phone number (no admin auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone') || ''

    if (!phone || phone.length < 8) {
      return NextResponse.json({ error: 'رقم الهاتف مطلوب' }, { status: 400 })
    }

    // Find students by parent phone - use exact match (equals) instead of contains
    // to prevent partial phone number matches returning wrong students
    const students = await db.student.findMany({
      where: {
        active: true,
        approvalStatus: 'approved',
        OR: [
          { parentPhone: { equals: phone } },
          { parentPhone2: { equals: phone } },
        ],
      },
      include: {
        class: { select: { id: true, name: true, description: true } },
        attendance: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        memorization: {
          include: {
            teacher: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        skills: {
          orderBy: { lastUpdated: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    })

    if (students.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على طلاب مرتبطين بهذا الرقم' }, { status: 404 })
    }

    // Enrich each student with computed stats
    const enrichedStudents = students.map(student => {
      // Attendance stats
      const totalAttendance = student.attendance.length
      const presentCount = student.attendance.filter(a => a.status === 'present').length
      const absentCount = student.attendance.filter(a => a.status === 'absent').length
      const lateCount = student.attendance.filter(a => a.status === 'late').length
      const excusedCount = student.attendance.filter(a => a.status === 'excused').length
      const attendancePercent = totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0

      // Attendance by day (last 14 days)
      const attendanceByDay = student.attendance.slice(0, 14).map(a => ({
        date: a.date,
        status: a.status,
      }))

      // Memorization stats
      const totalMemorization = student.memorization.length
      const sabakCount = student.memorization.filter(m => m.type === 'sabak').length
      const sabqiCount = student.memorization.filter(m => m.type === 'sabqi').length
      const manzilCount = student.memorization.filter(m => m.type === 'manzil').length

      // Grade distribution
      const gradeMap: Record<string, number> = {}
      student.memorization.forEach(m => {
        if (m.grade) gradeMap[m.grade] = (gradeMap[m.grade] || 0) + 1
      })

      // Unique surahs memorized
      const uniqueSurahs = new Set(student.memorization.map(m => m.surahNumber))
      const surahCount = uniqueSurahs.size

      // Payment stats
      const totalPaid = student.payments.reduce((sum, p) => sum + p.amount, 0)
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      // Check if current month's subscription is paid
      // The month field can be stored as a numeric string ("1"-"12") or Arabic month name
      const monthPaid = student.payments.find(p => {
        if (!p.month || !p.year) return false
        if (p.type !== 'monthly') return false
        if (p.year !== currentYear) return false
        // Try numeric comparison first
        const monthNum = parseInt(p.month)
        if (!isNaN(monthNum)) {
          return monthNum === currentMonth
        }
        // Fallback: Arabic month name matching
        const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
        const monthIndex = monthNames.indexOf(p.month)
        return monthIndex === currentMonth - 1
      })

      // Skills average
      const skillsAvg = student.skills.length > 0
        ? student.skills.reduce((sum, s) => sum + s.rating, 0) / student.skills.length
        : 0

      return {
        ...student,
        stats: {
          attendancePercent,
          presentCount,
          absentCount,
          lateCount,
          excusedCount,
          totalAttendance,
          attendanceByDay,
          totalMemorization,
          sabakCount,
          sabqiCount,
          manzilCount,
          surahCount,
          gradeDistribution: gradeMap,
          totalPaid,
          monthPaid: !!monthPaid,
          skillsAvg: Math.round(skillsAvg * 10) / 10,
        },
      }
    })

    return NextResponse.json({
      students: enrichedStudents,
      parentName: students[0]?.parentName || 'ولي الأمر',
    })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل البيانات' },
      { status: 500 }
    )
  }
}
