import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password'
import { createSession, deleteSession, getSession, getSessionCookieOptions } from '@/lib/auth'

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    // Auto-seed admin if no users exist
    const userCount = await db.user.count()
    if (userCount === 0) {
      const hashedPassword = await hashPassword('admin123')
      await db.user.create({
        data: {
          name: 'مدير النظام',
          username: 'admin',
          password: hashedPassword,
          role: 'admin',
          active: true,
        },
      })
    }

    const user = await db.user.findUnique({
      where: { username },
    })

    if (!user || !user.active) {
      return NextResponse.json(
        { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    const token = await createSession(user.id)
    const cookieConfig = getSessionCookieOptions()

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        active: user.active,
      },
    })

    response.cookies.set(cookieConfig.name, token, cookieConfig.options)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل الدخول' },
      { status: 500 }
    )
  }
}

// GET - Check current session
export async function GET() {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في التحقق من الجلسة' },
      { status: 500 }
    )
  }
}

// DELETE - Logout
export async function DELETE() {
  try {
    await deleteSession()

    const cookieConfig = getSessionCookieOptions()
    const response = NextResponse.json({ message: 'تم تسجيل الخروج بنجاح' })
    response.cookies.set(cookieConfig.name, '', { ...cookieConfig.options, maxAge: 0 })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل الخروج' },
      { status: 500 }
    )
  }
}
