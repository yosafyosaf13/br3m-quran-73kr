'use client';

import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import type { AppView } from '@/types';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  CreditCard,
  GraduationCap,
  UserCog,
  Bell,
  BarChart3,
  Settings,
  BookMarked,
  LogOut,
  Menu,
  X,
  Database,
  ExternalLink,
} from 'lucide-react';

const menuItems: { id: AppView; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'students', label: 'الطلاب', icon: Users },
  { id: 'attendance', label: 'الحضور والانصراف', icon: UserCheck },
  { id: 'memorization', label: 'الحفظ والتسميع', icon: BookOpen },
  { id: 'payments', label: 'المدفوعات', icon: CreditCard },
  { id: 'classes', label: 'الفصول', icon: GraduationCap },
  { id: 'users', label: 'المستخدمين', icon: UserCog, adminOnly: true },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'reports', label: 'التقارير', icon: BarChart3 },
  { id: 'learning', label: 'التعلم التفاعلي', icon: BookMarked },
  { id: 'settings', label: 'الإعدادات', icon: Settings, adminOnly: true },
  { id: 'backup', label: 'النسخ الاحتياطي', icon: Database, adminOnly: true },
];

export function Sidebar({ onPortalAccess }: { onPortalAccess?: () => void }) {
  const { user, logout } = useAuthStore();
  const { currentView, setCurrentView, sidebarOpen, toggleSidebar } = useAppStore();
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 bg-white dark:bg-card shadow-lg rounded-xl p-2 border md:hidden"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 h-full w-64 md:w-72 bg-sidebar border-l border-sidebar-border z-40 transition-transform duration-300 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-4 md:p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm truncate">براعم القرآن الكريم</h2>
              <p className="text-xs text-muted-foreground truncate">مجمع التوحيد بالعباسة</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems
            .filter(item => !item.adminOnly || isAdmin)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

          {/* Separator */}
          <div className="my-2 border-t border-sidebar-border" />

          {/* Parent Portal Link */}
          <button
            onClick={() => {
              if (onPortalAccess) onPortalAccess();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200"
          >
            <ExternalLink className="w-4.5 h-4.5 shrink-0" />
            <span>بوابة أولياء الأمور</span>
          </button>
        </nav>

        {/* User info & Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0) || 'م'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {user?.role === 'admin' ? 'مدير النظام' : 'معلم'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
