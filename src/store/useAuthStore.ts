import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  role: 'owner' | 'admin' | 'mod' | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: 'owner' | 'admin' | 'mod' | null) => void;
  finishLoading: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setRole: (role) => set({ role }),
      finishLoading: () => set({ isLoading: false }),
      signOut: async () => {
        if (isSupabaseConfigured) {
          await supabase.auth.signOut();
        }
        set({ user: null, role: null, isLoading: false });
      },
    }),
    {
      name: 'bob-auth-storage',
      partialize: (state) => ({ user: state.user, role: state.role }),
    }
  )
);
