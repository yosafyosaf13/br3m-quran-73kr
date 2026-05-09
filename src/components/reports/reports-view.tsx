'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { BarChart3, Download, Printer, Users, UserCheck, BookOpen, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Class } from '@/types';

const COLORS = ['#10b981', '#f59e0b', '#14b8a6', '#f43f5e', '#8b5cf6', '#3b82f6'];

export function ReportsView() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [reportType, setReportType] = useState('attendance');
  const [classId, setClassId] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/classes').then(r => r.json()).then(d => { if (d.classes) setClasses(d.classes); });
  }, []);

  const generateReport = async () => {
    setLoading(true);
    const params = new URLSearchParams({ type: reportType });
    if (classId !== 'all') params.set('classId', classId);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    const res = await fetch(`/api/reports?${params}`);
    const data = await res.json();
    if (data.summary || data.records) setReportData(data);
    else if (data.error) toast.error(data.error);
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (!reportData?.records) return;
    const headers = Object.keys(reportData.records[0] || {});
    const csv = [
      headers.join(','),
      ...reportData.records.map((r: any) => headers.map(h => `"${r[h] || ''}"`).join(','))
    ].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير التقرير');
  };

  const typeIcons: Record<string, React.ElementType> = {
    attendance: UserCheck,
    memorization: BookOpen,
    payments: CreditCard,
    students: Users,
  };

  const typeLabels: Record<string, string> = {
    attendance: 'تقرير الحضور',
    memorization: 'تقرير الحفظ',
    payments: 'تقرير المدفوعات',
    students: 'تقرير الطلاب',
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">التقارير</h1>
          <p className="text-muted-foreground text-sm mt-1">إنشاء وتصدير التقارير المختلفة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={!reportData?.records?.length}>
            <Download className="w-4 h-4 ml-2" />
            تصدير CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 ml-2" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium">نوع التقرير</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">الحضور</SelectItem>
                  <SelectItem value="memorization">الحفظ</SelectItem>
                  <SelectItem value="payments">المدفوعات</SelectItem>
                  <SelectItem value="students">الطلاب</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">الفصل</label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفصول</SelectItem>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">من تاريخ</label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[150px]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">إلى تاريخ</label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[150px]" />
            </div>
            <Button onClick={generateReport} disabled={loading} className="bg-gradient-to-l from-emerald-500 to-teal-600 text-white">
              <BarChart3 className="w-4 h-4 ml-2" />
              {loading ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {reportData && (
        <div className="space-y-4">
          {/* Summary Cards */}
          {reportData.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(reportData.summary).map(([key, value], i) => (
                <Card key={key} className="border-0 shadow-md">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{key}</p>
                    <p className="text-2xl font-bold">{String(value)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Records Table */}
          {reportData.records && reportData.records.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(reportData.records[0]).map(key => (
                          <TableHead key={key}>{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.records.slice(0, 50).map((record: any, i: number) => (
                        <TableRow key={i}>
                          {Object.values(record).map((val: any, j) => (
                            <TableCell key={j} className="text-sm">{String(val ?? '—')}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {!reportData.records?.length && (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">لا توجد بيانات للفترة المحددة</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
