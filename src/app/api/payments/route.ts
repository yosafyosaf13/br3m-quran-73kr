import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - List payments with filters, pagination, running total
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId') || ''
    const type = searchParams.get('type') || ''
    const month = searchParams.get('month') || ''
    const yearStr = searchParams.get('year') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '20')

    const where: Record<string, unknown> = {}

    if (studentId) {
      where.studentId = studentId
    }

    if (type) {
      where.type = type
    }

    if (month) {
      where.month = month
    }

    if (yearStr) {
      where.year = parseInt(yearStr)
    }

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          student: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      db.payment.count({ where }),
    ])

    // Calculate running total
    const allPayments = await db.payment.findMany({
      where,
      select: { amount: true },
      orderBy: { createdAt: 'asc' },
    })

    const runningTotal = allPayments.reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      payments,
      runningTotal,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    })
  } catch (error) {
    console.error('Payments list error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل سجل المدفوعات' },
      { status: 500 }
    )
  }
}

// POST - Create payment
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, amount, type, month, year, paymentDate, notes } = body

    if (!studentId || !amount || !type || !paymentDate) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة: الطالب، المبلغ، النوع، تاريخ الدفع' },
        { status: 400 }
      )
    }

    const payment = await db.payment.create({
      data: {
        studentId,
        amount: parseFloat(amount),
        type,
        month: month || null,
        year: year || null,
        paymentDate,
        notes: notes || null,
        receivedBy: user.id,
      },
      include: {
        student: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل الدفعة' },
      { status: 500 }
    )
  }
}

// DELETE - Delete payment by id
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'معرف الدفعة مطلوب' },
        { status: 400 }
      )
    }

    const existing = await db.payment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'الدفعة غير موجودة' },
        { status: 404 }
      )
    }

    await db.payment.delete({ where: { id } })

    return NextResponse.json({ message: 'تم حذف الدفعة بنجاح' })
  } catch (error) {
    console.error('Delete payment error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الدفعة' },
      { status: 500 }
    )
  }
}
