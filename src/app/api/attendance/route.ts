import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - List attendance with filters
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || ''
    const classId = searchParams.get('classId') || ''
    const studentId = searchParams.get('studentId') || ''
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = {}

    if (date) {
      where.date = date
    }

    if (classId) {
      where.student = { classId }
    }

    if (studentId) {
      where.studentId = studentId
    }

    if (status) {
      where.status = status
    }

    const attendance = await db.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            classId: true,
            class: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error('Attendance list error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل سجل الحضور' },
      { status: 500 }
    )
  }
}

// POST - Create/update attendance (supports batch and single)
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()

    // Support both { records: [...] } format and direct array format
    let records: Array<{ studentId: string; date: string; status?: string; notes?: string }>
    if (body.records && Array.isArray(body.records)) {
      records = body.records
    } else if (Array.isArray(body)) {
      records = body
    } else {
      records = [body]
    }

    const results = []

    for (const record of records) {
      const { studentId, date, status, notes } = record

      if (!studentId || !date) {
        results.push({ error: 'معرف الطالب والتاريخ مطلوبان', record })
        continue
      }

      // Upsert by studentId + date (unique constraint)
      const attendance = await db.attendance.upsert({
        where: {
          studentId_date: { studentId, date },
        },
        update: {
          status: status || 'present',
          notes: notes || null,
          recordedBy: user.id,
        },
        create: {
          studentId,
          date,
          status: status || 'present',
          notes: notes || null,
          recordedBy: user.id,
        },
        include: {
          student: {
            select: { id: true, name: true },
          },
        },
      })

      results.push(attendance)
    }

    // Return based on original format
    if (body.records) {
      return NextResponse.json({ attendance: results, success: true }, { status: 201 })
    }
    if (Array.isArray(body)) {
      return NextResponse.json({ attendance: results, success: true }, { status: 201 })
    }
    return NextResponse.json(
      { attendance: results[0], success: true },
      results[0]?.error ? { status: 400 } : { status: 201 }
    )
  } catch (error) {
    console.error('Create attendance error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل الحضور' },
      { status: 500 }
    )
  }
}
