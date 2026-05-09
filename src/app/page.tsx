'use client';

import { useEffect, useState, lazy, Suspense, useSyncExternalStore } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';

// Lazy load heavy components to prevent compilation crash
const LoginForm = lazy(() =>
  import('@/components/layout/login-form').then(m => ({ default: m.LoginForm }))
);
const AppShell = lazy(() =>
  import('@/components/layout/app-shell').then(m => ({ default: m.AppShell }))
);
const PublicPage = lazy(() =>
  import('@/components/public/public-page').then(m => ({ default: m.PublicPage }))
);
const PortalView = lazy(() =>
  import('@/components/portal/portal-view').then(m => ({ default: m.PortalView }))
);

type PageView = 'public' | 'login' | 'app' | 'portal';

const emptySubscribe = () => () => {};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-muted-foreground font-medium">جاري التحميل...</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [view, setView] = useState<PageView>('public');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!mounted || isLoading) {
    return <LoadingSpinner />;
  }

  // Authenticated -> show the admin app
  if (isAuthenticated) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AppShell onPortalAccess={() => setView('portal')} />
      </Suspense>
    );
  }

  // Not authenticated -> show appropriate view
  switch (view) {
    case 'login':
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <LoginForm onBack={() => setView('public')} onPortalAccess={() => setView('portal')} />
        </Suspense>
      );
    case 'portal':
      return <PortalStandalone onBack={() => setView('public')} />;
    default:
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <PublicPage
            onLogin={() => setView('login')}
            onPortalAccess={() => setView('portal')}
          />
        </Suspense>
      );
  }
}

// Standalone wrapper for Portal - full page without admin sidebar
function PortalStandalone({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Top bar */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-emerald-100 dark:border-emerald-900/20 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span>العودة</span>
              </button>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold">بوابة أولياء الأمور</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">متابعة مستوى ابنك القرآني</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<LoadingSpinner />}>
          <PortalView />
        </Suspense>
      </div>
    </div>
  );
}
