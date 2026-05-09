import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [
      totalStudents,
      totalClasses,
      totalTeachers,
      totalMemorization,
    ] = await Promise.all([
      db.student.count({ where: { active: true } }),
      db.class.count({ where: { active: true } }),
      db.user.count({ where: { active: true, role: 'teacher' } }),
      db.memorization.count(),
    ]);

    return NextResponse.json({
      totalStudents,
      totalClasses,
      totalTeachers,
      totalMemorization,
    });
  } catch (error) {
    // If database isn't seeded yet, return zeros
    return NextResponse.json({
      totalStudents: 0,
      totalClasses: 0,
      totalTeachers: 0,
      totalMemorization: 0,
    });
  }
}
