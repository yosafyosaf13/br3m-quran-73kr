import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/materials - List learning materials
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const level = searchParams.get('level');
  const type = searchParams.get('type');
  const search = searchParams.get('search');

  const where: any = { isActive: true };
  if (category && category !== 'all') where.category = category;
  if (level && level !== 'all') where.level = level;
  if (type && type !== 'all') where.type = type;
  if (search) where.title = { contains: search };

  const materials = await db.learningMaterial.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ materials });
}

// POST /api/materials - Create material (admin/superadmin only)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !['admin', 'superadmin'].includes(session.role)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const body = await req.json();
  const material = await db.learningMaterial.create({
    data: {
      title: body.title,
      description: body.description,
      category: body.category || 'quran',
      type: body.type || 'video',
      url: body.url,
      fileUrl: body.fileUrl,
      thumbnailUrl: body.thumbnailUrl,
      level: body.level || 'all',
      ageGroup: body.ageGroup || '3-7',
      duration: body.duration ? parseInt(body.duration) : null,
      surahNumber: body.surahNumber ? parseInt(body.surahNumber) : null,
      surahName: body.surahName,
      tags: body.tags,
      createdBy: session.id,
    },
  });

  return NextResponse.json({ material });
}
