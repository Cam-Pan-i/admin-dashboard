import React, { useEffect, useState } from 'react';
import { 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Mail, 
  Flame, 
  History,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface MainHomeProps {
  setActiveTab: (tab: string) => void;
}

export const MainHome: React.FC<MainHomeProps> = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    online: 0,
    total: 0,
    verified: 0,
    iconUrl: '',
    name: "Bob's Market"
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Load server stats
        const { data: ss } = await supabase
          .from('server_stats')
          .select('*')
          .limit(1)
          .single();
        
        if (ss) {
          setStats(prev => ({
            ...prev,
            name: ss.name || prev.name,
            iconUrl: ss.icon_url || '',
            verified: ss.verified_members || 0
          }));
        }

        // Load member stats
        const { data: ms } = await supabase
          .from('member_stats')
          .select('online_members, total_members')
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        if (ms) {
          setStats(prev => ({
            ...prev,
            online: ms.online_members || 0,
            total: ms.total_members || 0
          }));
        }

        // Subscribe to changes
        const channel = supabase
          .channel('home-stats')
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'member_stats' 
          }, (payload) => {
            setStats(prev => ({
              ...prev,
              online: payload.new.online_members || 0,
              total: payload.new.total_members || 0
            }));
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error loading home stats:', error);
      }
    };

    loadStats();
  }, []);

  const quickLinks = [
    { id: 'shop', label: 'Shop', icon: ShoppingCart },
    { id: 'members', label: 'Registry', icon: Users },
    { id: 'analytics', label: 'Live Status', icon: BarChart3 },
    { id: 'tickets', label: 'Assistance', icon: Mail },
    { id: 'heatmap', label: 'Heatmap', icon: Flame },
    { id: 'audit', label: 'Audit Log', icon: History },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[460px] glass border border-white/10 rounded-[40px] p-12 text-center relative overflow-hidden shadow-2xl"
      >
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Server Avatar */}
        <div className="relative inline-block mb-6">
          <div className="absolute -inset-1.5 rounded-full border-2 border-transparent bg-gradient-to-br from-white/40 to-white/5 [mask-composite:exclude] -z-10" />
          <img 
            src={stats.iconUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
            alt="Server Icon"
            className="w-24 h-24 rounded-full border-2 border-white/10 object-cover bg-bg-tertiary shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png';
            }}
          />
          <div className={cn(
            "absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-bg-primary transition-all duration-500",
            stats.online > 0 ? "bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.5)]" : "bg-white/20"
          )} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-1">{stats.name}</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-8">
          Advanced Discord Commerce & Analytics
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 bg-black/25 border border-white/5 rounded-2xl p-5 mb-8">
          <div className="text-center">
            <div className="text-xl font-bold font-mono">{stats.online.toLocaleString()}</div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-text-secondary">Online</span>
            </div>
          </div>
          <div className="w-[1px] h-8 bg-white/5 self-center" />
          <div className="text-center">
            <div className="text-xl font-bold font-mono">{stats.total.toLocaleString()}</div>
            <div className="text-[8px] font-bold uppercase tracking-wider text-text-secondary mt-1">Personnel</div>
          </div>
          <div className="w-[1px] h-8 bg-white/5 self-center" />
          <div className="text-center">
            <div className="text-xl font-bold font-mono">{stats.verified.toLocaleString()}</div>
            <div className="text-[8px] font-bold uppercase tracking-wider text-text-secondary mt-1">Verified</div>
          </div>
        </div>

        {/* Main CTA */}
        <a 
          href="https://discord.gg/McCU2nPegT" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-xl"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M19.27 4.57c-1.41-1.3-3.03-2.14-4.85-2.52-.16-.03-.31.05-.39.19-.21.36-.45.86-.61 1.25-1.99-.3-3.99-.3-5.98 0-.16-.39-.41-.89-.62-1.25-.08-.14-.23-.22-.39-.19-1.82.38-3.44 1.22-4.85 2.52-.06.06-.09.14-.1.22-.96 5.56-.7 11.02.6 16.3.01.03.02.06.05.08A19.9 19.9 0 0 0 8.1 23.95c.13.04.27-.01.35-.11.46-.63.87-1.29 1.22-2 .04-.08.02-.17-.06-.21a13.3 13.3 0 0 1-1.87-.89c-.08-.04-.09-.14-.02-.2.12-.09.25-.19.37-.29.06-.05.15-.05.21.01 3.92 1.79 8.18 1.79 12.06 0 .06-.06.15-.06.21-.01.12.1.25.2.37.29.07.06.06.16-.02.2-.59.33-1.2.63-1.87.89-.08.04-.1.13-.06.21.35.71.76 1.37 1.22 2 .08.1.22.15.35.11 2.02-.7 3.84-1.74 5.39-3.04.03-.02.04-.05.05-.08 1.5-6.13 1.1-11.58.4-16.3-.01-.08-.04-.16-.1-.22zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.33-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.33-.95 2.42-2.16 2.42z" />
          </svg>
          Establish Connection
        </a>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-2 mt-6">
          {quickLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className="flex items-center justify-center gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:bg-white/[0.05] hover:border-white/20 hover:text-text-primary transition-all duration-200"
            >
              <link.icon size={12} />
              {link.label}
            </button>
          ))}
        </div>

        <p className="mt-10 text-[8px] font-bold uppercase tracking-[0.2em] text-white/20">
          © 2026 Bob's Market. Secured Interface.
        </p>
      </motion.div>
    </div>
  );
};
