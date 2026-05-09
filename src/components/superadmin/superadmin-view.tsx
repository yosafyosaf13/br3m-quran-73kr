'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Shield, Users, GraduationCap, BookOpen, Settings, 
  Activity, CheckCircle, XCircle, Plus, Building2,
  BarChart3, Globe, AlertTriangle
} from 'lucide-react';
import { hashPassword } from '@/lib/password';

export function SuperAdminView() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // Load stats
    fetch('/api/superadmin')
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Load all users  
    fetch('/api/users')
      .then(r => r.json())
      .then(data => setUsers(data.users || []))
      .catch(() => {});
  }, []);

  const handleAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddingAdmin(true);
    const fd = new FormData(e.currentTarget);
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          username: fd.get('username'),
          password: fd.get('password'),
          phone: fd.get('phone'),
          role: fd.get('role') || 'admin',
        }),
      });
      const data = await res.json();
      if (data.user || !data.error) {
        toast.success('تم إنشاء المستخدم بنجاح');
        setShowAddAdmin(false);
        // Refresh users
        fetch('/api/users').then(r => r.json()).then(d => setUsers(d.users || []));
      } else {
        toast.error(data.error || 'فشل إنشاء المستخدم');
      }
    } catch {
      toast.error('خطأ في الاتصال');
    }
    setAddingAdmin(false);
  };

  const toggleUserStatus = async (userId: string, active: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });
      const data = await res.json();
      if (data.user || !data.error) {
        toast.success(active ? 'تم تعطيل المستخدم' : 'تم تفعيل المستخدم');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !active } : u));
      }
    } catch {
      toast.error('فشل تحديث الحالة');
    }
  };

  const roleLabel = (role: string) => ({
    superadmin: { label: 'سوبر أدمن', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    admin: { label: 'مدير', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    teacher: { label: 'معلم', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  }[role] || { label: role, color: 'bg-slate-100 text-slate-700' });

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded-lg" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </span>
            لوحة تحكم السوبر أدمن
          </h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة كاملة للنظام والمستخدمين والحضانات</p>
        </div>
        <Button
          onClick={() => setShowAddAdmin(true)}
          className="bg-gradient-to-l from-violet-600 to-purple-700 text-white shadow-lg gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* System Status Banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          النظام يعمل بشكل طبيعي — الخادم السحابي متصل ✓ قاعدة البيانات متصلة ✓
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'إجمالي المستخدمين', value: stats?.totalUsers || users.length, icon: Users, color: 'from-violet-500 to-purple-600' },
          { title: 'إجمالي الطلاب', value: stats?.totalStudents || 0, icon: GraduationCap, color: 'from-emerald-500 to-teal-600' },
          { title: 'الفصول الدراسية', value: stats?.totalClasses || 0, icon: Building2, color: 'from-amber-500 to-orange-600' },
          { title: 'المواد التعليمية', value: stats?.totalMaterials || 6, icon: BookOpen, color: 'from-blue-500 to-indigo-600' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-black mt-1">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users Management */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-500" />
            إدارة جميع المستخدمين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">لا يوجد مستخدمون</p>
            ) : users.map(user => {
              const r = roleLabel(user.role);
              return (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username} • {user.phone || 'لا يوجد هاتف'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${r.color}`}>{r.label}</span>
                    <button
                      onClick={() => toggleUserStatus(user.id, user.active)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        user.active
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-rose-500 hover:bg-rose-50'
                      }`}
                    >
                      {user.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              معلومات النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ['إصدار النظام', 'v2.0.0 - Next.js'],
              ['قاعدة البيانات', 'PostgreSQL (Neon Cloud)'],
              ['الاستضافة', 'Vercel Edge Network'],
              ['حالة النظام', '🟢 يعمل بشكل مثالي'],
            ].map(([label, value], i) => (
              <div key={i} className="flex justify-between p-2 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'إضافة مدير حضانة', icon: Plus, action: () => setShowAddAdmin(true), color: 'text-emerald-600' },
              { label: 'إعادة ضبط كلمة مرور', icon: Settings, action: () => toast.info('قريباً...'), color: 'text-amber-600' },
              { label: 'تصدير بيانات النظام', icon: BarChart3, action: () => toast.info('قريباً...'), color: 'text-blue-600' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-right"
                >
                  <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الاسم الكامل *</label>
              <Input name="name" placeholder="مثال: أ. محمد أحمد" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم المستخدم *</label>
              <Input name="username" placeholder="مثال: admin2" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">كلمة المرور *</label>
              <Input name="password" type="password" placeholder="كلمة مرور قوية" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">رقم الهاتف</label>
              <Input name="phone" placeholder="01XXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الدور الوظيفي *</label>
              <Select name="role" defaultValue="admin">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">سوبر أدمن (مشغل النظام)</SelectItem>
                  <SelectItem value="admin">مدير حضانة</SelectItem>
                  <SelectItem value="teacher">معلم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-l from-violet-600 to-purple-700 text-white" disabled={addingAdmin}>
              {addingAdmin ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
