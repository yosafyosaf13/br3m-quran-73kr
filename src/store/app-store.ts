import { create } from 'zustand';
import type { AppView } from '@/types';

interface AppState {
  currentView: AppView;
  sidebarOpen: boolean;
  setCurrentView: (view: AppView) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  sidebarOpen: true, // Open by default so sidebar is always visible
  setCurrentView: (view) => set({ currentView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
