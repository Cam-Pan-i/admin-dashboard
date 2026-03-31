import React, { useState } from 'react';
import { Bot, LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { getAccountByEmail } from '../lib/accounts';
import { User } from '@supabase/supabase-js';

export const LoginPage = () => {
  const { setUser, setRole } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const normalizedEmail = email.toLowerCase().trim();

    const tryMockLogin = () => {
      const account = getAccountByEmail(normalizedEmail);
      if (account?.testPassword && account.testPassword === password) {
        const mockUser: User = {
          id: 'mock-id-' + account.role,
          email: account.email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User;

        setUser(mockUser);
        setRole(account.role as any);
        return true;
      }

      return false;
    };

    // Always try system/test accounts first, regardless of Supabase configuration.
    if (tryMockLogin()) {
      setIsLoading(false);
      return;
    }

    // If no matching system account, fall back to Supabase auth when configured.
    if (!isSupabaseConfigured) {
      setError('Invalid credentials. Use owner@example.com / owner, admin@example.com / admin, or mod@example.com / mod.');
      setIsLoading(false);
      return;
    }

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;
    } catch (err: any) {
      console.error('Login Error:', err);

      if (err.message?.includes('Failed to fetch')) {
        setError('Network error: Unable to connect to authentication service. Please check your internet connection or Supabase configuration.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin,
      }
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          {!isSupabaseConfigured && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
              ⚠️ SUPABASE CONFIGURATION MISSING - MOCK MODE ENABLED
            </div>
          )}
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            <Bot className="text-black w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter">BOB ADMIN</h1>
          <p className="text-text-secondary text-sm max-w-xs mx-auto">
            Elite Discord bot management system. Authenticate to access the command center.
          </p>
        </div>

        <div className="glass p-8 rounded-3xl space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full bg-bg-tertiary border border-border rounded-2xl px-12 py-4 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-bg-tertiary border border-border rounded-2xl px-12 py-4 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-bold uppercase tracking-widest">{error}</p>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-bold hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              Sign In
            </button>
          </form>

          <div className="flex items-center gap-4 text-[10px] text-text-secondary uppercase tracking-widest font-bold">
            <div className="h-[1px] flex-1 bg-border"></div>
            <span>Or</span>
            <div className="h-[1px] flex-1 bg-border"></div>
          </div>

          <button 
            onClick={handleDiscordLogin}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            Login with Discord
          </button>
          
          <div className="flex items-center gap-4 text-[10px] text-text-secondary uppercase tracking-widest font-bold">
            <div className="h-[1px] flex-1 bg-border"></div>
            <span>Authorized Personnel Only</span>
            <div className="h-[1px] flex-1 bg-border"></div>
          </div>
        </div>

        <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">
          Bob The Seller © 2026
        </p>
      </div>
    </div>
  );
};
