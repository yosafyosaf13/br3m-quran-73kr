'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Database, Download, Trash2, HardDrive, Clock } from 'lucide-react';

export function BackupView() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backup');
      const data = await res.json();
      if (data.backups) setBackups(data.backups);
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      toast.error('فشل في تحميل النسخ الاحتياطية');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch('/api/backup').then(r => r.json()).then(d => { if (d.backups) setBackups(d.backups); setLoading(false); }).catch(() => { setLoading(false); toast.error('فشل في تحميل النسخ الاحتياطية'); });
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      const data = await res.json();
      if (!data.error) {
        toast.success('تم إنشاء النسخة الاحتياطية');
        fetchBackups();
      } else {
        toast.error(data.error || 'فشل في إنشاء النسخة');
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
      toast.error('فشل في إنشاء النسخة الاحتياطية');
    }
    setCreating(false);
  };

  const handleDelete = async (backupId: string, fileName: string) => {
    if (!confirm(`هل أنت متأكد من حذف النسخة الاحتياطية "${fileName}"؟`)) return;

    setDeletingId(backupId);
    try {
      const res = await fetch(`/api/backup/${backupId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.error) {
        toast.success('تم حذف النسخة الاحتياطية');
        fetchBackups();
      } else {
        toast.error(data.error || 'فشل في حذف النسخة');
      }
    } catch (error) {
      console.error('Failed to delete backup:', error);
      toast.error('فشل في حذف النسخة الاحتياطية');
    }
    setDeletingId(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">النسخ الاحتياطي</h1>
          <p className="text-muted-foreground text-sm mt-1">إنشاء وإدارة النسخ الاحتياطية لقاعدة البيانات</p>
        </div>
        <Button onClick={handleCreate} disabled={creating} className="bg-gradient-to-l from-emerald-500 to-teal-600 text-white">
          <Database className="w-4 h-4 ml-2" />
          {creating ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">عدد النسخ</p>
              <p className="text-xl font-bold">{backups.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backups List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
        ) : backups.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-12 text-center">
              <Database className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">لا يوجد نسخ احتياطية</p>
              <p className="text-xs text-muted-foreground mt-1">أنشئ نسختك الاحتياطية الأولى</p>
            </CardContent>
          </Card>
        ) : backups.map((backup, i) => (
          <Card key={backup.id || i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{backup.fileName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(backup.createdAt).toLocaleString('ar-EG')}</span>
                      <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{formatSize(backup.fileSize)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600"
                  onClick={() => handleDelete(backup.id, backup.fileName)}
                  disabled={deletingId === backup.id}
                >
                  <Trash2 className="w-3.5 h-3.5 ml-1" />
                  {deletingId === backup.id ? 'جاري الحذف...' : 'حذف'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
