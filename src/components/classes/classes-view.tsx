'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { GraduationCap, Plus, Edit, Trash2, Users } from 'lucide-react';
import type { Class, User } from '@/types';

function ClassForm({ cls, teachers, onSubmit, submitLabel }: { cls?: Class; teachers: User[]; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; submitLabel: string }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">اسم الفصل *</label>
        <Input name="name" defaultValue={cls?.name || ''} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">المعلم المسؤول</label>
        <Select name="teacherId" defaultValue={cls?.teacherId || ''}>
          <SelectTrigger><SelectValue placeholder="اختر المعلم" /></SelectTrigger>
          <SelectContent>
            {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">الوصف</label>
        <Input name="description" defaultValue={cls?.description || ''} />
      </div>
      <Button type="submit" className="w-full bg-gradient-to-l from-emerald-500 to-teal-600 text-white">{submitLabel}</Button>
    </form>
  );
}

export function ClassesView() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editClass, setEditClass] = useState<Class | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    const res = await fetch('/api/classes');
    const data = await res.json();
    if (data.classes) setClasses(data.classes);
    setLoading(false);
  };

  const fetchTeachers = async () => {
    const res = await fetch('/api/users?role=teacher');
    const data = await res.json();
    if (data.users) setTeachers(data.users);
  };

  useEffect(() => {
    fetch('/api/classes').then(r => r.json()).then(d => { if (d.classes) setClasses(d.classes); setLoading(false); });
    fetch('/api/users?role=teacher').then(r => r.json()).then(d => { if (d.users) setTeachers(d.users); });
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch('/api/classes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.class) { toast.success('تم إضافة الفصل'); setShowAdd(false); fetchClasses(); }
    else toast.error(data.error || 'فشل في الإضافة');
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editClass) return;
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch(`/api/classes/${editClass.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.class) { toast.success('تم تحديث الفصل'); setEditClass(null); fetchClasses(); }
    else toast.error('فشل في التحديث');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفصل؟')) return;
    const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.class) { toast.success('تم حذف الفصل'); fetchClasses(); }
    else toast.error('فشل في الحذف');
  };

  const gradients = [
    'from-emerald-500 to-teal-600',
    'from-teal-500 to-cyan-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
    'from-sky-500 to-blue-600',
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة الفصول</h1>
          <p className="text-muted-foreground text-sm mt-1">إنشاء وإدارة الفصول الدراسية</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-l from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Plus className="w-4 h-4 ml-2" />
              إضافة فصل
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>إضافة فصل جديد</DialogTitle></DialogHeader>
            <ClassForm teachers={teachers} onSubmit={handleAdd} submitLabel="إضافة الفصل" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls, i) => (
            <Card key={cls.id} className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-2 bg-gradient-to-l ${gradients[i % gradients.length]}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center shadow-lg`}>
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{cls.name}</h3>
                      <p className="text-xs text-muted-foreground">{(cls as any).teacher?.name || 'بدون معلم'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditClass(cls)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(cls.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{(cls as any).studentCount || 0} طالب</span>
                </div>
                {cls.description && <p className="text-xs text-muted-foreground mt-3">{cls.description}</p>}
              </CardContent>
            </Card>
          ))}
          {classes.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">لا يوجد فصول حتى الآن</div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editClass} onOpenChange={() => setEditClass(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>تعديل الفصل</DialogTitle></DialogHeader>
          {editClass && <ClassForm cls={editClass} teachers={teachers} onSubmit={handleEdit} submitLabel="حفظ التعديلات" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
