'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { CreditCard, Plus, Search, Trash2 } from 'lucide-react';
import type { Payment, Student } from '@/types';

const typeLabels: Record<string, string> = { registration: 'تسجيل', monthly: 'شهري', other: 'أخرى' };
const monthLabels = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

export function PaymentsView() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterType !== 'all') params.set('type', filterType);
    const res = await fetch(`/api/payments?${params}`);
    const data = await res.json();
    if (data.payments) setPayments(data.payments);
    setLoading(false);
  };

  useEffect(() => {
    fetch('/api/students?approvalStatus=approved').then(r => r.json()).then(d => { if (d.students) setStudents(d.students); });
    fetch('/api/payments').then(r => r.json()).then(d => { if (d.payments) setPayments(d.payments); setLoading(false); });
  }, []);

  useEffect(() => { const t = setTimeout(fetchPayments, 500); return () => clearTimeout(t); }, [search, filterType]);

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body: any = Object.fromEntries(fd.entries());
    body.amount = parseFloat(body.amount);
    if (body.year) body.year = parseInt(body.year);
    const res = await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.payment || !data.error) {
      toast.success('تم تسجيل الدفعة بنجاح');
      setShowAdd(false);
      fetchPayments();
    } else {
      toast.error(data.error || 'فشل في التسجيل');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدفعة؟')) return;
    const res = await fetch(`/api/payments?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.error) { toast.success('تم حذف الدفعة'); fetchPayments(); }
    else toast.error(data.error || 'فشل في الحذف');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">المدفوعات</h1>
          <p className="text-muted-foreground text-sm mt-1">تسجيل ومتابعة المدفوعات والرسوم</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-l from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
              <Plus className="w-4 h-4 ml-2" />
              تسجيل دفعة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>تسجيل دفعة جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الطالب *</label>
                <Select name="studentId" required>
                  <SelectTrigger><SelectValue placeholder="اختر الطالب" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">المبلغ (ج.م) *</label>
                  <Input name="amount" type="number" min={0} step={0.01} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">النوع *</label>
                  <Select name="type" required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registration">رسوم تسجيل</SelectItem>
                      <SelectItem value="monthly">رسوم شهرية</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الشهر</label>
                  <Select name="month">
                    <SelectTrigger><SelectValue placeholder="اختر الشهر" /></SelectTrigger>
                    <SelectContent>
                      {monthLabels.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">السنة</label>
                  <Input name="year" type="number" defaultValue={new Date().getFullYear()} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">تاريخ الدفع</label>
                <Input name="paymentDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ملاحظات</label>
                <Input name="notes" />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-l from-amber-500 to-orange-600 text-white">تسجيل الدفعة</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي المدفوعات</p>
              <p className="text-xl font-bold">{totalAmount.toLocaleString()} ج.م</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">عدد العمليات</p>
              <p className="text-xl font-bold">{payments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">متوسط الدفعة</p>
              <p className="text-xl font-bold">{payments.length > 0 ? Math.round(totalAmount / payments.length).toLocaleString() : 0} ج.م</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="بحث باسم الطالب..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="النوع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="registration">تسجيل</SelectItem>
                <SelectItem value="monthly">شهري</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الطالب</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الشهر</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>ملاحظات</TableHead>
                  <TableHead>حذف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">جاري التحميل...</TableCell></TableRow>
                ) : payments.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">لا يوجد مدفوعات</TableCell></TableRow>
                ) : payments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-sm">{(p as any).student?.name || '—'}</TableCell>
                    <TableCell className="text-sm font-bold text-emerald-600">{p.amount.toLocaleString()} ج.م</TableCell>
                    <TableCell><Badge variant="outline">{typeLabels[p.type]}</Badge></TableCell>
                    <TableCell className="text-sm">{p.month ? monthLabels[parseInt(p.month) - 1] : '—'}</TableCell>
                    <TableCell className="text-sm">{p.paymentDate}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.notes || '—'}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
