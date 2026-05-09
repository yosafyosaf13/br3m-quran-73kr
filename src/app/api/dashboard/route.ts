import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - Dashboard statistics
export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()

    // Total counts
    const [totalStudents, totalClasses] = await Promise.all([
      db.student.count({ where: { active: true } }),
      db.class.count({ where: { active: true } }),
    ])

    // Today's attendance
    const todayAttendanceRecords = await db.attendance.findMany({
      where: { date: todayStr },
      select: { status: true },
    })

    const todayAttendance = {
      present: todayAttendanceRecords.filter((a) => a.status === 'present').length,
      absent: todayAttendanceRecords.filter((a) => a.status === 'absent').length,
      late: todayAttendanceRecords.filter((a) => a.status === 'late').length,
      excused: todayAttendanceRecords.filter((a) => a.status === 'excused').length,
    }

    // Monthly revenue (current month payments)
    const currentMonthPayments = await db.payment.findMany({
      where: {
        year: currentYear,
        month: String(currentMonth).padStart(2, '0'),
      },
      select: { amount: true },
    })
    const monthlyRevenue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0)

    // Pending approvals
    const pendingApprovals = await db.student.count({
      where: { approvalStatus: 'pending' },
    })

    // Recent students (last 5)
    const recentStudents = await db.student.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        class: { select: { name: true } },
      },
    })

    // Recent memorization (last 5)
    const recentMemorization = await db.memorization.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } },
      },
    })

    // Attendance trend (last 7 days)
    const attendanceTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayRecords = await db.attendance.findMany({
        where: { date: dateStr },
        select: { status: true },
      })

      attendanceTrend.push({
        date: dateStr,
        present: dayRecords.filter((a) => a.status === 'present').length,
        absent: dayRecords.filter((a) => a.status === 'absent').length,
        late: dayRecords.filter((a) => a.status === 'late').length,
        excused: dayRecords.filter((a) => a.status === 'excused').length,
      })
    }

    // Payment trend (last 6 months)
    const paymentTrend = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1)
      const m = date.getMonth() + 1
      const y = date.getFullYear()

      const monthPayments = await db.payment.findMany({
        where: {
          year: y,
          month: String(m).padStart(2, '0'),
        },
        select: { amount: true },
      })

      paymentTrend.push({
        month: `${y}-${String(m).padStart(2, '0')}`,
        total: monthPayments.reduce((sum, p) => sum + p.amount, 0),
        count: monthPayments.length,
      })
    }

    // Memorization by type
    const [sabakCount, sabqiCount, manzilCount] = await Promise.all([
      db.memorization.count({ where: { type: 'sabak' } }),
      db.memorization.count({ where: { type: 'sabqi' } }),
      db.memorization.count({ where: { type: 'manzil' } }),
    ])
    const memorizationByType = {
      sabak: sabakCount,
      sabqi: sabqiCount,
      manzil: manzilCount,
    }

    // Grade distribution
    const gradeDistribution = await db.memorization.groupBy({
      by: ['grade'],
      _count: { grade: true },
      where: { grade: { not: null } },
    })

    const gradeDist: Record<string, number> = {}
    for (const g of gradeDistribution) {
      if (g.grade) {
        gradeDist[g.grade] = g._count.grade
      }
    }

    return NextResponse.json({
      totalStudents,
      totalClasses,
      todayAttendance,
      monthlyRevenue,
      pendingApprovals,
      recentStudents,
      recentMemorization,
      attendanceTrend,
      paymentTrend,
      memorizationByType,
      gradeDistribution: gradeDist,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل لوحة المعلومات' },
      { status: 500 }
    )
  }
}
