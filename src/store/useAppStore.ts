import { create } from 'zustand';

interface AppState {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  currentGuild: string | null;
  setCurrentGuild: (guildId: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  currentGuild: '123456789', // Mock default
  setCurrentGuild: (guildId) => set({ currentGuild: guildId }),
}));
