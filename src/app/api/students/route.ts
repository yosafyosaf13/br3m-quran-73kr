import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - List students with search, filters, pagination
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const classId = searchParams.get('classId') || ''
    const gender = searchParams.get('gender') || ''
    const approvalStatus = searchParams.get('approvalStatus') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '20')

    const where: Record<string, unknown> = {
      active: true,
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { parentName: { contains: search } },
        { parentPhone: { contains: search } },
      ]
    }

    if (classId) {
      where.classId = classId
    }

    if (gender) {
      where.gender = gender
    }

    if (approvalStatus) {
      where.approvalStatus = approvalStatus
    }

    const [students, total] = await Promise.all([
      db.student.findMany({
        where,
        include: {
          class: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      db.student.count({ where }),
    ])

    return NextResponse.json({
      students,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    })
  } catch (error) {
    console.error('Students list error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل الطلاب' },
      { status: 500 }
    )
  }
}

// POST - Create student
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      birthDate,
      gender,
      classId,
      parentName,
      parentPhone,
      parentPhone2,
      address,
      enrollmentDate,
      photo,
      notes,
      approvalStatus,
      parentIdPhoto,
      birthCertificatePhoto,
      noorAlBayanLevel,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'اسم الطالب مطلوب' },
        { status: 400 }
      )
    }

    const student = await db.student.create({
      data: {
        name,
        birthDate: birthDate || null,
        gender: gender || 'male',
        classId: classId || null,
        parentName: parentName || null,
        parentPhone: parentPhone || null,
        parentPhone2: parentPhone2 || null,
        address: address || null,
        enrollmentDate: enrollmentDate || null,
        photo: photo || null,
        notes: notes || null,
        approvalStatus: approvalStatus || 'pending',
        parentIdPhoto: parentIdPhoto || null,
        birthCertificatePhoto: birthCertificatePhoto || null,
        noorAlBayanLevel: noorAlBayanLevel || 0,
        active: true,
      },
      include: {
        class: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ student }, { status: 201 })
  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الطالب' },
      { status: 500 }
    )
  }
}
