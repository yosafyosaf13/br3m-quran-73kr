'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { BookOpen, Plus, Search, Trash2 } from 'lucide-react';
import type { Memorization, Student, Class, User } from '@/types';

const SURAH_NAMES: [number, string][] = [
  [1,'الفاتحة'],[2,'البقرة'],[3,'آل عمران'],[4,'النساء'],[5,'المائدة'],[6,'الأنعام'],[7,'الأعراف'],
  [8,'الأنفال'],[9,'التوبة'],[10,'يونس'],[11,'هود'],[12,'يوسف'],[13,'الرعد'],[14,'إبراهيم'],
  [15,'الحجر'],[16,'النحل'],[17,'الإسراء'],[18,'الكهف'],[19,'مريم'],[20,'طه'],
  [21,'الأنبياء'],[22,'الحج'],[23,'المؤمنون'],[24,'النور'],[25,'الفرقان'],[26,'الشعراء'],
  [27,'النمل'],[28,'القصص'],[29,'العنكبوت'],[30,'الروم'],[31,'لقمان'],[32,'السجدة'],
  [33,'الأحزاب'],[34,'سبأ'],[35,'فاطر'],[36,'يس'],[37,'الصافات'],[38,'ص'],[39,'الزمر'],
  [40,'غافر'],[41,'فصلت'],[42,'الشورى'],[43,'الزخرف'],[44,'الدخان'],[45,'الجاثية'],
  [46,'الأحقاف'],[47,'محمد'],[48,'الفتح'],[49,'الحجرات'],[50,'ق'],[51,'الذاريات'],
  [52,'الطور'],[53,'النجم'],[54,'القمر'],[55,'الرحمن'],[56,'الواقعة'],[57,'الحديد'],
  [58,'المجادلة'],[59,'الحشر'],[60,'الممتحنة'],[61,'الصف'],[62,'الجمعة'],[63,'المنافقون'],
  [64,'التغابن'],[65,'الطلاق'],[66,'التحريم'],[67,'الملك'],[68,'القلم'],[69,'الحاقة'],
  [70,'المعارج'],[71,'نوح'],[72,'الجن'],[73,'المزمل'],[74,'المدثر'],[75,'القيامة'],
  [76,'الإنسان'],[77,'المرسلات'],[78,'النبأ'],[79,'النازعات'],[80,'عبس'],[81,'التكوير'],
  [82,'الانفطار'],[83,'المطففين'],[84,'الانشقاق'],[85,'البروج'],[86,'الطارق'],
  [87,'الأعلى'],[88,'الغاشية'],[89,'الفجر'],[90,'البلد'],[91,'الشمس'],[92,'الليل'],
  [93,'الضحى'],[94,'الشرح'],[95,'التين'],[96,'العلق'],[97,'القدر'],[98,'البينة'],
  [99,'الزلزلة'],[100,'العاديات'],[101,'القارعة'],[102,'التكاثر'],[103,'العصر'],
  [104,'الهمزة'],[105,'الفيل'],[106,'قريش'],[107,'الماعون'],[108,'الكوثر'],
  [109,'الكافرون'],[110,'النصر'],[111,'المسد'],[112,'الإخلاص'],[113,'الفلق'],[114,'الناس'],
];

const typeLabels: Record<string, string> = { sabak: 'سبق', sabqi: 'سبقي', manzil: 'منزل' };
const gradeLabels: Record<string, string> = { excellent: 'ممتاز', very_good: 'جيد جداً', good: 'جيد', acceptable: 'مقبول', weak: 'ضعيف' };
const gradeColors: Record<string, string> = { excellent: 'bg-emerald-100 text-emerald-700', very_good: 'bg-teal-100 text-teal-700', good: 'bg-amber-100 text-amber-700', acceptable: 'bg-orange-100 text-orange-700', weak: 'bg-rose-100 text-rose-700' };

