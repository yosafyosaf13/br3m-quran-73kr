'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, UserCheck, BookOpen, CreditCard, GraduationCap, Clock, AlertCircle, TrendingUp,
  ArrowUpLeft, ArrowDownLeft,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
} from 'recharts';
import type { DashboardStats } from '@/types';

const COLORS = ['#10b981', '#f59e0b', '#14b8a6', '#f43f5e', '#8b5cf6'];

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error || 'حدث خطأ في تحميل البيانات');
          return;
        }
        // API returns data directly, transform memorizationByType from object to array
        const memByType = data.memorizationByType;
        const memTypeArray = memByType ? Object.entries(memByType).map(([type, count]) => ({
          type: type === 'sabak' ? 'سبق' : type === 'sabqi' ? 'سبقي' : 'منزل',
          count: count as number,
        })) : [];
        // Transform gradeDistribution from object to array
        const gradeDist = data.gradeDistribution;
        const gradeArray = gradeDist ? Object.entries(gradeDist).map(([grade, count]) => ({
          grade: grade === 'excellent' ? 'ممتاز' : grade === 'very_good' ? 'جيد جداً' : grade === 'good' ? 'جيد' : grade === 'acceptable' ? 'مقبول' : 'ضعيف',
          count: count as number,
        })) : [];
        setStats({
          ...data,
          memorizationByType: memTypeArray,
          gradeDistribution: gradeArray,
          paymentTrend: (data.paymentTrend || []).map((p: any) => ({ month: p.month, amount: p.total || p.amount || 0 })),
        } as any);
      })
      .catch((err) => {
        console.error('Dashboard fetch error:', err);
        setError('حدث خطأ في الاتصال بالخادم');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-muted rounded-2xl" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">لوحة التحكم</h1>
            <p className="text-muted-foreground text-sm mt-1">نظرة عامة على نظام براعم تحفيظ القرآن الكريم</p>
          </div>
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-rose-400 mb-3" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => { setError(null); setLoading(true); }} variant="outline">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todayTotal = stats.todayAttendance.present + stats.todayAttendance.absent + stats.todayAttendance.late + stats.todayAttendance.excused;
  const attendancePercent = todayTotal > 0 ? Math.round((stats.todayAttendance.present / todayTotal) * 100) : 0;

  const attendancePie = [
    { name: 'حاضر', value: stats.todayAttendance.present, color: '#10b981' },
    { name: 'غائب', value: stats.todayAttendance.absent, color: '#f43f5e' },
    { name: 'متأخر', value: stats.todayAttendance.late, color: '#f59e0b' },
    { name: 'معذور', value: stats.todayAttendance.excused, color: '#14b8a6' },
  ].filter(d => d.value > 0);

  const statCards = [
    { title: 'إجمالي الطلاب', value: stats.totalStudents, icon: Users, color: 'from-emerald-500 to-teal-600', trend: '+12%', up: true },
    { title: 'الفصول', value: stats.totalClasses, icon: GraduationCap, color: 'from-teal-500 to-cyan-600', trend: '+2', up: true },
    { title: 'نسبة الحضور اليوم', value: `${attendancePercent}%`, icon: UserCheck, color: 'from-amber-500 to-orange-600', trend: `${stats.todayAttendance.present} حاضر`, up: true },
    { title: 'إيرادات الشهر', value: `${stats.monthlyRevenue.toLocaleString()} ج.م`, icon: CreditCard, color: 'from-rose-500 to-pink-600', trend: '', up: true },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground text-sm mt-1">نظرة عامة على نظام براعم تحفيظ القرآن الكريم</p>
        </div>
        {stats.pendingApprovals > 0 && (
          <Badge variant="destructive" className="w-fit text-sm py-1.5 px-3">
            <AlertCircle className="w-4 h-4 ml-1" />
            {stats.pendingApprovals} طلب تسجيل معلق
          </Badge>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="stat-card border-0 shadow-md overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">{card.title}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                    {card.trend && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                        {card.up ? <ArrowUpLeft className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        <span>{card.trend}</span>
                      </div>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Trend */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              اتجاه الحضور - آخر 7 أيام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.attendanceTrend}>
                  <defs>
                    <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="present" name="حاضر" stroke="#10b981" fill="url(#presentGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="absent" name="غائب" stroke="#f43f5e" fill="url(#absentGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance Pie */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-500" />
              حضور اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendancePie}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {attendancePie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {attendancePie.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Trend */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" />
              الإيرادات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.paymentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} formatter={(v: number) => `${v} ج.م`} />
                  <Bar dataKey="amount" name="المبلغ" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Memorization by Type */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-500" />
              سجل الحفظ حسب النوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.memorizationByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="type" type="category" tick={{ fontSize: 12 }} width={60} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" name="العدد" radius={[0, 6, 6, 0]}>
                    {stats.memorizationByType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Students */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              أحدث الطلاب المسجلين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentStudents.map((student: any) => (
                <div key={student.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {student.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.class?.name || 'غير محدد'}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {student.gender === 'male' ? 'ذكر' : 'أنثى'}
                  </Badge>
                </div>
              ))}
              {stats.recentStudents.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">لا يوجد طلاب حتى الآن</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Memorization */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-500" />
              آخر سجلات الحفظ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentMemorization.map((memo: any) => (
                <div key={memo.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {memo.type === 'sabak' ? 'س' : memo.type === 'sabqi' ? 'ق' : 'م'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{memo.student?.name} - {memo.surahName}</p>
                    <p className="text-xs text-muted-foreground">
                      {memo.type === 'sabak' ? 'سبق' : memo.type === 'sabqi' ? 'سبقي' : 'منزل'} • {memo.teacher?.name}
                    </p>
                  </div>
                  {memo.grade && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      {memo.grade === 'excellent' ? 'ممتاز' : memo.grade === 'very_good' ? 'جيد جداً' : memo.grade === 'good' ? 'جيد' : memo.grade === 'acceptable' ? 'مقبول' : 'ضعيف'}
                    </Badge>
                  )}
                </div>
              ))}
              {stats.recentMemorization.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">لا يوجد سجلات حفظ حتى الآن</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
