import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - Get student by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params
    const student = await db.student.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true } },
        attendance: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        memorization: {
          orderBy: { createdAt: 'desc' },
          include: {
            teacher: { select: { id: true, name: true } },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        skills: true,
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'الطالب غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Get student error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل بيانات الطالب' },
      { status: 500 }
    )
  }
}

// PUT - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existingStudent = await db.student.findUnique({ where: { id } })
    if (!existingStudent) {
      return NextResponse.json(
        { error: 'الطالب غير موجود' },
        { status: 404 }
      )
    }

    const student = await db.student.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.birthDate !== undefined && { birthDate: body.birthDate }),
        ...(body.gender !== undefined && { gender: body.gender }),
        ...(body.classId !== undefined && { classId: body.classId || null }),
        ...(body.parentName !== undefined && { parentName: body.parentName }),
        ...(body.parentPhone !== undefined && { parentPhone: body.parentPhone }),
        ...(body.parentPhone2 !== undefined && { parentPhone2: body.parentPhone2 }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.enrollmentDate !== undefined && { enrollmentDate: body.enrollmentDate }),
        ...(body.photo !== undefined && { photo: body.photo }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.approvalStatus !== undefined && { approvalStatus: body.approvalStatus }),
        ...(body.parentIdPhoto !== undefined && { parentIdPhoto: body.parentIdPhoto }),
        ...(body.birthCertificatePhoto !== undefined && { birthCertificatePhoto: body.birthCertificatePhoto }),
        ...(body.noorAlBayanLevel !== undefined && { noorAlBayanLevel: body.noorAlBayanLevel }),
        ...(body.active !== undefined && { active: body.active }),
      },
      include: {
        class: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث بيانات الطالب' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params

    const existingStudent = await db.student.findUnique({ where: { id } })
    if (!existingStudent) {
      return NextResponse.json(
        { error: 'الطالب غير موجود' },
        { status: 404 }
      )
    }

    const student = await db.student.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ student, message: 'تم حذف الطالب بنجاح' })
  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الطالب' },
      { status: 500 }
    )
  }
}
