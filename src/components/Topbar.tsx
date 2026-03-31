import React from 'react';
import { Search, Bell, ChevronDown, Command, LogOut, Menu, X, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { isSupabaseConfigured } from '../lib/supabase';

export const Topbar = () => {
  const { currentGuild, isMobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const { user, role, signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="h-16 border-b border-border bg-bg-primary/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 md:gap-6">
        <button 
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all md:hidden"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {!isSupabaseConfigured && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
            <AlertTriangle size={12} />
            Mock Mode
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border cursor-pointer hover:border-white/50 transition-colors group">
          <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center text-[10px] font-bold">
            BS
          </div>
          <span className="text-sm font-medium">Bob's Emporium</span>
          <ChevronDown size={14} className="text-text-secondary group-hover:text-white" />
        </div>

        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-white transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-bg-secondary border border-border rounded-xl pl-10 pr-12 py-2 text-sm w-64 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/10 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-bg-tertiary text-[10px] text-text-secondary">
            <Command size={10} /> K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full border-2 border-bg-primary"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-border mx-2"></div>
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold">{user?.email?.split('@')[0]}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">{role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl border border-border overflow-hidden bg-bg-tertiary">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" referrerPolicy="no-referrer" />
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="p-2 rounded-xl hover:bg-red-500/10 text-text-secondary hover:text-red-500 transition-all"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
