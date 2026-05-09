'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { UserCog, Plus, Edit, Trash2, Shield, BookOpen } from 'lucide-react';
import type { User } from '@/types';

function UserForm({ user, onSubmit, submitLabel }: { user?: User; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; submitLabel: string }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">الاسم *</label>
          <Input name="name" defaultValue={user?.name || ''} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">اسم المستخدم *</label>
          <Input name="username" defaultValue={user?.username || ''} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{user ? 'كلمة المرور الجديدة (اتركها فارغة للإبقاء)' : 'كلمة المرور *'}</label>
          <Input name="password" type="password" required={!user} minLength={6} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الدور *</label>
          <Select name="role" defaultValue={user?.role || 'teacher'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">مدير</SelectItem>
              <SelectItem value="teacher">معلم</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الهاتف</label>
          <Input name="phone" defaultValue={user?.phone || ''} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">البريد الإلكتروني</label>
          <Input name="email" type="email" defaultValue={user?.email || ''} />
        </div>
      </div>
      <Button type="submit" className="w-full bg-gradient-to-l from-emerald-500 to-teal-600 text-white">{submitLabel}</Button>
    </form>
  );
}

export function UsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/users');
    const data = await res.json();
    if (data.users) setUsers(data.users);
    setLoading(false);
  };

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => { if (d.users) setUsers(d.users); setLoading(false); });
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.user) { toast.success('تم إضافة المستخدم'); setShowAdd(false); fetchUsers(); }
    else toast.error(data.error || 'فشل في الإضافة');
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editUser) return;
    const fd = new FormData(e.currentTarget);
    const body: any = Object.fromEntries(fd.entries());
    if (!body.password) delete body.password;
    const res = await fetch(`/api/users/${editUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.user) { toast.success('تم تحديث المستخدم'); setEditUser(null); fetchUsers(); }
    else toast.error('فشل في التحديث');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.user) { toast.success('تم حذف المستخدم'); fetchUsers(); }
    else toast.error(data.error || 'فشل في الحذف');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground text-sm mt-1">إضافة وإدارة مديري النظام والمعلمين</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-l from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Plus className="w-4 h-4 ml-2" />
              إضافة مستخدم
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>إضافة مستخدم جديد</DialogTitle></DialogHeader>
            <UserForm onSubmit={handleAdd} submitLabel="إضافة المستخدم" />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>اسم المستخدم</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">جاري التحميل...</TableCell></TableRow>
                ) : users.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">لا يوجد مستخدمين</TableCell></TableRow>
                ) : users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={`text-white text-xs ${user.role === 'admin' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}`}>
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3 ml-1" /> : <BookOpen className="w-3 h-3 ml-1" />}
                        {user.role === 'admin' ? 'مدير' : 'معلم'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.phone || '—'}</TableCell>
                    <TableCell className="text-sm">{user.email || '—'}</TableCell>
                    <TableCell><Badge variant={user.active ? 'default' : 'destructive'}>{user.active ? 'نشط' : 'معطل'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditUser(user)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>تعديل المستخدم</DialogTitle></DialogHeader>
          {editUser && <UserForm user={editUser} onSubmit={handleEdit} submitLabel="حفظ التعديلات" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
