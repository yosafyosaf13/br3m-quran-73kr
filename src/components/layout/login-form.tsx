'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';

export function LoginForm({ onBack, onPortalAccess }: { onBack?: () => void; onPortalAccess?: () => void }) {
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsSeed, setNeedsSeed] = useState(false);

  const isDev = process.env.NODE_ENV === 'development';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(username, password);
    if (!result.success) {
      toast.error(result.error || 'فشل تسجيل الدخول');
      // Check if it's because there's no data
      if (result.error?.includes('بيانات') || result.error?.includes('مستخدم')) {
        setNeedsSeed(true);
      }
    }
    setLoading(false);
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('تم تهيئة النظام بنجاح! يمكنك الآن تسجيل الدخول');
        setNeedsSeed(false);
      } else {
        toast.error(data.error || 'فشل في تهيئة النظام');
      }
    } catch {
      toast.error('خطأ في الاتصال');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 islamic-pattern p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors animate-fade-in-up"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للصفحة الرئيسية</span>
          </button>
        )}

        {/* Logo & Header */}
        <div className="text-center space-y-3 animate-fade-in-up">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold gradient-text">براعم تحفيظ القرآن الكريم</h1>
          <p className="text-sm text-muted-foreground">مجمع التوحيد بالعباسة</p>
        </div>

        <Card className="glass-card border-0 shadow-xl shadow-emerald-500/5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold text-center">تسجيل الدخول</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم المستخدم</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">كلمة المرور</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
                disabled={loading}
              >
                {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>

            {needsSeed && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">لم يتم العثور على بيانات. قم بتهيئة النظام أولاً</p>
                <Button onClick={handleSeed} variant="outline" size="sm" disabled={loading}>
                  تهيئة النظام ببيانات تجريبية
                </Button>
              </div>
            )}

            {/* Only show default credentials in development mode */}
            {isDev && (
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  المستخدم الافتراضي: admin / admin123
                </p>
              </div>
            )}

            {/* Parent Portal Link */}
            {onPortalAccess && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center mb-2">ولي الأمر؟</p>
                <Button
                  onClick={onPortalAccess}
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20 gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>دخول بوابة أولياء الأمور</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decorative */}
        <div className="flex justify-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {['ا', 'ب', 'ت', 'ث', 'ج'].map((letter, i) => (
            <span
              key={i}
              className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold"
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
