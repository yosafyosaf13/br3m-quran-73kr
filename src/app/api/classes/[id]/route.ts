import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// PUT - Update class
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

    const existingClass = await db.class.findUnique({ where: { id } })
    if (!existingClass) {
      return NextResponse.json(
        { error: 'الحلقة غير موجودة' },
        { status: 404 }
      )
    }

    const cls = await db.class.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.teacherId !== undefined && { teacherId: body.teacherId }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.active !== undefined && { active: body.active }),
      },
      include: {
        teacher: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ class: cls })
  } catch (error) {
    console.error('Update class error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الحلقة' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete class
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

    const existingClass = await db.class.findUnique({ where: { id } })
    if (!existingClass) {
      return NextResponse.json(
        { error: 'الحلقة غير موجودة' },
        { status: 404 }
      )
    }

    const cls = await db.class.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ class: cls, message: 'تم حذف الحلقة بنجاح' })
  } catch (error) {
    console.error('Delete class error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الحلقة' },
      { status: 500 }
    )
  }
}
