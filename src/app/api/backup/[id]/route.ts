import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { join } from 'path'

// DELETE - Delete a backup by ID (admin only)
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

    const backup = await db.backup.findUnique({
      where: { id },
    })

    if (!backup) {
      return NextResponse.json({ error: 'النسخة الاحتياطية غير موجودة' }, { status: 404 })
    }

    // Try to delete the file from disk
    try {
      const backupPath = join(process.cwd(), 'backups', backup.fileName)
      await unlink(backupPath)
    } catch {
      // File might already be deleted or not exist, continue with DB deletion
      console.log(`Backup file ${backup.fileName} not found on disk, removing from DB only`)
    }

    // Delete from database
    await db.backup.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'تم حذف النسخة الاحتياطية بنجاح' })
  } catch (error) {
    console.error('Delete backup error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حذف النسخة الاحتياطية' },
      { status: 500 }
    )
  }
}
