import React, { useState } from 'react';
import { Bot, LogIn, Mail, Lock, Loader2, AlertTriangle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { fetchAccountByEmail, authenticateDashboardAccount } from '../lib/accounts';
import { User } from '@supabase/supabase-js';

export const LoginPage = () => {
  const { setUser, setRoles } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Try Dashboard Accounts (with dummy fallback)
      const account = await authenticateDashboardAccount(email, password);
      
      if (account) {
        const mockUser: User = {
          id: account.userid || 'dash-' + account.email,
          email: account.email,
          app_metadata: {},
          user_metadata: { username: account.username },
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User;
        
        setUser(mockUser);
        setRoles(account.roles as any);
        setIsLoading(false);
        return;
      }

      // 2. If no dashboard account, try Supabase Auth (if configured)
      if (isSupabaseConfigured) {
        const { error: loginError, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!loginError && data.user) {
          const acc = await fetchAccountByEmail(data.user.email);
          setUser(data.user);
          setRoles(acc?.roles || ['mod']);
          setIsLoading(false);
          return;
        }
        
        if (loginError) throw loginError;
      }

      setError('INVALID CREDENTIALS. ACCESS DENIED.');
    } catch (err: any) {
      setError(err.message || 'AUTHENTICATION FAILED');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="scanline" />
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[440px] z-10">
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] mb-8 group transition-all duration-700 hover:rotate-[360deg]">
            <Bot className="text-black w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-[0.4em] uppercase mb-2">BOB <span className="text-white/20">ADMIN</span></h1>
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-white/10" />
            <p className="text-[10px] font-black tracking-[0.2em] text-text-secondary uppercase">Secure Access Portal</p>
            <div className="h-[1px] w-8 bg-white/10" />
          </div>
        </div>

        <div className="glass p-10 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.3em] ml-1">Identity Identifier</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-white transition-colors" size={14} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL@DOMAIN.COM"
                  required
                  className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-12 py-4 text-[11px] font-bold tracking-widest focus:outline-none focus:border-white/30 transition-all text-text-primary uppercase placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.3em] ml-1">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-white transition-colors" size={14} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-12 py-4 text-[11px] font-bold tracking-widest focus:outline-none focus:border-white/30 transition-all text-text-primary uppercase placeholder:text-white/10"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded bg-red-500/5 border border-red-500/20 flex items-center justify-center gap-2">
                <AlertTriangle size={12} className="text-red-500" />
                <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-lg bg-white text-black font-black text-[11px] tracking-[0.2em] uppercase hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />}
              Initialize Session
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 space-y-6">
            <button 
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'discord' })}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-lg bg-white/5 border border-white/10 text-white font-black text-[10px] tracking-[0.2em] uppercase hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              Discord Authentication
            </button>
            
            <div className="flex flex-col items-center gap-2">
              <p className="text-[8px] text-text-secondary uppercase tracking-[0.4em] font-black">Authorized Access Only</p>
              <div className="w-12 h-[1px] bg-white/10" />
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-between items-center px-2">
          <p className="text-[9px] text-text-secondary uppercase tracking-[0.3em] font-black">
            v2.4.0-PROD
          </p>
          <p className="text-[9px] text-text-secondary uppercase tracking-[0.3em] font-black">
            © 2026 BOB THE SELLER
          </p>
        </div>
      </div>
    </div>
  );
};
