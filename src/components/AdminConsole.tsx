import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  LogOut, 
  RefreshCw, 
  Pause, 
  Play, 
  Trash2, 
  Terminal, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Zap,
  User,
  ShoppingBag,
  Database,
  Server,
  Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { cn } from '../lib/utils';

interface ConsoleData {
  timestamp: string;
  env: Record<string, string>;
  services: {
    nowpayments: { status: string; message?: string; latency_ms: number };
    supabase: { status: string; latency_ms: number };
    bot: { status: string; seconds_ago: number | null; latency_ms?: number };
  };
  recent_orders: any[];
  recent_signals: any[];
  recent_audits: any[];
  recent_console: any[];
  active_admins: any[];
}

interface LogEntry {
  id: string;
  time: string;
  level: 'info' | 'ok' | 'warn' | 'error' | 'system' | 'pay';
  msg: string;
}

export const AdminConsole = () => {
  const { user, signOut } = useAuthStore();
  const [data, setData] = useState<ConsoleData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [command, setCommand] = useState('');
  const [tick, setTick] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const logFeedRef = useRef<HTMLDivElement>(null);
  const prevDataRef = useRef<ConsoleData | null>(null);

  // Initial log entry
  useEffect(() => {
    addLog('system', `Console session established for ${user?.email}`);
    
    // Log visit for "Active Admins" tracking
    if (user?.email) {
      supabase.from('visitor_logs').insert({
        visitor_id: user.email,
        path: '/admin-console',
        visited_at: new Date().toISOString()
      }).then(() => {});
    }
  }, [user]);

  // Polling
  useEffect(() => {
    const poll = async () => {
      if (isPaused) return;
      
      try {
        const response = await fetch('/api/console');
        const newData = await response.json();
        
        if (!response.ok) {
          throw new Error(newData.error || 'Failed to fetch console data');
        }
        
        setData(newData);
        setTick(t => t + 1);
        
        // Diffing logic
        if (prevDataRef.current && prevDataRef.current.recent_orders && newData.recent_orders) {
          const prev = prevDataRef.current;
          
          // Orders
          const prevOrderIds = new Set(prev.recent_orders.map((o: any) => o.payment_id));
          newData.recent_orders.forEach((o: any) => {
            if (!prevOrderIds.has(o.payment_id)) {
              addLog('pay', `New Order: ${o.product} ($${o.price_usd}) - ${o.status.toUpperCase()}`);
            }
          });

          // Signals
          if (prev.recent_signals && newData.recent_signals) {
            const prevSignalIds = new Set(prev.recent_signals.map((s: any) => s.id));
            newData.recent_signals.forEach((s: any) => {
              if (!prevSignalIds.has(s.id)) {
                addLog('system', `Signal: ${s.signal} - ${JSON.stringify(s.payload)}`);
              }
            });
          }

          // Console commands from other users
          if (prev.recent_console && newData.recent_console) {
            const prevConsoleIds = new Set(prev.recent_console.map((c: any) => c.id));
            newData.recent_console.forEach((c: any) => {
              if (!prevConsoleIds.has(c.id) && c.user_id !== user?.id) {
                addLog('info', `[${c.user_name}] > ${c.metadata.cmd}`);
              }
            });
          }
        }
        
        prevDataRef.current = newData;
      } catch (err: any) {
        addLog('error', `Poll failed: ${err.message || 'Connection lost'}`);
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [isPaused, user]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && logFeedRef.current) {
      logFeedRef.current.scrollTop = logFeedRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const addLog = (level: LogEntry['level'], msg: string) => {
    setLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        level,
        msg
      }
    ].slice(-200)); // Keep last 200 entries
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const cmd = command.trim();
    setCommand('');
    addLog('info', `> ${cmd}`);

    // Log command to analytics
    await supabase.from('analytics').insert({
      event_type: 'console_command',
      guild_id: process.env.MAIN_GUILD,
      user_id: user?.id,
      user_name: user?.user_metadata?.username || user?.email,
      metadata: { cmd },
      timestamp: new Date().toISOString()
    });

    const parts = cmd.toLowerCase().split(' ');
    const base = parts[0];

    switch (base) {
      case 'help':
        addLog('system', 'Available Commands: help, clear, status, ping, audit, logs, orders, whoami, exit');
        break;
      case 'clear':
      case 'cls':
        setLogs([]);
        break;
      case 'status':
        if (data && data.services) {
          addLog('system', `Services: NP=${data.services.nowpayments.status.toUpperCase()}, SB=${data.services.supabase.status.toUpperCase()}, BOT=${data.services.bot.status.toUpperCase()}`);
          addLog('system', `Last Pulse: ${data.services.bot.seconds_ago !== null ? data.services.bot.seconds_ago + 's ago' : 'N/A'}`);
        } else {
          addLog('warn', 'Status data unavailable.');
        }
        break;
      case 'ping':
        addLog('system', 'System Ping initiated...');
        manualSync();
        break;
      case 'audit':
        if (data?.recent_audits && data.recent_audits.length) {
          data.recent_audits.forEach(a => addLog('ok', `[AUDIT] ${a.action}: ${a.details}`));
        } else {
          addLog('warn', 'No recent audit logs found.');
        }
        break;
      case 'logs':
        addLog('info', 'Fetching recent system logs...');
        if (data?.recent_console && data.recent_console.length) {
          data.recent_console.forEach(c => addLog('info', `[${c.user_name}] > ${c.metadata.cmd}`));
        } else {
          addLog('warn', 'No recent console logs found.');
        }
        break;
      case 'orders':
        if (data?.recent_orders && data.recent_orders.length) {
          data.recent_orders.forEach(o => addLog('pay', `[ORDER] ${o.product} - ${o.status.toUpperCase()} ($${o.price_usd})`));
        } else {
          addLog('warn', 'No recent orders found.');
        }
        break;
      case 'whoami':
        addLog('system', `Identity: ${user?.user_metadata?.username || user?.email} (Session: ${user?.id})`);
        break;
      case 'exit':
        addLog('system', 'Terminating session...');
        window.location.href = '/';
        break;
      default:
        addLog('error', `Unknown command: '${base}'`);
    }
  };

  const manualSync = async () => {
    setIsSyncing(true);
    addLog('system', 'Manual synchronization initiated...');
    try {
      const response = await fetch('/api/console');
      const newData = await response.json();
      if (!response.ok) throw new Error(newData.error || 'Sync failed');
      setData(newData);
      prevDataRef.current = newData;
      addLog('ok', 'Synchronization complete');
    } catch (err: any) {
      addLog('error', `Synchronization failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const triggerSignal = async (signal: string) => {
    const label = signal.replace('_signal', '').toUpperCase();
    if (!confirm(`EXTREME CAUTION: This will trigger a ${label} signal. Proceed?`)) return;
    try {
      addLog('warn', `Sending ${label} signal...`);
      const { error } = await supabase.from('bot_settings').update({ [signal]: true }).eq('id', 'global');
      if (error) throw error;
      addLog('ok', `${label} signal acknowledged`);
    } catch (err: any) {
      addLog('error', `${label} failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase italic">Admin Console</h1>
          <p className="text-[10px] text-text-secondary font-mono tracking-widest uppercase opacity-60">System Kernel & Command Matrix</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <div className={clsx(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              data?.services.bot.status === 'online' ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"
            )} />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">
              {data?.services.bot.status === 'online' ? 'Live' : 'Offline'} · Tick {tick}
            </span>
          </div>
          <button 
            onClick={manualSync}
            disabled={isSyncing}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
          >
            <RefreshCw className={clsx("w-4 h-4", isSyncing && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Health & Env */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass p-6 rounded-2xl border border-white/10 neo-border relative overflow-hidden">
            <div className="absolute inset-0 scanline opacity-5 pointer-events-none"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-white/40 flex items-center gap-2">
              <Activity size={12} /> Service Health
            </h3>
            <div className="space-y-1">
              <HealthRow 
                name="NOWPayments" 
                status={data?.services?.nowpayments?.status || 'sync'} 
                detail={data?.services?.nowpayments?.latency_ms ? `${data.services.nowpayments.latency_ms}ms` : '—'} 
              />
              <HealthRow 
                name="Supabase" 
                status={data?.services?.supabase?.status || 'sync'} 
                detail={data?.services?.supabase?.latency_ms ? `${data.services.supabase.latency_ms}ms` : '—'} 
              />
              <HealthRow 
                name="Bot Heart" 
                status={data?.services?.bot?.status || 'sync'} 
                detail={data?.services?.bot?.seconds_ago !== null && data?.services?.bot?.seconds_ago !== undefined ? `${data.services.bot.seconds_ago}s ago` : '—'} 
              />
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/10 neo-border relative overflow-hidden">
            <div className="absolute inset-0 scanline opacity-5 pointer-events-none"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-white/40 flex items-center gap-2">
              <Database size={12} /> Environment
            </h3>
            <div className="space-y-2">
              {data?.env && Object.entries(data.env).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-white/40 truncate max-w-[120px]">{key}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter",
                    (val as string).includes('✓') ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {(val as string).includes('✓') ? 'Set' : 'Missing'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Console */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="glass rounded-2xl border border-white/10 neo-border relative overflow-hidden flex flex-col h-[600px]">
            <div className="absolute inset-0 scanline opacity-5 pointer-events-none"></div>
            
            {/* Console Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-3">
                <Terminal size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Kernel Feed</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsPaused(!isPaused)}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    isPaused ? "bg-blue-400 text-black" : "bg-white/5 text-white/40 hover:text-white"
                  )}
                >
                  {isPaused ? <Play size={12} /> : <Pause size={12} />}
                </button>
                <button 
                  onClick={() => setLogs([])}
                  className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all"
                >
                  <Trash2 size={12} />
                </button>
                <button 
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                    autoScroll ? "bg-white text-black" : "bg-white/5 text-white/40"
                  )}
                >
                  Scroll
                </button>
              </div>
            </div>

            {/* Log Area */}
            <div 
              ref={logFeedRef}
              className="flex-1 overflow-y-auto p-6 space-y-1 font-mono custom-scrollbar bg-black/20"
            >
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 text-[10px] group hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
                  <span className="text-white/20 w-14 shrink-0">{log.time}</span>
                  <span className={clsx(
                    "w-12 shrink-0 font-black uppercase text-[8px] pt-0.5",
                    log.level === 'info' && "text-blue-400",
                    log.level === 'ok' && "text-green-400",
                    log.level === 'warn' && "text-yellow-400",
                    log.level === 'error' && "text-red-400",
                    log.level === 'system' && "text-purple-400",
                    log.level === 'pay' && "text-orange-400"
                  )}>
                    {log.level}
                  </span>
                  <span className={clsx(
                    "flex-1 break-all",
                    log.level === 'info' && "text-white/60",
                    log.level === 'ok' && "text-green-200/60",
                    log.level === 'warn' && "text-yellow-200/60",
                    log.level === 'error' && "text-red-200/60",
                    log.level === 'system' && "text-purple-200/60",
                    log.level === 'pay' && "text-orange-200/60"
                  )}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleCommand} className="p-4 border-t border-white/5 bg-white/5 flex items-center gap-3">
              <span className="text-[10px] font-black text-green-400 shrink-0 font-mono">
                root@bob:~$
              </span>
              <input 
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Type 'help' for commands..."
                className="flex-1 bg-transparent border-none outline-none text-white text-[11px] font-mono placeholder:text-white/10"
                autoFocus
              />
            </form>
          </div>
        </div>

        {/* Right Column: Data & Signals */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass p-6 rounded-2xl border border-white/10 neo-border relative overflow-hidden">
            <div className="absolute inset-0 scanline opacity-5 pointer-events-none"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-white/40 flex items-center gap-2">
              <Users size={12} /> Active Admins
            </h3>
            <div className="flex flex-wrap gap-2">
              {!data?.active_admins || data.active_admins.length === 0 ? (
                <div className="text-[10px] text-white/20 italic font-mono uppercase tracking-widest">No Active Sessions</div>
              ) : (
                data.active_admins.map((admin, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                    <User size={10} className="text-blue-400" />
                    <span className="text-[10px] font-bold text-white/80">{admin.username}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/10 neo-border relative overflow-hidden">
            <div className="absolute inset-0 scanline opacity-5 pointer-events-none"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-white/40 flex items-center gap-2">
              <ShoppingBag size={12} /> Recent Orders
            </h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
              {data?.recent_orders?.map((order, i) => (
                <button 
                  key={i}
                  onClick={() => setSelectedOrder(order)}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-left group"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-white/80 truncate group-hover:text-white uppercase">{order.product}</span>
                    <span className="text-[8px] text-white/20 font-mono">{order.payment_id.slice(0, 8)}</span>
                  </div>
                  <span className={cn(
                    "text-[7px] font-black uppercase px-1.5 py-0.5 rounded",
                    order.status === 'finished' || order.status === 'confirmed' ? "bg-green-500/10 text-green-500" :
                    order.status === 'waiting' || order.status === 'confirming' ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-red-500/10 text-red-500"
                  )}>
                    {order.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/10 neo-border relative overflow-hidden">
            <div className="absolute inset-0 scanline opacity-5 pointer-events-none"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-white/40 flex items-center gap-2">
              <Zap size={12} /> System Signals
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => triggerSignal('restart_signal')}
                className="flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-black font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <RefreshCw size={14} /> Restart
              </button>
              <button 
                onClick={() => triggerSignal('stop_signal')}
                className="flex items-center justify-center gap-3 py-3 rounded-xl bg-red-500 text-white font-black text-[9px] uppercase tracking-[0.2em] hover:bg-red-600 transition-all"
              >
                <Pause size={14} /> Stop
              </button>
              <button 
                onClick={() => triggerSignal('purge_shop_signal')}
                className="flex items-center justify-center gap-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
              >
                <Trash2 size={14} /> Purge
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md glass border border-white/10 rounded-2xl p-8 shadow-2xl neo-border"
            >
              <div className="absolute inset-0 scanline opacity-5 pointer-events-none"></div>
              <div className="text-blue-400 text-xs font-black tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
                <Shield size={16} /> Order Metadata
              </div>
              
              <div className="space-y-6">
                <ModalField label="Product" value={selectedOrder.product} />
                <ModalField label="Buyer ID" value={selectedOrder.buyer_discord_id} />
                <ModalField label="Payment ID" value={selectedOrder.payment_id} isMono />
                <ModalField label="Status" value={selectedOrder.status.toUpperCase()} />
              </div>

              <button 
                onClick={() => setSelectedOrder(null)}
                className="mt-10 w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-white/90 transition-all"
              >
                Close Matrix
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HealthRow = ({ name, status, detail }: { name: string; status: string; detail: string }) => {
  const isOk = status === 'ok' || status === 'online';
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors">
      <div>
        <div className="text-[11px] font-bold text-white/80">{name}</div>
        <div className="text-[9px] text-white/20">{detail}</div>
      </div>
      <div className={clsx(
        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
        isOk ? "bg-green-400/5 border-green-400/20 text-green-400" : 
        status === 'sync' ? "bg-white/5 border-white/10 text-white/20" :
        "bg-red-400/5 border-red-400/20 text-red-400"
      )}>
        {isOk ? 'ONLINE' : status.toUpperCase()}
      </div>
    </div>
  );
};

const ModalField = ({ label, value, isMono }: { label: string; value: string; isMono?: boolean }) => (
  <div className="border-b border-white/5 pb-2">
    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{label}</div>
    <div className={clsx(
      "text-sm font-bold text-white/90",
      isMono && "font-mono text-xs text-blue-400"
    )}>{value}</div>
  </div>
);
