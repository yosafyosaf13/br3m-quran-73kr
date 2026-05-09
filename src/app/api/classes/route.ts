import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - List all classes with teacher and student count
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeStr = searchParams.get('active') || ''

    const where: Record<string, unknown> = {}

    if (activeStr !== '') {
      where.active = activeStr === 'true'
    }

    const classes = await db.class.findMany({
      where,
      include: {
        teacher: { select: { id: true, name: true, phone: true } },
        students: {
          where: { active: true },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform to include student count
    const result = classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      teacherId: cls.teacherId,
      description: cls.description,
      active: cls.active,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
      teacher: cls.teacher,
      studentCount: cls.students.length,
    }))

    return NextResponse.json({ classes: result })
  } catch (error) {
    console.error('Classes list error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل الحلقات' },
      { status: 500 }
    )
  }
}

// POST - Create class
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { name, teacherId, description } = body

    if (!name || !teacherId) {
      return NextResponse.json(
        { error: 'اسم الحلقة والمعلم مطلوبان' },
        { status: 400 }
      )
    }

    const cls = await db.class.create({
      data: {
        name,
        teacherId,
        description: description || null,
        active: true,
      },
      include: {
        teacher: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ class: cls }, { status: 201 })
  } catch (error) {
    console.error('Create class error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الحلقة' },
      { status: 500 }
    )
  }
}
