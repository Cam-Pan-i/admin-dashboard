import React, { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, Command, LogOut, Menu, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, safeFetch, isSupabaseConfigured } from '../lib/supabase';

export const Topbar = () => {
  const { currentGuild, isMobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const { user, roles, signOut } = useAuthStore();
  const [serverName, setServerName] = useState('BOB\'S EMPORIUM');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await safeFetch(supabase.from('settings').select('server_name').single(), { server_name: 'BOB\'S EMPORIUM' }, 'Fetch server name');
      if (data?.server_name) setServerName(data.server_name);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="h-20 border-b border-white/[0.03] bg-bg-primary/50 backdrop-blur-2xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary transition-all md:hidden"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/20 transition-all group cursor-pointer">
            <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center text-[10px] font-black tracking-tighter uppercase">
              {serverName.substring(0, 2)}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-wider leading-none">
                {loading ? <Loader2 size={10} className="animate-spin" /> : serverName}
              </span>
              <span className="text-[9px] text-text-secondary font-bold mt-0.5 uppercase">PRODUCTION INSTANCE</span>
            </div>
            <ChevronDown size={12} className="text-text-secondary group-hover:text-white transition-colors ml-2" />
          </div>

          {!isSupabaseConfigured && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">
              <AlertTriangle size={10} className="animate-pulse" />
              SIMULATION MODE
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-white transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="COMMAND SEARCH..." 
            className="bg-white/[0.02] border border-white/[0.05] rounded-lg pl-11 pr-14 py-2.5 text-[10px] font-bold tracking-wider w-72 focus:outline-none focus:border-white/20 focus:ring-0 transition-all placeholder:text-text-secondary/50 uppercase"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 rounded border border-white/10 bg-white/5 text-[9px] font-black text-text-secondary">
            <Command size={10} /> K
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all relative group">
            <Bell size={18} className="group-hover:scale-110 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></span>
          </button>
          
          <div className="h-6 w-[1px] bg-white/[0.05] mx-2"></div>
          
          <button 
            onClick={handleLogout}
            className="p-2.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white transition-all group"
            title="TERMINATE SESSION"
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};
