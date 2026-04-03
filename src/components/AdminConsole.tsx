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
  Server
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

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
        const newData: ConsoleData = await response.json();
        
        setData(newData);
        setTick(t => t + 1);
        
        // Diffing logic
        if (prevDataRef.current) {
          const prev = prevDataRef.current;
          
          // Orders
          const prevOrderIds = new Set(prev.recent_orders.map(o => o.payment_id));
          newData.recent_orders.forEach(o => {
            if (!prevOrderIds.has(o.payment_id)) {
              addLog('pay', `New Order: ${o.product} ($${o.price_usd}) - ${o.status.toUpperCase()}`);
            }
          });

          // Signals
          const prevSignalIds = new Set(prev.recent_signals.map(s => s.id));
          newData.recent_signals.forEach(s => {
            if (!prevSignalIds.has(s.id)) {
              addLog('system', `Signal: ${s.signal} - ${JSON.stringify(s.payload)}`);
            }
          });

          // Console commands from other users
          const prevConsoleIds = new Set(prev.recent_console.map(c => c.id));
          newData.recent_console.forEach(c => {
            if (!prevConsoleIds.has(c.id) && c.user_id !== user?.id) {
              addLog('info', `[${c.user_name}] > ${c.metadata.cmd}`);
            }
          });
        }
        
        prevDataRef.current = newData;
      } catch (err) {
        addLog('error', 'Poll failed: Connection lost');
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
        if (data) {
          addLog('system', `Services: NP=${data.services.nowpayments.status.toUpperCase()}, SB=${data.services.supabase.status.toUpperCase()}, BOT=${data.services.bot.status.toUpperCase()}`);
          addLog('system', `Last Pulse: ${data.services.bot.seconds_ago !== null ? data.services.bot.seconds_ago + 's ago' : 'N/A'}`);
        }
        break;
      case 'ping':
        addLog('system', 'System Ping initiated...');
        manualSync();
        break;
      case 'audit':
        if (data?.recent_audits.length) {
          data.recent_audits.forEach(a => addLog('ok', `[AUDIT] ${a.action}: ${a.details}`));
        } else {
          addLog('warn', 'No recent audit logs found.');
        }
        break;
      case 'logs':
        addLog('info', 'Fetching recent system logs...');
        if (data?.recent_console.length) {
          data.recent_console.forEach(c => addLog('info', `[${c.user_name}] > ${c.metadata.cmd}`));
        } else {
          addLog('warn', 'No recent console logs found.');
        }
        break;
      case 'orders':
        if (data?.recent_orders.length) {
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
      setData(newData);
      prevDataRef.current = newData;
      addLog('ok', 'Synchronization complete');
    } catch {
      addLog('error', 'Synchronization failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const purgeRegistry = async () => {
    if (!confirm('EXTREME CAUTION: This will delete all historical shop orders. Proceed?')) return;
    try {
      addLog('warn', 'Sending PURGE REGISTRY signal...');
      const { error } = await supabase.from('bot_settings').update({ purge_shop_signal: true }).eq('id', 'global');
      if (error) throw error;
      addLog('ok', 'Purge signal acknowledged');
    } catch (err: any) {
      addLog('error', `Purge failed: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-[#080b0f] border border-white/10 rounded-xl overflow-hidden font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#0d1117] border-bottom border-white/5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-black tracking-widest text-white uppercase">
            SYSTEM <span className="text-blue-400">ADMINISTRATION</span> // CONSOLE
          </div>
          <div className="text-[9px] text-white/30 uppercase tracking-tighter">
            Real-time System Monitoring & Management
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-white/40">
            <div className={clsx(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              data?.services.bot.status === 'online' ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-red-400"
            )} />
            <span>{data?.services.bot.status === 'online' ? 'LIVE' : 'OFFLINE'} · TICK {tick}</span>
          </div>
          
          <button 
            onClick={() => signOut()}
            className="pl-4 border-l border-white/10 text-white/20 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Health */}
        <div className="w-64 border-r border-white/5 flex flex-col bg-black/20">
          <div className="px-4 py-3 text-[9px] font-bold text-white/30 uppercase tracking-widest border-b border-white/5">
            Service Health
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <HealthRow 
              name="NOWPayments" 
              status={data?.services.nowpayments.status || 'sync'} 
              detail={data?.services.nowpayments.latency_ms ? `${data.services.nowpayments.latency_ms}ms` : '—'} 
            />
            <HealthRow 
              name="Supabase" 
              status={data?.services.supabase.status || 'sync'} 
              detail={data?.services.supabase.latency_ms ? `${data.services.supabase.latency_ms}ms` : '—'} 
            />
            <HealthRow 
              name="Bot Heartbeat" 
              status={data?.services.bot.status || 'sync'} 
              detail={data?.services.bot.seconds_ago !== null ? `${data.services.bot.seconds_ago}s ago` : '—'} 
            />

            <div className="mt-6 px-4 py-3 text-[9px] font-bold text-white/30 uppercase tracking-widest border-t border-white/5">
              Environment
            </div>
            <div className="px-4 py-2 space-y-1">
              {data && Object.entries(data.env).map(([key, val]) => (
                <div key={key} className="flex justify-between text-[10px] gap-2">
                  <span className="text-blue-400/60 truncate">{key}</span>
                  <span className={(val as string).includes('✓') ? "text-green-400" : "text-red-400"}>
                    {(val as string).includes('✓') ? 'SET' : 'MISSING'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Console Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Log Controls */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#0d1117] border-b border-white/5">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
              Live Feed <span className="text-blue-400 ml-2">{logs.length} entries</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={manualSync}
                disabled={isSyncing}
                className={clsx(
                  "flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase border rounded transition-all",
                  isSyncing ? "bg-white/5 border-white/10 text-white/20" : "bg-green-400/5 border-green-400/20 text-green-400 hover:bg-green-400/10"
                )}
              >
                <RefreshCw className={clsx("w-2.5 h-2.5", isSyncing && "animate-spin")} />
                Sync
              </button>
              
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="px-2 py-1 text-[9px] font-bold uppercase bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all rounded"
              >
                {isPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
              </button>
              
              <button 
                onClick={() => setLogs([])}
                className="px-2 py-1 text-[9px] font-bold uppercase bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all rounded"
              >
                Clear
              </button>
              
              <button 
                onClick={() => setAutoScroll(!autoScroll)}
                className={clsx(
                  "px-2 py-1 text-[9px] font-bold uppercase border rounded transition-all",
                  autoScroll ? "bg-blue-400/10 border-blue-400/30 text-blue-400" : "bg-white/5 border-white/10 text-white/40"
                )}
              >
                Scroll
              </button>
            </div>
          </div>

          {/* Log Feed */}
          <div 
            ref={logFeedRef}
            className="flex-1 overflow-y-auto p-4 space-y-0.5 custom-scrollbar bg-black/40"
          >
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 text-[11px] group hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
                <span className="text-white/20 w-16 shrink-0">{log.time}</span>
                <span className={clsx(
                  "w-14 shrink-0 font-black uppercase text-[9px] pt-0.5",
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
                  log.level === 'info' && "text-white/70",
                  log.level === 'ok' && "text-green-200",
                  log.level === 'warn' && "text-yellow-200",
                  log.level === 'error' && "text-red-200",
                  log.level === 'system' && "text-purple-200",
                  log.level === 'pay' && "text-orange-200"
                )}>
                  {log.msg}
                </span>
              </div>
            ))}
          </div>

          {/* Console Input */}
          <form onSubmit={handleCommand} className="p-3 bg-black/60 border-t border-white/10 flex items-center gap-3">
            <span className="text-[10px] font-black text-green-400 shrink-0">
              root@{user?.user_metadata?.username || 'admin'}:~$
            </span>
            <input 
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type 'help' for commands..."
              className="flex-1 bg-transparent border-none outline-none text-white text-xs placeholder:text-white/10"
              autoFocus
            />
          </form>
        </div>

        {/* Right Sidebar - Data */}
        <div className="w-72 border-l border-white/5 flex flex-col bg-black/20">
          <div className="px-4 py-3 text-[9px] font-bold text-white/30 uppercase tracking-widest border-b border-white/5">
            Operational Data
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Active Administrators */}
            <div className="p-4">
              <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-3">
                Active Administrators
              </div>
              <div className="flex flex-wrap gap-2">
                {data?.active_admins.length === 0 ? (
                  <div className="text-[10px] text-white/20 italic">NO_ADMINS_DETECTED</div>
                ) : (
                  data?.active_admins.map((admin, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded-md">
                      <div className="w-4 h-4 rounded-full bg-blue-400/20 flex items-center justify-center">
                        <User className="w-2.5 h-2.5 text-blue-400" />
                      </div>
                      <span className="text-[10px] font-bold text-white/80">{admin.username}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="p-4 border-t border-white/5">
              <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-3">
                Recent Orders
              </div>
              <div className="space-y-2">
                {data?.recent_orders.map((order, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded transition-all text-left group"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-white/80 truncate group-hover:text-white">{order.product}</span>
                      <span className="text-[8px] text-white/20 font-mono">{order.payment_id.slice(0, 8)}...</span>
                    </div>
                    <span className={clsx(
                      "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                      order.status === 'finished' || order.status === 'confirmed' ? "bg-green-400/10 text-green-400" :
                      order.status === 'waiting' || order.status === 'confirming' ? "bg-yellow-400/10 text-yellow-400" :
                      "bg-red-400/10 text-red-400"
                    )}>
                      {order.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/5">
            <button 
              onClick={purgeRegistry}
              className="w-full py-2 bg-red-400/5 hover:bg-red-400/10 border border-red-400/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded transition-all"
            >
              PURGE REGISTRY
            </button>
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
              className="relative w-full max-w-md bg-[#0d1117] border border-white/10 rounded-xl p-8 shadow-2xl"
            >
              <div className="text-blue-400 text-xs font-black tracking-widest uppercase mb-6 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Order Details
              </div>
              
              <div className="space-y-4">
                <ModalField label="Product" value={selectedOrder.product} />
                <ModalField label="Buyer ID" value={`UID: ${selectedOrder.buyer_discord_id}`} />
                <ModalField label="Payment ID" value={selectedOrder.payment_id} isMono />
                <ModalField label="Status" value={selectedOrder.status.toUpperCase()} />
              </div>

              <button 
                onClick={() => setSelectedOrder(null)}
                className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest rounded transition-all"
              >
                Close
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