export function MemorizationView() {
  const [records, setRecords] = useState<Memorization[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterType !== 'all') params.set('type', filterType);
    if (filterGrade !== 'all') params.set('grade', filterGrade);
    const res = await fetch(`/api/memorization?${params}`);
    const data = await res.json();
    if (data.memorization) setRecords(data.memorization);
    setLoading(false);
  };

  useEffect(() => {
    fetch('/api/students?approvalStatus=approved').then(r => r.json()).then(d => { if (d.students) setStudents(d.students); });
    fetch('/api/classes').then(r => r.json()).then(d => { if (d.classes) setClasses(d.classes); });
    fetch('/api/memorization').then(r => r.json()).then(d => { if (d.memorization) setRecords(d.memorization); setLoading(false); });
  }, []);

  useEffect(() => { const t = setTimeout(fetchData, 500); return () => clearTimeout(t); }, [search, filterType, filterGrade]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body: any = Object.fromEntries(fd.entries());
    body.surahNumber = parseInt(body.surahNumber);
    body.fromAyah = parseInt(body.fromAyah) || 1;
    body.toAyah = parseInt(body.toAyah) || 1;
    body.totalAyahs = parseInt(body.totalAyahs) || 1;
    // Auto-fill surah name from the SURAH_NAMES mapping
    const surahEntry = SURAH_NAMES.find(([num]) => num === body.surahNumber);
    if (surahEntry) {
      body.surahName = surahEntry[1];
    }
    const res = await fetch('/api/memorization', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.memorization) {
      toast.success('تم تسجيل الحفظ بنجاح');
      setShowAdd(false);
      fetchData();
    } else {
      toast.error(data.error || 'فشل في التسجيل');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف سجل الحفظ؟')) return;
    const res = await fetch(`/api/memorization?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.error) { toast.success('تم حذف السجل'); fetchData(); }
    else toast.error(data.error || 'فشل في الحذف');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الحفظ والتسميع</h1>
          <p className="text-muted-foreground text-sm mt-1">تسجيل متابعة حفظ القرآن الكريم (سبق / سبقي / منزل)</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-l from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Plus className="w-4 h-4 ml-2" />
              تسجيل حفظ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تسجيل حفظ جديد</DialogTitle>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">نوع المراجعة *</label>
                <Select name="type" required>
                  <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sabak">سبق (حفظ جديد)</SelectItem>
                    <SelectItem value="sabqi">سبقي (مراجعة قريبة)</SelectItem>
                    <SelectItem value="manzil">منزل (مراجعة بعيدة)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">السورة *</label>
                <Select name="surahNumber" required>
                  <SelectTrigger><SelectValue placeholder="اختر السورة" /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {SURAH_NAMES.map(([num, name]) => <SelectItem key={num} value={String(num)}>{name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">من آية</label>
                  <Input name="fromAyah" type="number" min={1} defaultValue={1} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">إلى آية</label>
                  <Input name="toAyah" type="number" min={1} defaultValue={1} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">عدد الآيات</label>
                  <Input name="totalAyahs" type="number" min={1} defaultValue={1} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">التقييم</label>
                  <Select name="grade">
                    <SelectTrigger><SelectValue placeholder="اختر التقييم" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">ممتاز</SelectItem>
                      <SelectItem value="very_good">جيد جداً</SelectItem>
                      <SelectItem value="good">جيد</SelectItem>
                      <SelectItem value="acceptable">مقبول</SelectItem>
                      <SelectItem value="weak">ضعيف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">التاريخ</label>
                  <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ملاحظات</label>
                <Input name="notes" />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-l from-emerald-500 to-teal-600 text-white">تسجيل</Button>
            </form>
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
                <Input placeholder="بحث باسم الطالب..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="النوع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="sabak">سبق</SelectItem>
                <SelectItem value="sabqi">سبقي</SelectItem>
                <SelectItem value="manzil">منزل</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="التقييم" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="excellent">ممتاز</SelectItem>
                <SelectItem value="very_good">جيد جداً</SelectItem>
                <SelectItem value="good">جيد</SelectItem>
                <SelectItem value="acceptable">مقبول</SelectItem>
                <SelectItem value="weak">ضعيف</SelectItem>
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
                  <TableHead>النوع</TableHead>
                  <TableHead>السورة</TableHead>
                  <TableHead>الآيات</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead>المعلم</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>حذف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">جاري التحميل...</TableCell></TableRow>
                ) : records.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">لا يوجد سجلات حفظ</TableCell></TableRow>
                ) : records.map(rec => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium text-sm">{(rec as any).student?.name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={rec.type === 'sabak' ? 'border-emerald-300 text-emerald-600' : rec.type === 'sabqi' ? 'border-teal-300 text-teal-600' : 'border-amber-300 text-amber-600'}>
                        {typeLabels[rec.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{rec.surahName}</TableCell>
                    <TableCell className="text-sm">{rec.fromAyah} - {rec.toAyah}</TableCell>
                    <TableCell>
                      {rec.grade ? <span className={`text-xs px-2 py-1 rounded-full ${gradeColors[rec.grade] || ''}`}>{gradeLabels[rec.grade]}</span> : '—'}
                    </TableCell>
                    <TableCell className="text-sm">{(rec as any).teacher?.name || '—'}</TableCell>
                    <TableCell className="text-sm">{rec.date}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(rec.id)}>
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
