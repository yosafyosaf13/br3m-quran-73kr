import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - Get all settings as key-value object
export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const settings = await db.setting.findMany()

    const settingsMap: Record<string, string | null> = {}
    for (const setting of settings) {
      settingsMap[setting.keyName] = setting.keyValue
    }

    return NextResponse.json({ settings: settingsMap })
  } catch (error) {
    console.error('Settings get error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل الإعدادات' },
      { status: 500 }
    )
  }
}

// PUT - Update settings (accept object of key-value pairs, use upsert)
export async function PUT(request: NextRequest) {
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
    const settings = body.settings || body

    if (typeof settings !== 'object' || Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'يجب تقديم الإعدادات ككائن' },
        { status: 400 }
      )
    }

    const upsertPromises = Object.entries(settings).map(([key, value]) =>
      db.setting.upsert({
        where: { keyName: key },
        update: { keyValue: String(value ?? '') },
        create: { keyName: key, keyValue: String(value ?? '') },
      })
    )

    await Promise.all(upsertPromises)

    // Return updated settings
    const updatedSettings = await db.setting.findMany()
    const settingsMap: Record<string, string | null> = {}
    for (const setting of updatedSettings) {
      settingsMap[setting.keyName] = setting.keyValue
    }

    return NextResponse.json({
      settings: settingsMap,
      message: 'تم تحديث الإعدادات بنجاح',
    })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الإعدادات' },
      { status: 500 }
    )
  }
}
