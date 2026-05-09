import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - List homework; filter by classId
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId') || ''

    const where: Record<string, unknown> = {}

    if (classId) {
      where.classId = classId
    }

    const homework = await db.homework.findMany({
      where,
      include: {
        class: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ homework })
  } catch (error) {
    console.error('Homework list error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل الواجبات' },
      { status: 500 }
    )
  }
}

// POST - Create homework
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { title, subject, description, filePath, classId } = body

    if (!title) {
      return NextResponse.json(
        { error: 'عنوان الواجب مطلوب' },
        { status: 400 }
      )
    }

    const homework = await db.homework.create({
      data: {
        title,
        subject: subject || null,
        description: description || null,
        filePath: filePath || null,
        classId: classId || null,
      },
      include: {
        class: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ homework }, { status: 201 })
  } catch (error) {
    console.error('Create homework error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الواجب' },
      { status: 500 }
    )
  }
}
