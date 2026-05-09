import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - Generate reports with type, date range, classId
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'attendance'
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const classId = searchParams.get('classId') || ''

    switch (reportType) {
      case 'attendance':
        return await getAttendanceReport(startDate, endDate, classId)
      case 'memorization':
        return await getMemorizationReport(startDate, endDate, classId)
      case 'payments':
        return await getPaymentsReport(startDate, endDate, classId)
      case 'students':
        return await getStudentsReport(classId)
      default:
        return NextResponse.json(
          { error: 'نوع التقرير غير صالح' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Reports error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء التقرير' },
      { status: 500 }
    )
  }
}

async function getAttendanceReport(startDate: string, endDate: string, classId: string) {
  const where: Record<string, unknown> = {}

  if (startDate && endDate) {
    where.date = { gte: startDate, lte: endDate }
  } else if (startDate) {
    where.date = { gte: startDate }
  } else if (endDate) {
    where.date = { lte: endDate }
  }

  if (classId) {
    where.student = { classId }
  }

  const records = await db.attendance.findMany({
    where,
    include: {
      student: {
        select: { id: true, name: true, class: { select: { id: true, name: true } } },
      },
    },
    orderBy: { date: 'desc' },
  })

  const summary = {
    total: records.length,
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    excused: records.filter((r) => r.status === 'excused').length,
    attendanceRate: records.length > 0
      ? Math.round((records.filter((r) => r.status === 'present').length / records.length) * 100)
      : 0,
  }

  return NextResponse.json({ type: 'attendance', summary, records })
}

async function getMemorizationReport(startDate: string, endDate: string, classId: string) {
  const where: Record<string, unknown> = {}

  if (startDate && endDate) {
    where.date = { gte: startDate, lte: endDate }
  } else if (startDate) {
    where.date = { gte: startDate }
  } else if (endDate) {
    where.date = { lte: endDate }
  }

  if (classId) {
    where.student = { classId }
  }

  const records = await db.memorization.findMany({
    where,
    include: {
      student: {
        select: { id: true, name: true, class: { select: { id: true, name: true } } },
      },
      teacher: { select: { id: true, name: true } },
    },
    orderBy: { date: 'desc' },
  })

  const summary = {
    total: records.length,
    sabak: records.filter((r) => r.type === 'sabak').length,
    sabqi: records.filter((r) => r.type === 'sabqi').length,
    manzil: records.filter((r) => r.type === 'manzil').length,
    excellent: records.filter((r) => r.grade === 'excellent').length,
    veryGood: records.filter((r) => r.grade === 'very_good').length,
    good: records.filter((r) => r.grade === 'good').length,
    acceptable: records.filter((r) => r.grade === 'acceptable').length,
    weak: records.filter((r) => r.grade === 'weak').length,
  }

  return NextResponse.json({ type: 'memorization', summary, records })
}

async function getPaymentsReport(startDate: string, endDate: string, classId: string) {
  const where: Record<string, unknown> = {}

  if (startDate && endDate) {
    where.paymentDate = { gte: startDate, lte: endDate }
  } else if (startDate) {
    where.paymentDate = { gte: startDate }
  } else if (endDate) {
    where.paymentDate = { lte: endDate }
  }

  if (classId) {
    where.student = { classId }
  }

  const records = await db.payment.findMany({
    where,
    include: {
      student: {
        select: { id: true, name: true, class: { select: { id: true, name: true } } },
      },
    },
    orderBy: { paymentDate: 'desc' },
  })

  const summary = {
    total: records.length,
    totalAmount: records.reduce((sum, r) => sum + r.amount, 0),
    registration: records.filter((r) => r.type === 'registration').length,
    monthly: records.filter((r) => r.type === 'monthly').length,
    other: records.filter((r) => r.type === 'other').length,
    registrationAmount: records.filter((r) => r.type === 'registration').reduce((sum, r) => sum + r.amount, 0),
    monthlyAmount: records.filter((r) => r.type === 'monthly').reduce((sum, r) => sum + r.amount, 0),
    otherAmount: records.filter((r) => r.type === 'other').reduce((sum, r) => sum + r.amount, 0),
  }

  return NextResponse.json({ type: 'payments', summary, records })
}

async function getStudentsReport(classId: string) {
  const where: Record<string, unknown> = { active: true }

  if (classId) {
    where.classId = classId
  }

  const students = await db.student.findMany({
    where,
    include: {
      class: { select: { id: true, name: true } },
      attendance: { select: { status: true } },
      memorization: { select: { type: true, grade: true } },
      payments: { select: { amount: true, type: true } },
    },
    orderBy: { name: 'asc' },
  })

  const summary = {
    total: students.length,
    male: students.filter((s) => s.gender === 'male').length,
    female: students.filter((s) => s.gender === 'female').length,
    approved: students.filter((s) => s.approvalStatus === 'approved').length,
    pending: students.filter((s) => s.approvalStatus === 'pending').length,
    rejected: students.filter((s) => s.approvalStatus === 'rejected').length,
    totalPayments: students.reduce(
      (sum, s) => sum + s.payments.reduce((ps, p) => ps + p.amount, 0),
      0
    ),
  }

  const records = students.map((s) => ({
    id: s.id,
    name: s.name,
    gender: s.gender,
    class: s.class,
    approvalStatus: s.approvalStatus,
    totalAttendance: s.attendance.length,
    presentCount: s.attendance.filter((a) => a.status === 'present').length,
    totalMemorization: s.memorization.length,
    totalPayments: s.payments.reduce((sum, p) => sum + p.amount, 0),
  }))

  return NextResponse.json({ type: 'students', summary, records })
}
