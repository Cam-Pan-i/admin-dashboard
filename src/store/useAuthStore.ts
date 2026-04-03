import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import Cookies from 'js-cookie';
import { UserRole } from '../lib/accounts';

interface AuthState {
  user: User | null;
  roles: UserRole[] | null;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setRoles: (roles: UserRole[] | null) => void;
  setHydrated: (isHydrated: boolean) => void;
  signOut: () => Promise<void>;
}

// Custom storage engine for Zustand using js-cookie
const cookieStorage = {
  getItem: (name: string): string | null => {
    return Cookies.get(name) || null;
  },
  setItem: (name: string, value: string): void => {
    // Set cookie with 7-day expiration, SameSite=None, and Secure=true for iframe compatibility
    Cookies.set(name, value, { 
      expires: 7, 
      sameSite: 'none', 
      secure: true 
    });
  },
  removeItem: (name: string): void => {
    Cookies.remove(name, { sameSite: 'none', secure: true });
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      roles: null,
      isLoading: true,
      isHydrated: false,
      setUser: (user) => set({ user, isLoading: false }),
      setRoles: (roles) => set({ roles, isLoading: false }),
      setHydrated: (isHydrated) => set({ isHydrated, isLoading: !isHydrated }),
      signOut: async () => {
        if (isSupabaseConfigured) {
          await supabase.auth.signOut();
        }
        // Clear cookie manually just in case
        cookieStorage.removeItem('bob-auth-session');
        set({ user: null, roles: null, isLoading: false });
      },
    }),
    {
      name: 'bob-auth-session',
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({ user: state.user, roles: state.roles }),
    }
  )
);
