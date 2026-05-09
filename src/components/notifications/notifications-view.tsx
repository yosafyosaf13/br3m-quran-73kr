'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Bell, Plus, Trash2, Send } from 'lucide-react';
import type { Notification } from '@/types';

const targetLabels: Record<string, string> = { all: 'الجميع', admin: 'المديرون', teacher: 'المعلمون' };

export function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetch('/api/notifications');
    const data = await res.json();
    if (data.notifications) setNotifications(data.notifications);
    setLoading(false);
  };

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => { if (d.notifications) setNotifications(d.notifications); setLoading(false); });
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!data.error) { toast.success('تم إرسال الإشعار'); setShowAdd(false); fetchNotifications(); }
    else toast.error(data.error || 'فشل في الإرسال');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإشعار؟')) return;
    const res = await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.error) { toast.success('تم حذف الإشعار'); fetchNotifications(); }
    else toast.error(data.error || 'فشل في الحذف');
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return `منذ ${Math.floor(diff / 86400)} يوم`;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          <p className="text-muted-foreground text-sm mt-1">إرسال وإدارة الإشعارات والتنبيهات</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-l from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
              <Send className="w-4 h-4 ml-2" />
              إرسال إشعار
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>إرسال إشعار جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">العنوان *</label>
                <Input name="title" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الرسالة *</label>
                <Input name="message" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الفئة المستهدفة</label>
                <Select name="target" defaultValue="all">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الجميع</SelectItem>
                    <SelectItem value="admin">المديرون</SelectItem>
                    <SelectItem value="teacher">المعلمون</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-l from-amber-500 to-orange-600 text-white">
                <Send className="w-4 h-4 ml-2" />
                إرسال
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
        ) : notifications.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">لا يوجد إشعارات</p>
            </CardContent>
          </Card>
        ) : notifications.map(notif => (
          <Card key={notif.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{notif.title}</h3>
                      <Badge variant="outline" className="text-xs">{targetLabels[notif.target]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 shrink-0" onClick={() => handleDelete(notif.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
