'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Home, Search, BookOpen, UserCheck, Award, Star, Phone, CreditCard,
  BarChart3, Calendar, Clock, TrendingUp, CheckCircle2, XCircle,
  AlertCircle, ChevronLeft, LogOut, Users, GraduationCap, Sparkles,
  Moon, ArrowLeft
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';

interface StudentWithStats {
  id: string;
  name: string;
  gender: string;
  birthDate?: string;
  class?: { id: string; name: string; description?: string };
  parentName?: string;
  noorAlBayanLevel: number;
  attendance: any[];
  memorization: any[];
  payments: any[];
  skills: any[];
  stats: {
    attendancePercent: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    totalAttendance: number;
    attendanceByDay: { date: string; status: string }[];
    totalMemorization: number;
    sabakCount: number;
    sabqiCount: number;
    manzilCount: number;
    surahCount: number;
    gradeDistribution: Record<string, number>;
    totalPaid: number;
    monthPaid: boolean;
    skillsAvg: number;
  };
}

interface PortalData {
  students: StudentWithStats[];
  parentName: string;
}

const GRADE_LABELS: Record<string, string> = {
  excellent: 'ممتاز',
  very_good: 'جيد جداً',
  good: 'جيد',
  acceptable: 'مقبول',
  weak: 'ضعيف',
};

const GRADE_COLORS: Record<string, string> = {
  excellent: '#10b981',
  very_good: '#14b8a6',
  good: '#f59e0b',
  acceptable: '#f97316',
  weak: '#ef4444',
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  present: { label: 'حاضر', color: 'bg-emerald-500', icon: CheckCircle2 },
  absent: { label: 'غائب', color: 'bg-rose-500', icon: XCircle },
  late: { label: 'متأخر', color: 'bg-amber-500', icon: Clock },
  excused: { label: 'معذور', color: 'bg-teal-500', icon: AlertCircle },
};

