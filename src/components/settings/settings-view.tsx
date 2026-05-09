'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Settings, Save, Upload, Image } from 'lucide-react';

export function SettingsView() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.settings) setSettings(d.settings);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!data.error) toast.success('تم حفظ الإعدادات');
    else toast.error(data.error || 'فشل في حفظ الإعدادات');
    setSaving(false);
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>;

  const settingGroups = [
    {
      title: 'معلومات المؤسسة',
      icon: Settings,
      fields: [
        { key: 'school_name', label: 'اسم المؤسسة', placeholder: 'براعم تحفيظ القرآن الكريم' },
        { key: 'manager_name', label: 'اسم المسؤول', placeholder: 'اسم المسؤول' },
        { key: 'school_phone', label: 'هاتف المؤسسة', placeholder: 'رقم الهاتف' },
        { key: 'school_email', label: 'البريد الإلكتروني', placeholder: 'البريد الإلكتروني' },
        { key: 'school_address', label: 'عنوان المؤسسة', placeholder: 'العنوان' },
      ],
    },
    {
      title: 'إعدادات الرسوم والدراسة',
      icon: Settings,
      fields: [
        { key: 'registration_fee', label: 'رسوم التسجيل', placeholder: '200' },
        { key: 'monthly_fee', label: 'الرسوم الشهرية', placeholder: '300' },
        { key: 'academic_year', label: 'العام الدراسي', placeholder: '1446-1447' },
      ],
    },
    {
      title: 'إعدادات الواتساب',
      icon: Settings,
      fields: [
        { key: 'whatsapp_api_url', label: 'رابط API', placeholder: 'https://api.ultramsg.com/instance...' },
        { key: 'whatsapp_token', label: 'رمز التوكن', placeholder: 'Token' },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الإعدادات</h1>
          <p className="text-muted-foreground text-sm mt-1">إعدادات النظام والمؤسسة</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-l from-emerald-500 to-teal-600 text-white">
          <Save className="w-4 h-4 ml-2" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>

      {settingGroups.map((group, i) => {
        const Icon = group.icon;
        return (
          <Card key={i} className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className="w-4 h-4 text-emerald-500" />
                {group.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.fields.map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-sm font-medium">{field.label}</label>
                    <Input
                      value={settings[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
