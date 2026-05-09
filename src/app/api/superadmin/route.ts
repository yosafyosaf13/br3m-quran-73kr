import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/superadmin/stats - Super Admin dashboard
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
    return NextResponse.json({ error: 'غير مصرح - سوبر أدمن فقط' }, { status: 403 });
  }

  const [
    totalUsers,
    totalStudents,
    totalClasses,
    totalMaterials,
    recentUsers,
    adminUsers,
  ] = await Promise.all([
    db.user.count(),
    db.student.count(),
    db.class.count(),
    db.learningMaterial.count(),
    db.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    db.user.findMany({ where: { role: 'admin' }, include: { _count: true } }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalStudents,
    totalClasses,
    totalMaterials,
    recentUsers,
    adminUsers,
    systemHealth: 'healthy',
  });
}
