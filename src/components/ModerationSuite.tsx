import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Ban, 
  UserX, 
  Clock, 
  FileText, 
  Search, 
  Filter, 
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  History,
  Zap,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface AuditLog {
  id: string;
  mod: string;
  user: string;
  action: string;
  reason: string;
  time: string;
}

const ActionBadge = ({ action }: { action: string }) => {
  const colors: Record<string, string> = {
    'ban': 'text-white bg-white/10 border-white/20',
    'kick': 'text-white/80 bg-white/5 border-white/10',
    'warn': 'text-white/60 bg-white/5 border-white/10',
    'mute': 'text-white/70 bg-white/5 border-white/10',
    'unban': 'text-green-400 bg-green-400/10 border-green-400/20',
    'update': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-widest",
      colors[action] || 'text-white/50 bg-white/5 border-white/10'
    )}>
      {action}
    </span>
  );
};

export const ModerationSuite = () => {
  const [activeTab, setActiveTab] = useState<'center' | 'logs' | 'protection'>('center');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // Action Center State
  const [targetId, setTargetId] = useState('');
  const [actionType, setActionType] = useState('Ban');
  const [reason, setReason] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [actionResult, setActionResult] = useState<{ success: boolean, message: string } | null>(null);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch('/api/discord/audit-logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const handleExecuteAction = async () => {
    if (!targetId || isExecuting) return;
    
    setIsExecuting(true);
    setActionResult(null);
    
    try {
      const response = await fetch('/api/discord/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetId, action: actionType, reason })
      });
      
      const data = await response.json();
      if (response.ok) {
        setActionResult({ success: true, message: data.message });
        setTargetId('');
        setReason('');
      } else {
        setActionResult({ success: false, message: data.error || 'Action failed' });
      }
    } catch (error) {
      setActionResult({ success: false, message: 'Network error occurred' });
    } finally {
      setIsExecuting(false);
    }
  };

  // Protection State
  const [antiSpamEnabled, setAntiSpamEnabled] = useState(true);
  const [messageThreshold, setMessageThreshold] = useState(5);
  const [antiLinkEnabled, setAntiLinkEnabled] = useState(true);
  const [antiInviteEnabled, setAntiInviteEnabled] = useState(false);
  const [isPanicModeActive, setIsPanicModeActive] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic">Moderation Suite</h1>
          <p className="text-text-secondary text-xs font-mono tracking-widest uppercase opacity-60">Enforcement Protocols & Community Safety Matrix</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg border border-white/10 overflow-x-auto custom-scrollbar whitespace-nowrap neo-border">
          <button 
            onClick={() => setActiveTab('center')}
            className={cn("px-4 py-1.5 rounded-md text-[9px] uppercase tracking-[0.2em] font-bold transition-all shrink-0", activeTab === 'center' ? "bg-white text-black shadow-lg" : "text-text-secondary hover:text-text-primary")}
          >
            Action Center
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={cn("px-4 py-1.5 rounded-md text-[9px] uppercase tracking-[0.2em] font-bold transition-all shrink-0", activeTab === 'logs' ? "bg-white text-black shadow-lg" : "text-text-secondary hover:text-text-primary")}
          >
            Audit Logs
          </button>
          <button 
            onClick={() => setActiveTab('protection')}
            className={cn("px-4 py-1.5 rounded-md text-[9px] uppercase tracking-[0.2em] font-bold transition-all shrink-0", activeTab === 'protection' ? "bg-white text-black shadow-lg" : "text-text-secondary hover:text-text-primary")}
          >
            Protection
          </button>
        </div>
      </div>

      {activeTab === 'center' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-8 rounded-xl border border-white/10 space-y-6 neo-border relative overflow-hidden">
              <div className="absolute inset-0 scanline opacity-5"></div>
              <div className="flex items-center gap-3 mb-2 relative">
                <div className="p-2 rounded-lg bg-white/5 text-white border border-white/10">
                  <Shield size={18} />
                </div>
                <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-white/80">Quick Enforcement Protocol</h3>
              </div>

              {actionResult && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-lg border flex items-center gap-3 relative z-10",
                    actionResult.success ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                  )}
                >
                  {actionResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <p className="text-[10px] font-bold uppercase tracking-widest">{actionResult.message}</p>
                  <button onClick={() => setActionResult(null)} className="ml-auto text-[8px] uppercase font-bold opacity-50 hover:opacity-100">Dismiss</button>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Target Identification [ID]</label>
                  <input 
                    type="text" 
                    placeholder="E.G. 123456789012345678"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[11px] font-mono tracking-widest focus:outline-none focus:border-white/30 transition-all text-text-primary placeholder:text-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Protocol Type</label>
                  <select 
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[11px] font-mono tracking-widest focus:outline-none focus:border-white/30 text-text-primary appearance-none cursor-pointer"
                  >
                    <option className="bg-bg-primary">Ban</option>
                    <option className="bg-bg-primary">Kick</option>
                    <option className="bg-bg-primary" disabled>Warn [DB REQ]</option>
                    <option className="bg-bg-primary" disabled>Mute [DB REQ]</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 relative z-10">
                <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Incident Justification</label>
                <textarea 
                  placeholder="ENTER MODERATION REASON..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[11px] font-mono tracking-widest focus:outline-none focus:border-white/30 transition-all h-24 resize-none text-text-primary placeholder:text-white/10"
                ></textarea>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <button 
                  onClick={handleExecuteAction}
                  disabled={!targetId || isExecuting}
                  className="flex-1 py-3 rounded-lg bg-white text-black font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  {isExecuting ? <Loader2 size={14} className="animate-spin" /> : null}
                  {isExecuting ? 'EXECUTING...' : 'EXECUTE PROTOCOL'}
                </button>
                <button className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                  Schedule
                </button>
              </div>
            </div>

            <div className="glass p-8 rounded-xl border border-white/10 neo-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-white border border-white/10">
                    <History size={18} />
                  </div>
                  <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-white/80">Incoming Appeals</h3>
                </div>
                <button className="text-[9px] uppercase tracking-[0.2em] text-text-secondary hover:text-white transition-colors">View All Archive</button>
              </div>

              <div className="space-y-3">
                {[
                  { user: 'BannedUser#0001', time: '2h ago', status: 'pending' },
                  { user: 'OldMember#1234', time: '5h ago', status: 'pending' },
                ].map((appeal, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-bg-secondary border border-white/10 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appeal.user}`} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-tight">{appeal.user}</p>
                        <p className="text-[8px] text-text-secondary uppercase tracking-[0.2em] font-mono opacity-60">Submitted {appeal.time}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-md bg-white/5 text-white text-[9px] font-bold uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all">
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass p-6 rounded-xl border border-white/10 space-y-4 neo-border">
              <h3 className="font-bold text-[9px] uppercase tracking-[0.3em] text-text-secondary">Enforcement Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <p className="text-[8px] text-text-secondary font-bold uppercase tracking-[0.2em]">Bans</p>
                  <p className="text-2xl font-bold font-mono tracking-tighter">1,242</p>
                </div>
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <p className="text-[8px] text-text-secondary font-bold uppercase tracking-[0.2em]">Warns</p>
                  <p className="text-2xl font-bold font-mono tracking-tighter">3,891</p>
                </div>
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <p className="text-[8px] text-text-secondary font-bold uppercase tracking-[0.2em]">Mutes</p>
                  <p className="text-2xl font-bold font-mono tracking-tighter">856</p>
                </div>
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <p className="text-[8px] text-text-secondary font-bold uppercase tracking-[0.2em]">Kicks</p>
                  <p className="text-2xl font-bold font-mono tracking-tighter">412</p>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl border border-white/10 bg-white/[0.01] neo-border relative overflow-hidden">
              <div className="absolute inset-0 scanline opacity-5"></div>
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="p-2 rounded-lg bg-white/5 text-white border border-white/10">
                  <Zap size={18} />
                </div>
                <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-white/80">Auto-Mod Active</h3>
              </div>
              <p className="text-[10px] text-text-secondary leading-relaxed mb-4 font-medium italic relative">
                AI-powered spam detection is currently monitoring all channels. 12 potential raids were blocked today.
              </p>
              <button className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all relative">
                Configure Auto-Mod
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-white transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH AUDIT LOGS..." 
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-[10px] font-mono tracking-widest uppercase focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
              />
            </div>
            <button 
              onClick={fetchLogs}
              disabled={loadingLogs}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg glass border border-white/10 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {loadingLogs ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg glass border border-white/10 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-white/10 transition-all">
              <Filter size={14} />
              Filter
            </button>
          </div>

          <div className="glass rounded-xl border border-white/10 overflow-hidden neo-border">
            {loadingLogs && logs.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 size={32} className="animate-spin text-white/20" />
                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-text-secondary">Decrypting Matrix Logs...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary">Moderator</th>
                    <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary">Target User</th>
                    <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary">Action</th>
                    <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary">Reason</th>
                    <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary">Timestamp</th>
                    <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-bold font-mono">
                            {log.mod[0]}
                          </div>
                          <span className="text-xs font-bold uppercase tracking-tight">{log.mod}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-white/70">{log.user}</span>
                      </td>
                      <td className="px-6 py-4">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] text-text-secondary truncate max-w-[200px] block italic">"{log.reason}"</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] text-text-secondary font-mono uppercase tracking-widest">{log.time}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-md hover:bg-white/10 text-text-secondary opacity-0 group-hover:opacity-100 transition-all">
                          <FileText size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && !loadingLogs && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-text-secondary text-[10px] font-mono uppercase tracking-[0.2em]">
                        NO AUDIT ENTRIES FOUND IN CURRENT MATRIX.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'protection' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-xl border border-white/10 space-y-6 neo-border relative overflow-hidden">
            <div className="absolute inset-0 scanline opacity-5"></div>
            <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-white/80 mb-4 relative">Anti-Spam Protocols</h3>
            
            <div className="space-y-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">Enable Anti-Spam</p>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest opacity-60">Detect and block message bursts</p>
                </div>
                <div 
                  onClick={() => setAntiSpamEnabled(!antiSpamEnabled)}
                  className={cn(
                    "w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300",
                    antiSpamEnabled ? "bg-white" : "bg-white/5 border border-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full transition-all duration-300",
                    antiSpamEnabled ? "right-1 bg-black" : "left-1 bg-white/20"
                  )}></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Message Threshold</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={messageThreshold}
                    onChange={(e) => setMessageThreshold(parseInt(e.target.value))}
                    className="flex-1 accent-white h-1 bg-white/10 rounded-full appearance-none cursor-pointer" 
                  />
                  <span className="text-xs font-bold font-mono w-8">{messageThreshold}</span>
                </div>
                <p className="text-[8px] text-text-secondary uppercase tracking-widest opacity-60">Messages per 3 seconds</p>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Punishment Protocol</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[11px] font-mono tracking-widest focus:outline-none focus:border-white/30 text-text-primary appearance-none cursor-pointer">
                  <option className="bg-bg-primary">Mute [10M]</option>
                  <option className="bg-bg-primary">Warn</option>
                  <option className="bg-bg-primary">Kick</option>
                  <option className="bg-bg-primary">Ban</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-xl border border-white/10 space-y-6 neo-border relative overflow-hidden">
            <div className="absolute inset-0 scanline opacity-5"></div>
            <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-white/80 mb-4 relative">Raid Protection Matrix</h3>
            
            <div className="space-y-6 relative">
              <div className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-all duration-300",
                isPanicModeActive ? "bg-red-500/10 border-red-500/30" : "bg-white/[0.02] border-white/10"
              )}>
                <div className="flex items-center gap-3">
                  <AlertCircle className={cn(isPanicModeActive ? "text-red-400" : "text-white/40")} size={18} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight">Panic Mode</p>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest opacity-60">Instantly lock all channels</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPanicModeActive(!isPanicModeActive)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-[0.2em] transition-all",
                    isPanicModeActive ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "bg-white text-black hover:bg-white/90"
                  )}
                >
                  {isPanicModeActive ? 'DEACTIVATE' : 'ACTIVATE'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">Anti-Link</p>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest opacity-60">Block all external links</p>
                </div>
                <div 
                  onClick={() => setAntiSpamEnabled(!antiSpamEnabled)}
                  className={cn(
                    "w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300",
                    antiSpamEnabled ? "bg-white" : "bg-white/5 border border-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full transition-all duration-300",
                    antiSpamEnabled ? "right-1 bg-black" : "left-1 bg-white/20"
                  )}></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">Anti-Invite</p>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest opacity-60">Block Discord server invites</p>
                </div>
                <div 
                  onClick={() => setAntiInviteEnabled(!antiInviteEnabled)}
                  className={cn(
                    "w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300",
                    antiInviteEnabled ? "bg-white" : "bg-white/5 border border-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full transition-all duration-300",
                    antiInviteEnabled ? "right-1 bg-black" : "left-1 bg-white/20"
                  )}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                  View Raid History Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
