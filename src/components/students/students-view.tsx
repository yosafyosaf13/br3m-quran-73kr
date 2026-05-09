'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Plus, Search, Eye, Edit, Trash2, UserPlus, Filter } from 'lucide-react';
import type { Student, Class } from '@/types';

function StudentForm({ student, classes, onSubmit, submitLabel }: { student?: Student; classes: Class[]; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; submitLabel: string }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">اسم الطالب *</label>
          <Input name="name" defaultValue={student?.name || ''} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الجنس</label>
          <Select name="gender" defaultValue={student?.gender || 'male'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">ذكر</SelectItem>
              <SelectItem value="female">أنثى</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">تاريخ الميلاد</label>
          <Input name="birthDate" type="date" defaultValue={student?.birthDate || ''} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الفصل</label>
          <Select name="classId" defaultValue={student?.classId || ''}>
            <SelectTrigger><SelectValue placeholder="اختر الفصل" /></SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">اسم ولي الأمر</label>
          <Input name="parentName" defaultValue={student?.parentName || ''} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">هاتف ولي الأمر</label>
          <Input name="parentPhone" defaultValue={student?.parentPhone || ''} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">هاتف بديل</label>
          <Input name="parentPhone2" defaultValue={student?.parentPhone2 || ''} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">العنوان</label>
          <Input name="address" defaultValue={student?.address || ''} />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">ملاحظات</label>
        <Input name="notes" defaultValue={student?.notes || ''} />
      </div>
      <Button type="submit" className="w-full bg-gradient-to-l from-emerald-500 to-teal-600 text-white">{submitLabel}</Button>
    </form>
  );
}

export function StudentsView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterClass !== 'all') params.set('classId', filterClass);
    if (filterGender !== 'all') params.set('gender', filterGender);
    if (filterStatus !== 'all') params.set('approvalStatus', filterStatus);
    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data.students || data.data || []);
    setLoading(false);
  };

  const fetchClasses = async () => {
    const res = await fetch('/api/classes');
    const data = await res.json();
    setClasses(data.classes || data.data || data || []);
  };

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(d => { setStudents(d.students || d.data || []); setLoading(false); });
    fetch('/api/classes').then(r => r.json()).then(d => { setClasses(d.classes || d.data || d || []); });
  }, []);

  const handleSearch = () => fetchStudents();
  useEffect(() => { const t = setTimeout(fetchStudents, 500); return () => clearTimeout(t); }, [search, filterClass, filterGender, filterStatus]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.student || !data.error) {
      toast.success('تم إضافة الطالب بنجاح');
      setShowAdd(false);
      fetchStudents();
    } else {
      toast.error(data.error || 'فشل في إضافة الطالب');
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editStudent) return;
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch(`/api/students/${editStudent.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.student || !data.error) {
      toast.success('تم تحديث بيانات الطالب');
      setEditStudent(null);
      fetchStudents();
    } else {
      toast.error(data.error || 'فشل في التحديث');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.student || !data.error) {
      toast.success('تم حذف الطالب');
      fetchStudents();
    } else {
      toast.error(data.error || 'فشل في حذف الطالب');
    }
  };

  const handleApprove = async (id: string, status: string) => {
    const res = await fetch(`/api/students/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approvalStatus: status }) });
    const data = await res.json();
    if (data.student || !data.error) {
      toast.success(status === 'approved' ? 'تم قبول الطالب' : 'تم رفض الطالب');
      fetchStudents();
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      approved: { label: 'مقبول', variant: 'default' },
      pending: { label: 'معلق', variant: 'secondary' },
      rejected: { label: 'مرفوض', variant: 'destructive' },
    };
    const s = map[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة الطلاب</h1>
          <p className="text-muted-foreground text-sm mt-1">إضافة وتعديل وحذف بيانات الطلاب</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-l from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة طالب
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة طالب جديد</DialogTitle>
            </DialogHeader>
            <StudentForm classes={classes} onSubmit={handleAdd} submitLabel="إضافة الطالب" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="بحث بالاسم أو الهاتف..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
              </div>
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="الفصل" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفصول</SelectItem>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterGender} onValueChange={setFilterGender}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="الجنس" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="male">ذكر</SelectItem>
                <SelectItem value="female">أنثى</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="approved">مقبول</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الطالب</TableHead>
                  <TableHead>الفصل</TableHead>
                  <TableHead>الجنس</TableHead>
                  <TableHead>ولي الأمر</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">جاري التحميل...</TableCell></TableRow>
                ) : students.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">لا يوجد طلاب</TableCell></TableRow>
                ) : students.map(student => (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs">
                            {student.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{(student as any).class?.name || '—'}</TableCell>
                    <TableCell className="text-sm">{student.gender === 'male' ? 'ذكر' : 'أنثى'}</TableCell>
                    <TableCell className="text-sm">{student.parentName || '—'}</TableCell>
                    <TableCell className="text-sm">{student.parentPhone || '—'}</TableCell>
                    <TableCell>{statusBadge(student.approvalStatus)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewStudent(student)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditStudent(student)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(student.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {student.approvalStatus === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600" onClick={() => handleApprove(student.id, 'approved')}>قبول</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs text-rose-600" onClick={() => handleApprove(student.id, 'rejected')}>رفض</Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Student Dialog */}
      <Dialog open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>بيانات الطالب</DialogTitle>
          </DialogHeader>
          {viewStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-lg">
                    {viewStudent.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{viewStudent.name}</h3>
                  <p className="text-sm text-muted-foreground">{(viewStudent as any).class?.name || 'غير محدد'} • {viewStudent.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                  {statusBadge(viewStudent.approvalStatus)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['تاريخ الميلاد', viewStudent.birthDate],
                  ['تاريخ الالتحاق', viewStudent.enrollmentDate],
                  ['ولي الأمر', viewStudent.parentName],
                  ['الهاتف', viewStudent.parentPhone],
                  ['هاتف بديل', viewStudent.parentPhone2],
                  ['العنوان', viewStudent.address],
                  ['مستوى نور البيان', `المستوى ${viewStudent.noorAlBayanLevel}`],
                ].map(([label, value], i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground text-xs mb-1">{label}</p>
                    <p className="font-medium">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={!!editStudent} onOpenChange={() => setEditStudent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الطالب</DialogTitle>
          </DialogHeader>
          {editStudent && <StudentForm student={editStudent} classes={classes} onSubmit={handleEdit} submitLabel="حفظ التعديلات" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
