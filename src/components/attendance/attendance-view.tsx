'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserCheck, CheckCircle, XCircle, Clock, AlertCircle, Save } from 'lucide-react';
import type { Student, Class } from '@/types';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  present: { label: 'حاضر', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
  absent: { label: 'غائب', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
  late: { label: 'متأخر', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  excused: { label: 'معذور', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', icon: AlertCircle },
};

export function AttendanceView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<Record<string, { status: string; notes: string }>>({});
  const [existingAttendance, setExistingAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchClasses = async () => {
    const res = await fetch('/api/classes');
    const data = await res.json();
    const classList = data.classes || data.data || data || [];
    if (classList.length > 0) {
      setClasses(classList);
      if (selectedClass === 'all') {
        setSelectedClass(classList[0].id);
      }
    }
  };

  const fetchStudents = async () => {
    if (selectedClass === 'all') { setStudents([]); setLoading(false); return; }
    setLoading(true);
    const res = await fetch(`/api/students?classId=${selectedClass}&approvalStatus=approved`);
    const data = await res.json();
    setStudents(data.students || data.data || []);
    setLoading(false);
  };

  const fetchExisting = async () => {
    const res = await fetch(`/api/attendance?date=${selectedDate}${selectedClass !== 'all' ? `&classId=${selectedClass}` : ''}`);
    const data = await res.json();
    const attendanceList = data.attendance || data.data || data || [];
    if (Array.isArray(attendanceList)) {
      setExistingAttendance(attendanceList);
      const map: Record<string, { status: string; notes: string }> = {};
      attendanceList.forEach((a: any) => {
        map[a.studentId] = { status: a.status, notes: a.notes || '' };
      });
      setRecords(map);
    }
  };

  useEffect(() => {
    fetch('/api/classes').then(r => r.json()).then(d => {
      const classList = d.classes || d.data || d || [];
      if (classList.length > 0) {
        setClasses(classList);
        setSelectedClass(prev => prev === 'all' ? classList[0].id : prev);
      }
    });
  }, []);
  useEffect(() => {
    if (selectedClass === 'all') {
      Promise.resolve().then(() => { setStudents([]); setLoading(false); });
      return;
    }
    Promise.resolve().then(() => setLoading(true));
    fetch(`/api/students?classId=${selectedClass}&approvalStatus=approved`)
      .then(r => r.json())
      .then(d => { setStudents(d.students || d.data || []); setLoading(false); });
    fetch(`/api/attendance?date=${selectedDate}${selectedClass !== 'all' ? `&classId=${selectedClass}` : ''}`)
      .then(r => r.json())
      .then(d => {
        const attendanceList = d.attendance || d.data || d || [];
        if (Array.isArray(attendanceList)) {
          setExistingAttendance(attendanceList);
          const map: Record<string, { status: string; notes: string }> = {};
          attendanceList.forEach((a: any) => { map[a.studentId] = { status: a.status, notes: a.notes || '' }; });
          setRecords(map);
        }
      });
  }, [selectedClass, selectedDate]);

  const handleStatusChange = (studentId: string, status: string) => {
    setRecords(prev => ({ ...prev, [studentId]: { ...prev[studentId], status, notes: prev[studentId]?.notes || '' } }));
  };

  const handleMarkAll = (status: string) => {
    const newRecords = { ...records };
    students.forEach(s => {
      newRecords[s.id] = { status, notes: newRecords[s.id]?.notes || '' };
    });
    setRecords(newRecords);
  };

  const handleSave = async () => {
    setSaving(true);
    const attendanceRecords = Object.entries(records).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      notes: data.notes,
      date: selectedDate,
    }));
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: attendanceRecords }),
      });
      const data = await res.json();
      if (data.attendance || data.success) {
        toast.success('تم حفظ الحضور بنجاح');
        fetchExisting();
      } else {
        toast.error('فشل في حفظ الحضور');
      }
    } catch {
      toast.error('خطأ في الاتصال');
    }
    setSaving(false);
  };

  const getStats = () => {
    const counts = { present: 0, absent: 0, late: 0, excused: 0, unrecorded: 0 };
    students.forEach(s => {
      const status = records[s.id]?.status;
      if (status) counts[status as keyof typeof counts]++;
      else counts.unrecorded++;
    });
    return counts;
  };

  const stats = getStats();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الحضور والانصراف</h1>
          <p className="text-muted-foreground text-sm mt-1">تسجيل ومتابعة حضور الطلاب اليومي</p>
        </div>
      </div>

      {/* Controls */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">التاريخ</label>
              <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-[160px]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">الفصل</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mr-auto">
              <Button size="sm" variant="outline" onClick={() => handleMarkAll('present')} className="text-emerald-600">تحضير الكل</Button>
              <Button size="sm" variant="outline" onClick={() => handleMarkAll('absent')} className="text-rose-600">تغييب الكل</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(statusConfig).map(([key, conf]) => {
          const Icon = conf.icon;
          return (
            <div key={key} className={`p-3 rounded-xl ${conf.color} flex items-center gap-2`}>
              <Icon className="w-4 h-4" />
              <div>
                <p className="text-xs font-medium">{conf.label}</p>
                <p className="text-lg font-bold">{stats[key as keyof typeof stats]}</p>
              </div>
            </div>
          );
        })}
        <div className="p-3 rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <div>
            <p className="text-xs font-medium">لم يُسجل</p>
            <p className="text-lg font-bold">{stats.unrecorded}</p>
          </div>
        </div>
      </div>

      {/* Attendance Grid */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">اختر فصلاً لعرض الطلاب</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>الطالب</TableHead>
                    <TableHead className="text-center">حاضر</TableHead>
                    <TableHead className="text-center">غائب</TableHead>
                    <TableHead className="text-center">متأخر</TableHead>
                    <TableHead className="text-center">معذور</TableHead>
                    <TableHead>ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, i) => {
                    const current = records[student.id]?.status || '';
                    return (
                      <TableRow key={student.id} className={`${current === 'present' ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : current === 'absent' ? 'bg-rose-50/50 dark:bg-rose-900/10' : current === 'late' ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                        <TableCell className="text-sm text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium text-sm">{student.name}</TableCell>
                        {['present', 'absent', 'late', 'excused'].map(status => (
                          <TableCell key={status} className="text-center">
                            <input
                              type="radio"
                              name={`attendance-${student.id}`}
                              checked={current === status}
                              onChange={() => handleStatusChange(student.id, status)}
                              className="w-4 h-4 accent-emerald-500"
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <Input
                            placeholder="ملاحظة..."
                            value={records[student.id]?.notes || ''}
                            onChange={e => setRecords(prev => ({ ...prev, [student.id]: { ...prev[student.id], notes: e.target.value } }))}
                            className="h-8 text-xs"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {students.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-l from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 px-8">
            <Save className="w-4 h-4 ml-2" />
            {saving ? 'جاري الحفظ...' : 'حفظ الحضور'}
          </Button>
        </div>
      )}
    </div>
  );
}
