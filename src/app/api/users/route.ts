import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { hashPassword } from '@/lib/password'

// GET - List all users
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || ''
    const activeStr = searchParams.get('active') || ''

    const where: Record<string, unknown> = {}

    if (role) {
      where.role = role
    }

    if (activeStr !== '') {
      where.active = activeStr === 'true'
    }

    const users = await db.user.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Users list error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل المستخدمين' },
      { status: 500 }
    )
  }
}

// POST - Create user
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, username, password, role, phone, email } = body

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: 'الاسم واسم المستخدم وكلمة المرور مطلوبون' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await db.user.findUnique({ where: { username } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'اسم المستخدم موجود بالفعل' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await db.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: role || 'teacher',
        phone: phone || null,
        email: email || null,
        active: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        phone: true,
        email: true,
        active: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء المستخدم' },
      { status: 500 }
    )
  }
}
