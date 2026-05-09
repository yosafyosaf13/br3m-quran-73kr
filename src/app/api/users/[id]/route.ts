import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { hashPassword } from '@/lib/password'

// GET - Get user by id
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

    const foundUser = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        phone: true,
        email: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!foundUser) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: foundUser })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل بيانات المستخدم' },
      { status: 500 }
    )
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'صلاحيات غير كافية' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // If username is being changed, check for conflicts
    if (body.username && body.username !== existingUser.username) {
      const conflict = await db.user.findUnique({ where: { username: body.username } })
      if (conflict) {
        return NextResponse.json(
          { error: 'اسم المستخدم موجود بالفعل' },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.username !== undefined) updateData.username = body.username
    if (body.role !== undefined) updateData.role = body.role
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.email !== undefined) updateData.email = body.email
    if (body.active !== undefined) updateData.active = body.active

    // Optional password update
    if (body.password) {
      updateData.password = await hashPassword(body.password)
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        phone: true,
        email: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث بيانات المستخدم' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'صلاحيات غير كافية' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json(
        { error: 'لا يمكنك حذف حسابك الخاص' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    const deletedUser = await db.user.update({
      where: { id },
      data: { active: false },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        active: true,
      },
    })

    return NextResponse.json({ user: deletedUser, message: 'تم حذف المستخدم بنجاح' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حذف المستخدم' },
      { status: 500 }
    )
  }
}
