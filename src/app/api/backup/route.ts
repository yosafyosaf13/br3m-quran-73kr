import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { copyFile, mkdir, stat } from 'fs/promises'
import { join } from 'path'

// GET - List backups
export async function GET() {
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

    const backups = await db.backup.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ backups })
  } catch (error) {
    console.error('List backups error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل النسخ الاحتياطية' },
      { status: 500 }
    )
  }
}

// POST - Create backup (copy DB file to backup directory with timestamp)
export async function POST() {
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

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `quran-kh-backup-${timestamp}.db`

    // Determine paths - read from DATABASE_URL env or use default
    const dbUrl = process.env.DATABASE_URL || ''
    let dbPath: string
    if (dbUrl.startsWith('file:')) {
      dbPath = dbUrl.replace('file:', '')
    } else {
      dbPath = join(process.cwd(), 'db', 'custom.db')
    }
    const backupDir = join(process.cwd(), 'backups')

    // Ensure backup directory exists
    await mkdir(backupDir, { recursive: true })

    const backupPath = join(backupDir, fileName)

    // Copy the database file
    await copyFile(dbPath, backupPath)

    // Get file size
    const fileStat = await stat(backupPath)
    const fileSizeInKB = fileStat.size / 1024

    // Record backup in database
    const backup = await db.backup.create({
      data: {
        fileName,
        fileSize: Math.round(fileSizeInKB * 100) / 100,
      },
    })

    return NextResponse.json(
      {
        backup,
        message: 'تم إنشاء النسخة الاحتياطية بنجاح',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create backup error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء النسخة الاحتياطية' },
      { status: 500 }
    )
  }
}
