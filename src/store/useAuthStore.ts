import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  role: 'owner' | 'admin' | 'mod' | null;
  isLoading: boolean;
  isMockSession: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: 'owner' | 'admin' | 'mod' | null) => void;
  setMockSession: (isMockSession: boolean) => void;
  finishLoading: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isLoading: true,
      isMockSession: false,
      setUser: (user) => set({ user, isLoading: false }),
      setRole: (role) => set({ role }),
      setMockSession: (isMockSession) => set({ isMockSession }),
      finishLoading: () => set({ isLoading: false }),
      signOut: async () => {
        if (isSupabaseConfigured) {
          await supabase.auth.signOut();
        }
        set({ user: null, role: null, isLoading: false, isMockSession: false });
      },
    }),
    {
      name: 'bob-auth-storage',
      partialize: (state) => ({ user: state.user, role: state.role, isMockSession: state.isMockSession }),
    }
  )
);
