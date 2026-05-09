import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - List memorization with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId') || ''
    const type = searchParams.get('type') || ''
    const grade = searchParams.get('grade') || ''
    const date = searchParams.get('date') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '20')

    const where: Record<string, unknown> = {}

    if (studentId) {
      where.studentId = studentId
    }

    if (type) {
      where.type = type
    }

    if (grade) {
      where.grade = grade
    }

    if (date) {
      where.date = date
    }

    const [memorization, total] = await Promise.all([
      db.memorization.findMany({
        where,
        include: {
          student: { select: { id: true, name: true } },
          teacher: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      db.memorization.count({ where }),
    ])

    return NextResponse.json({
      memorization,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    })
  } catch (error) {
    console.error('Memorization list error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل سجل الحفظ' },
      { status: 500 }
    )
  }
}

// POST - Create memorization record
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const {
      studentId,
      type,
      surahNumber,
      surahName,
      fromAyah,
      toAyah,
      totalAyahs,
      grade,
      notes,
      date,
      teacherId,
    } = body

    if (!studentId || !type || !surahNumber || !surahName || !date) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة: الطالب، النوع، رقم السورة، اسم السورة، التاريخ' },
        { status: 400 }
      )
    }

    const memorization = await db.memorization.create({
      data: {
        studentId,
        type,
        surahNumber,
        surahName,
        fromAyah: fromAyah || 1,
        toAyah: toAyah || 1,
        totalAyahs: totalAyahs || 1,
        grade: grade || null,
        notes: notes || null,
        date,
        teacherId: teacherId || user.id,
      },
      include: {
        student: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ memorization }, { status: 201 })
  } catch (error) {
    console.error('Create memorization error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل الحفظ' },
      { status: 500 }
    )
  }
}

// DELETE - Delete memorization by id
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
        { error: 'معرف سجل الحفظ مطلوب' },
        { status: 400 }
      )
    }

    const existing = await db.memorization.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'سجل الحفظ غير موجود' },
        { status: 404 }
      )
    }

    await db.memorization.delete({ where: { id } })

    return NextResponse.json({ message: 'تم حذف سجل الحفظ بنجاح' })
  } catch (error) {
    console.error('Delete memorization error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حذف سجل الحفظ' },
      { status: 500 }
    )
  }
}
