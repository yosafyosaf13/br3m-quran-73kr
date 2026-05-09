import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - List skills; filter by studentId, category
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId') || ''
    const category = searchParams.get('category') || ''

    const where: Record<string, unknown> = {}

    if (studentId) {
      where.studentId = studentId
    }

    if (category) {
      where.skillCategory = category
    }

    const skills = await db.studentSkill.findMany({
      where,
      include: {
        student: { select: { id: true, name: true } },
      },
      orderBy: { lastUpdated: 'desc' },
    })

    return NextResponse.json({ skills })
  } catch (error) {
    console.error('Skills list error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل المهارات' },
      { status: 500 }
    )
  }
}

// POST - Create/update skill (upsert by studentId + skillName)
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, skillName, skillCategory, rating, notes } = body

    if (!studentId || !skillName || !skillCategory) {
      return NextResponse.json(
        { error: 'معرف الطالب واسم المهارة والفئة مطلوبون' },
        { status: 400 }
      )
    }

    // Check if skill already exists for this student + skillName
    const existing = await db.studentSkill.findFirst({
      where: { studentId, skillName },
    })

    let skill

    if (existing) {
      // Update existing skill
      skill = await db.studentSkill.update({
        where: { id: existing.id },
        data: {
          skillCategory,
          rating: rating || existing.rating,
          notes: notes !== undefined ? notes : existing.notes,
          lastUpdated: new Date(),
        },
        include: {
          student: { select: { id: true, name: true } },
        },
      })
    } else {
      // Create new skill
      skill = await db.studentSkill.create({
        data: {
          studentId,
          skillName,
          skillCategory,
          rating: rating || 1,
          notes: notes || null,
        },
        include: {
          student: { select: { id: true, name: true } },
        },
      })
    }

    return NextResponse.json({ skill }, { status: 201 })
  } catch (error) {
    console.error('Create/update skill error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل المهارة' },
      { status: 500 }
    )
  }
}
