'use client';

import { lazy, Suspense } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { Sidebar } from '@/components/layout/sidebar';

// Lazy load all view components for code splitting
const DashboardView = lazy(() =>
  import('@/components/dashboard/dashboard-view').then(m => ({ default: m.DashboardView }))
);
const StudentsView = lazy(() =>
  import('@/components/students/students-view').then(m => ({ default: m.StudentsView }))
);
const AttendanceView = lazy(() =>
  import('@/components/attendance/attendance-view').then(m => ({ default: m.AttendanceView }))
);
const MemorizationView = lazy(() =>
  import('@/components/memorization/memorization-view').then(m => ({ default: m.MemorizationView }))
);
const PaymentsView = lazy(() =>
  import('@/components/payments/payments-view').then(m => ({ default: m.PaymentsView }))
);
const ClassesView = lazy(() =>
  import('@/components/classes/classes-view').then(m => ({ default: m.ClassesView }))
);
const UsersView = lazy(() =>
  import('@/components/users/users-view').then(m => ({ default: m.UsersView }))
);
const NotificationsView = lazy(() =>
  import('@/components/notifications/notifications-view').then(m => ({ default: m.NotificationsView }))
);
const ReportsView = lazy(() =>
  import('@/components/reports/reports-view').then(m => ({ default: m.ReportsView }))
);
const SettingsView = lazy(() =>
  import('@/components/settings/settings-view').then(m => ({ default: m.SettingsView }))
);
const LearningView = lazy(() =>
  import('@/components/learning/learning-view').then(m => ({ default: m.LearningView }))
);
const BackupView = lazy(() =>
  import('@/components/settings/backup-view').then(m => ({ default: m.BackupView }))
);

function ViewLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">جاري التحميل...</p>
      </div>
    </div>
  );
}

export function AppShell({ onPortalAccess }: { onPortalAccess: () => void }) {
  const { currentView, sidebarOpen } = useAppStore();
  const { user } = useAuthStore();

  const renderView = () => {
    const viewMap: Record<string, JSX.Element> = {
      dashboard: <DashboardView />,
      students: <StudentsView />,
      attendance: <AttendanceView />,
      memorization: <MemorizationView />,
      payments: <PaymentsView />,
      classes: <ClassesView />,
      users: user?.role === 'admin' ? <UsersView /> : <DashboardView />,
      notifications: <NotificationsView />,
      reports: <ReportsView />,
      settings: user?.role === 'admin' ? <SettingsView /> : <DashboardView />,
      learning: <LearningView />,
      backup: user?.role === 'admin' ? <BackupView /> : <DashboardView />,
    };

    return viewMap[currentView] || <DashboardView />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar onPortalAccess={onPortalAccess} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'md:mr-72' : ''}`}>
        <div className="p-4 md:p-6 lg:p-8">
          <Suspense fallback={<ViewLoadingFallback />}>
            {renderView()}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
