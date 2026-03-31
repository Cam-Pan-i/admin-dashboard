import { create } from 'zustand';

interface AppState {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  currentGuild: string | null;
  setCurrentGuild: (guildId: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  currentGuild: '123456789', // Mock default
  setCurrentGuild: (guildId) => set({ currentGuild: guildId }),
}));
