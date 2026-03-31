import { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingBag, Users, BarChart3, Mail, Flame, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PublicNavbar } from './PublicNavbar';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

function animateCount(
  el: HTMLElement | null,
  from: number,
  to: number,
  duration: number
) {
  if (!el) return;
  let start: number | null = null;
  const step = (ts: number) => {
    if (!start) start = ts;
    const prog = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - prog, 4);
    el.textContent = Math.round(from + (to - from) * ease).toLocaleString();
    if (prog < 1) requestAnimationFrame(step);
    else el.textContent = to.toLocaleString();
  };
  requestAnimationFrame(step);
}

const quickLinks = [
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/main', label: 'Registry', icon: Users },
  { href: '/main', label: 'Live Status', icon: BarChart3 },
  { href: '/main', label: 'Assistance', icon: Mail },
  { href: '/main', label: 'Heatmap', icon: Flame },
  { href: '/main', label: 'Audit Log', icon: History },
];

export const MainPage = () => {
  const [serverName, setServerName] = useState("Bob's Market");
  const [iconUrl, setIconUrl] = useState('https://cdn.discordapp.com/embed/avatars/0.png');
  const [isOnline, setIsOnline] = useState(false);

  const onlineRef = useRef<HTMLSpanElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);
  const verifiedRef = useRef<HTMLSpanElement>(null);

  const loadData = useCallback(async () => {
    try {
      const { data: ss } = await supabase
        .from('server_stats')
        .select('*')
        .single();

      if (ss) {
        if (ss.icon_url) setIconUrl(ss.icon_url);
        if (ss.name) setServerName(ss.name);
        if (ss.verified_members != null) {
          animateCount(verifiedRef.current, 0, ss.verified_members, 1200);
        }
      }

      const { data: ms } = await supabase
        .from('member_stats')
        .select('online_members, total_members')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (ms) {
        animateCount(onlineRef.current, 0, ms.online_members || 0, 1200);
        animateCount(totalRef.current, 0, ms.total_members || 0, 1200);
        setIsOnline((ms.online_members || 0) > 0);
      }
    } catch (e) {
      console.error('Home load error:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <PublicNavbar />

      {/* Background orbs */}
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[120px] pointer-events-none" />

      <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-12 w-full max-w-md text-center relative overflow-hidden shadow-[0_12px_64px_rgba(0,0,0,0.8)]"
        >
          {/* Top glow line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Server Avatar */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-[-5px] rounded-full border-2 border-transparent bg-gradient-to-br from-white/20 to-white/5 [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:destination-out] [mask-composite:exclude]" />
            <img
              src={iconUrl}
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
              alt="Server Icon"
              className="w-24 h-24 rounded-full border-[3px] border-white/10 object-cover bg-bg-tertiary shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            />
            <div
              className={cn(
                "absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-bg-primary transition-colors",
                isOnline ? "bg-emerald-500 shadow-[0_0_14px_theme(colors.emerald.500)]" : "bg-text-secondary"
              )}
            />
          </div>

          {/* Name */}
          <h1 className="text-3xl font-bold tracking-tight mb-1">{serverName}</h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary mb-7">
            Advanced Discord Commerce & Analytics
          </p>

          {/* Live Stats */}
          <div className="flex items-center justify-center gap-5 mb-8 p-4 rounded-xl bg-black/25 border border-border">
            <div className="text-center">
              <span ref={onlineRef} className="block text-xl font-bold tracking-tight">&mdash;</span>
              <span className="flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-text-secondary mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_theme(colors.emerald.500)] animate-pulse" />
                Online
              </span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <span ref={totalRef} className="block text-xl font-bold tracking-tight">&mdash;</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-text-secondary mt-0.5">Total Personnel</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <span ref={verifiedRef} className="block text-xl font-bold tracking-tight">&mdash;</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-text-secondary mt-0.5">Verified</span>
            </div>
          </div>

          {/* Main CTA */}
          <a
            href="https://discord.gg/McCU2nPegT"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-wide hover:bg-white/90 transition-all shadow-[0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M19.27 4.57c-1.41-1.3-3.03-2.14-4.85-2.52-.16-.03-.31.05-.39.19-.21.36-.45.86-.61 1.25-1.99-.3-3.99-.3-5.98 0-.16-.39-.41-.89-.62-1.25-.08-.14-.23-.22-.39-.19-1.82.38-3.44 1.22-4.85 2.52-.06.06-.09.14-.1.22-.96 5.56-.7 11.02.6 16.3.01.03.02.06.05.08A19.9 19.9 0 0 0 8.1 23.95c.13.04.27-.01.35-.11.46-.63.87-1.29 1.22-2 .04-.08.02-.17-.06-.21a13.3 13.3 0 0 1-1.87-.89c-.08-.04-.09-.14-.02-.2.12-.09.25-.19.37-.29.06-.05.15-.05.21.01 3.92 1.79 8.18 1.79 12.06 0 .06-.06.15-.06.21-.01.12.1.25.2.37.29.07.06.06.16-.02.2-.59.33-1.2.63-1.87.89-.08.04-.1.13-.06.21.35.71.76 1.37 1.22 2 .08.1.22.15.35.11 2.02-.7 3.84-1.74 5.39-3.04.03-.02.04-.05.05-.08 1.5-6.13 1.1-11.58.4-16.3-.01-.08-.04-.16-.1-.22zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.33-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.33-.95 2.42-2.16 2.42z" />
            </svg>
            Establish Connection
          </a>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-white/[0.02] border border-border text-[10px] font-extrabold uppercase tracking-wide text-text-secondary hover:bg-white/5 hover:border-white/20 hover:text-white transition-all"
              >
                <link.icon size={12} />
                {link.label}
              </Link>
            ))}
          </div>

          <p className="mt-8 text-[10px] text-white/10 font-bold uppercase tracking-[1px]">
            &copy; 2026 Bob's Market. Secured Interface.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
