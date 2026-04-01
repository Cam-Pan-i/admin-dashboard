import React, { useEffect, useState } from 'react';
import { ShoppingCart, Users, BarChart3, Mail, Flame, History, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '../../public.css';

const GUILD_ID = process.env.DISCORD_GUILD_ID || '1466511568614330484';

export const MainPage: React.FC = () => {
  const [serverStats, setServerStats] = useState<any>(null);
  const [memberStats, setMemberStats] = useState<any>(null);

  useEffect(() => {
    const loadHome = async () => {
      try {
        const { data: ss } = await supabase
          .from('server_stats')
          .select('*')
          .eq('guild_id', GUILD_ID)
          .single();
        
        if (ss) setServerStats(ss);

        const { data: ms } = await supabase
          .from('member_stats')
          .select('online_members, total_members')
          .eq('guild_id', GUILD_ID)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();
        
        if (ms) setMemberStats(ms);

        const channel = supabase
          .channel('home-stats')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'member_stats',
              filter: `guild_id=eq.${GUILD_ID}`,
            },
            (payload) => {
              setMemberStats(payload.new);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (e) {
        console.error('Home load error:', e);
      }
    };

    loadHome();
  }, []);

  return (
    <div className="public-body">
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <nav className="nav">
        <Link to="/main" className="nav-brand">
          <div className="nav-logo"><ShoppingCart size={16} /></div> Bob's Market
        </Link>
        <div className="nav-links">
          <Link to="/main" className="nav-link active">Home</Link>
          <Link to="/shop" className="nav-link">Shop</Link>
          <Link to="/" className="nav-link">Dashboard</Link>
        </div>
        <a href="https://discord.gg/McCU2nPegT" target="_blank" rel="noopener" className="nav-join">Join Server</a>
      </nav>

      <div className="home-wrap">
        <div className="home-card">
          <div className="server-avatar-wrap">
            <div className="server-status-ring"></div>
            <img 
              id="server-icon" 
              className="server-avatar"
              src={serverStats?.icon_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}
              alt="Server Icon"
            />
            <div 
              className="status-pip" 
              style={{ 
                background: (memberStats?.online_members > 0) ? 'var(--green)' : 'var(--text-muted)',
                boxShadow: (memberStats?.online_members > 0) ? '0 0 14px var(--green)' : 'none'
              }}
            ></div>
          </div>

          <div className="server-name">{serverStats?.name || "Bob's Market"}</div>
          <div className="server-tagline">Advanced Discord Commerce & Analytics</div>

          <div className="home-stats">
            <div className="home-stat">
              <div className="home-stat-value">{(memberStats?.online_members || 0).toLocaleString()}</div>
              <div className="home-stat-label">
                <span className="live-indicator">
                  <span className="live-dot"></span> Online
                </span>
              </div>
            </div>
            <div className="home-divider"></div>
            <div className="home-stat">
              <div className="home-stat-value">{(memberStats?.total_members || 0).toLocaleString()}</div>
              <div className="home-stat-label">Total Personnel</div>
            </div>
            <div className="home-divider"></div>
            <div className="home-stat">
              <div className="home-stat-value">{(serverStats?.verified_members || 0).toLocaleString()}</div>
              <div className="home-stat-label">Verified</div>
            </div>
          </div>

          <a href="https://discord.gg/McCU2nPegT" target="_blank" rel="noopener" className="join-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
              <path d="M19.27 4.57c-1.41-1.3-3.03-2.14-4.85-2.52-.16-.03-.31.05-.39.19-.21.36-.45.86-.61 1.25-1.99-.3-3.99-.3-5.98 0-.16-.39-.41-.89-.62-1.25-.08-.14-.23-.22-.39-.19-1.82.38-3.44 1.22-4.85 2.52-.06.06-.09.14-.1.22-.96 5.56-.7 11.02.6 16.3.01.03.02.06.05.08A19.9 19.9 0 0 0 8.1 23.95c.13.04.27-.01.35-.11.46-.63.87-1.29 1.22-2 .04-.08.02-.17-.06-.21a13.3 13.3 0 0 1-1.87-.89c-.08-.04-.09-.14-.02-.2.12-.09.25-.19.37-.29.06-.05.15-.05.21.01 3.92 1.79 8.18 1.79 12.06 0 .06-.06.15-.06.21-.01.12.1.25.2.37.29.07.06.06.16-.02.2-.59.33-1.2.63-1.87.89-.08.04-.1.13-.06.21.35.71.76 1.37 1.22 2 .08.1.22.15.35.11 2.02-.7 3.84-1.74 5.39-3.04.03-.02.04-.05.05-.08 1.5-6.13 1.1-11.58.4-16.3-.01-.08-.04-.16-.1-.22zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.33-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.33-.95 2.42-2.16 2.42z" />
            </svg>
            Establish Connection
          </a>

          <div className="quick-links">
            <Link to="/shop" className="quick-link"><ShoppingBag size={12} /> Shop</Link>
            <Link to="/" className="quick-link"><Users size={12} /> Dashboard</Link>
          </div>

          <p style={{ marginTop: '32px', fontSize: '10px', color: 'var(--text-tiny)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            © 2026 Bob's Market. Secured Interface.
          </p>
        </div>
      </div>
    </div>
  );
};