export function PortalView() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [selectedStudent, setSelectedStudent] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      toast.error('أدخل رقم هاتف صحيح');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/portal?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (data.students) {
        setPortalData(data);
        setLoggedIn(true);
        setSelectedStudent(0);
      } else {
        toast.error(data.error || 'لم يتم العثهور على طلاب مرتبطين بهذا الرقم');
      }
    } catch {
      toast.error('خطأ في الاتصال');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setPortalData(null);
    setPhone('');
    setSelectedStudent(0);
  };

  // ===== Login Screen =====
  if (!loggedIn || !portalData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-fade-in-up">
        <div className="w-full max-w-lg space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/25">
              <Home className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">بوابة أولياء الأمور</h1>
              <p className="text-sm text-muted-foreground mt-2">
                تابع مستوى ابنك في حفظ القرآن الكريم بسهولة
              </p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-xl glass-card">
            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    رقم هاتف ولي الأمر
                  </label>
                  <Input
                    placeholder="أدخل رقم الهاتف المسجل لدى الحلقة"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    className="h-12 text-center text-lg"
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground">
                    أدخل رقم الهاتف الذي سجلت به عند تقديم طلب الالتحاق
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-base font-medium shadow-lg shadow-emerald-500/25"
                  disabled={loading}
                >
                  {loading ? 'جاري البحث...' : 'الدخول للبوابة'}
                  {!loading && <ChevronLeft className="w-5 h-5 mr-1" />}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: UserCheck, label: 'متابعة الحضور', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
              { icon: BookOpen, label: 'سجل الحفظ', color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
              { icon: CreditCard, label: 'المدفوعات', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="text-center p-3 rounded-xl bg-white/60 dark:bg-card/60 border shadow-sm">
                  <div className={`w-10 h-10 mx-auto rounded-xl ${item.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const student = portalData.students[selectedStudent];
  const stats = student.stats;

  // ===== Main Portal Dashboard =====
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6 text-emerald-600" />
            بوابة ولي الأمر
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            مرحباً {portalData.parentName} — متابعة مستقبل أبنائك القرآني
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="w-4 h-4" />
          خروج
        </Button>
      </div>

      {/* Student Selector (if multiple children) */}
      {portalData.students.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {portalData.students.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSelectedStudent(i)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all whitespace-nowrap ${
                i === selectedStudent
                  ? 'bg-gradient-to-l from-emerald-500 to-teal-600 text-white border-transparent shadow-lg shadow-emerald-500/25'
                  : 'bg-white dark:bg-card border-emerald-100 dark:border-emerald-900/20 hover:shadow-md'
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className={`text-sm font-bold ${
                  i === selectedStudent
                    ? 'bg-white/20 text-white'
                    : 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                }`}>
                  {s.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-bold">{s.name}</p>
                <p className={`text-xs ${i === selectedStudent ? 'text-emerald-100' : 'text-muted-foreground'}`}>
                  {s.class?.name || 'غير محدد'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Student Profile Card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="h-2 bg-gradient-to-l from-emerald-500 via-teal-500 to-cyan-500" />
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-2xl font-bold">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold truncate">{student.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {student.class?.name || 'غير محدد'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {student.gender === 'male' ? 'ذكر' : 'أنثى'}
                </Badge>
                {student.noorAlBayanLevel > 0 && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Sparkles className="w-3 h-3" />
                    نور البيان: مستوى {student.noorAlBayanLevel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            title: 'نسبة الحضور',
            value: `${stats.attendancePercent}%`,
            icon: UserCheck,
            color: 'from-emerald-500 to-teal-600',
            sub: `${stats.presentCount} حضور من ${stats.totalAttendance}`,
          },
          {
            title: 'سور محفوظة',
            value: stats.surahCount,
            icon: BookOpen,
            color: 'from-teal-500 to-cyan-600',
            sub: `${stats.totalMemorization} سجل حفظ`,
          },
          {
            title: 'المدفوعات',
            value: `${stats.totalPaid.toLocaleString()} ج.م`,
            icon: CreditCard,
            color: 'from-amber-500 to-orange-600',
            sub: stats.monthPaid ? 'اشتراك الشهر مسدد ✓' : 'اشتراك الشهر معلق',
          },
          {
            title: 'تقييم المهارات',
            value: `${stats.skillsAvg}/5`,
            icon: Star,
            color: 'from-violet-500 to-purple-600',
            sub: `${student.skills.length} مهارة مقيمة`,
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-muted-foreground font-medium">{card.title}</p>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Alert */}
      {!stats.monthPaid && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">اشتراك الشهر الحالي معلق</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">يرجى تسديد الاشتراك في أقرب وقت لضمان استمرار التحاق ابنكم بالحلقة</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg text-xs sm:text-sm gap-1">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">نظرة عامة</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-lg text-xs sm:text-sm gap-1">
            <UserCheck className="w-4 h-4" />
            <span className="hidden sm:inline">الحضور</span>
          </TabsTrigger>
          <TabsTrigger value="memorization" className="rounded-lg text-xs sm:text-sm gap-1">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">الحفظ</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg text-xs sm:text-sm gap-1">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">المدفوعات</span>
          </TabsTrigger>
        </TabsList>

        {/* ===== Overview Tab ===== */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Attendance Pie */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  توزيع الحضور
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.totalAttendance > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'حاضر', value: stats.presentCount, color: '#10b981' },
                            { name: 'غائب', value: stats.absentCount, color: '#ef4444' },
                            { name: 'متأخر', value: stats.lateCount, color: '#f59e0b' },
                            { name: 'معذور', value: stats.excusedCount, color: '#14b8a6' },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {[
                            { color: '#10b981' },
                            { color: '#ef4444' },
                            { color: '#f59e0b' },
                            { color: '#14b8a6' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    لا توجد بيانات حضور حتى الآن
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {Object.entries(STATUS_MAP).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1.5 text-xs">
                      <div className={`w-2.5 h-2.5 rounded-full ${val.color}`} />
                      <span>{val.label}: {stats[key === 'present' ? 'presentCount' : key === 'absent' ? 'absentCount' : key === 'late' ? 'lateCount' : 'excusedCount'] as number}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Memorization by Type */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-500" />
                  سجلات الحفظ حسب النوع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { type: 'سبق', count: stats.sabakCount, fill: '#10b981' },
                        { type: 'سبقي', count: stats.sabqiCount, fill: '#14b8a6' },
                        { type: 'منزل', count: stats.manzilCount, fill: '#f59e0b' },
                      ]}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="type" type="category" tick={{ fontSize: 12 }} width={50} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" name="العدد" radius={[0, 6, 6, 0]}>
                        {[
                          { fill: '#10b981' },
                          { fill: '#14b8a6' },
                          { fill: '#f59e0b' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                آخر النشاطات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Recent memorization */}
                {student.memorization.slice(0, 3).map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      m.type === 'sabak' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                      m.type === 'sabqi' ? 'bg-gradient-to-br from-teal-400 to-cyan-500' :
                      'bg-gradient-to-br from-amber-400 to-orange-500'
                    }`}>
                      {m.type === 'sabak' ? 'س' : m.type === 'sabqi' ? 'ق' : 'م'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.surahName} — {m.type === 'sabak' ? 'سبق' : m.type === 'sabqi' ? 'سبقي' : 'منزل'}</p>
                      <p className="text-xs text-muted-foreground">المعلم: {m.teacher?.name || 'غير محدد'} • {m.date}</p>
                    </div>
                    {m.grade && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {GRADE_LABELS[m.grade] || m.grade}
                      </Badge>
                    )}
                  </div>
                ))}

                {/* Recent attendance */}
                {student.attendance.slice(0, 2).map((a: any) => {
                  const statusInfo = STATUS_MAP[a.status];
                  const StatusIcon = statusInfo?.icon || CheckCircle2;
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${statusInfo?.color || 'bg-gray-400'}`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">حضور يوم {a.date}</p>
                        <p className="text-xs text-muted-foreground">{statusInfo?.label || a.status}</p>
                      </div>
                    </div>
                  );
                })}

                {student.memorization.length === 0 && student.attendance.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">لا توجد نشاطات مسجلة حتى الآن</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {student.skills.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  تقييم المهارات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {student.skills.map((skill: any) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                      <div>
                        <p className="text-sm font-medium">{skill.skillName}</p>
                        <p className="text-xs text-muted-foreground">{skill.skillCategory}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= skill.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== Attendance Tab ===== */}
        <TabsContent value="attendance" className="space-y-4">
          {/* Attendance Progress */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                نسبة الحضور الإجمالية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>نسبة الحضور</span>
                <span className="font-bold text-emerald-600">{stats.attendancePercent}%</span>
              </div>
              <Progress value={stats.attendancePercent} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>حاضر: {stats.presentCount}</span>
                <span>غائب: {stats.absentCount}</span>
                <span>متأخر: {stats.lateCount}</span>
                <span>معذور: {stats.excusedCount}</span>
              </div>
              {stats.attendancePercent >= 90 && (
                <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">حضور ممتاز! استمر في تشجيع ابنك على المواظبة</p>
                </div>
              )}
              {stats.attendancePercent < 75 && stats.attendancePercent > 0 && (
                <div className="flex items-center gap-2 p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <p className="text-xs text-rose-700 dark:text-rose-400">نسبة الحضور منخفضة، يرجى متابعة ابنك بشكل أكبر</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">سجل الحضور الأخير</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.attendanceByDay.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.attendanceByDay.map(d => ({
                      date: d.date.slice(5),
                      value: d.status === 'present' ? 3 : d.status === 'late' ? 2 : d.status === 'excused' ? 1 : 0,
                      status: STATUS_MAP[d.status]?.label || d.status,
                      fill: d.status === 'present' ? '#10b981' : d.status === 'late' ? '#f59e0b' : d.status === 'excused' ? '#14b8a6' : '#ef4444',
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} tickFormatter={(v) => v === 0 ? 'غائب' : v === 1 ? 'معذور' : v === 2 ? 'متأخر' : 'حاضر'} tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} formatter={(v: number, n: string, p: any) => p.payload.status} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {stats.attendanceByDay.map((d, i) => (
                          <Cell key={i} fill={d.status === 'present' ? '#10b981' : d.status === 'late' ? '#f59e0b' : d.status === 'excused' ? '#14b8a6' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  لا توجد بيانات حضور حتى الآن
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Attendance List */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">تفاصيل الحضور</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {student.attendance.slice(0, 15).map((a: any) => {
                  const statusInfo = STATUS_MAP[a.status];
                  const StatusIcon = statusInfo?.icon || CheckCircle2;
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                      <div className={`w-8 h-8 rounded-full ${statusInfo?.color || 'bg-gray-400'} flex items-center justify-center text-white shrink-0`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.date}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{statusInfo?.label || a.status}</Badge>
                      {a.notes && <p className="text-xs text-muted-foreground">{a.notes}</p>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Memorization Tab ===== */}
        <TabsContent value="memorization" className="space-y-4">
          {/* Memorization Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'سبق', count: stats.sabakCount, color: 'from-emerald-500 to-teal-600', icon: 'س' },
              { label: 'سبقي', count: stats.sabqiCount, color: 'from-teal-500 to-cyan-600', icon: 'ق' },
              { label: 'منزل', count: stats.manzilCount, color: 'from-amber-500 to-orange-600', icon: 'م' },
            ].map((item, i) => (
              <Card key={i} className="border-0 shadow-md text-center">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-lg shadow-lg mb-2`}>
                    {item.icon}
                  </div>
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Grade Distribution */}
          {Object.keys(stats.gradeDistribution).length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  توزيع التقديرات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(stats.gradeDistribution).map(([grade, count]) => ({
                        grade: GRADE_LABELS[grade] || grade,
                        count,
                        fill: GRADE_COLORS[grade] || '#6b7280',
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" name="العدد" radius={[6, 6, 0, 0]}>
                        {Object.entries(stats.gradeDistribution).map(([grade], index) => (
                          <Cell key={index} fill={GRADE_COLORS[grade] || '#6b7280'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Memorization Records */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">سجل الحفظ التفصيلي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {student.memorization.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/20">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                      m.type === 'sabak' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                      m.type === 'sabqi' ? 'bg-gradient-to-br from-teal-400 to-cyan-500' :
                      'bg-gradient-to-br from-amber-400 to-orange-500'
                    }`}>
                      {m.type === 'sabak' ? 'سبق' : m.type === 'sabqi' ? 'سبقي' : 'منزل'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{m.surahName} (الآيات {m.fromAyah}-{m.toAyah})</p>
                      <p className="text-xs text-muted-foreground">
                        {m.date} • المعلم: {m.teacher?.name || 'غير محدد'}
                      </p>
                    </div>
                    {m.grade && (
                      <Badge
                        className="text-xs shrink-0"
                        style={{
                          backgroundColor: `${GRADE_COLORS[m.grade] || '#6b7280'}15`,
                          color: GRADE_COLORS[m.grade] || '#6b7280',
                          borderColor: `${GRADE_COLORS[m.grade] || '#6b7280'}30`,
                        }}
                      >
                        {GRADE_LABELS[m.grade] || m.grade}
                      </Badge>
                    )}
                  </div>
                ))}
                {student.memorization.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">لا توجد سجلات حفظ حتى الآن</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Payments Tab ===== */}
        <TabsContent value="payments" className="space-y-4">
          {/* Payment Summary */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المدفوعات</p>
                  <p className="text-3xl font-bold gradient-text">{stats.totalPaid.toLocaleString()} ج.م</p>
                </div>
                <div className={`px-4 py-2 rounded-xl ${stats.monthPaid ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                  <p className={`text-xs font-medium ${stats.monthPaid ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    {stats.monthPaid ? '✓ اشتراك الشهر مسدد' : '⚠ اشتراك الشهر معلق'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments List */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">سجل المدفوعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {student.payments.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/20">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {p.type === 'registration' ? 'رسوم تسجيل' : p.type === 'monthly' ? 'اشتراك شهري' : 'أخرى'}
                        {p.month && ` — ${p.month}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.paymentDate}{p.notes && ` • ${p.notes}`}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-600 shrink-0">{p.amount.toLocaleString()} ج.م</p>
                  </div>
                ))}
                {student.payments.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">لا توجد مدفوعات مسجلة حتى الآن</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
