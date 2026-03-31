import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const auditLogs = [
  { id: 'LOG-1', mod: 'AdminBob', user: 'Spammer#1234', action: 'ban', reason: 'Mass DM spamming', time: '5m ago' },
  { id: 'LOG-2', mod: 'ModKaka', user: 'User#9999', action: 'warn', reason: 'Inappropriate language', time: '12m ago' },
  { id: 'LOG-3', mod: 'System', user: 'Bot#0001', action: 'kick', reason: 'Raid protection triggered', time: '25m ago' },
  { id: 'LOG-4', mod: 'AdminBob', user: 'Alice#5678', action: 'mute', reason: 'Spamming emojis', time: '1h ago' },
];

const ActionBadge = ({ action }: { action: string }) => {
  const colors: Record<string, string> = {
    'ban': 'text-white bg-white/10 border-white/20',
    'kick': 'text-white/80 bg-white/5 border-white/10',
    'warn': 'text-white/60 bg-white/5 border-white/10',
    'mute': 'text-white/70 bg-white/5 border-white/10',
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-widest",
      colors[action]
    )}>
      {action}
    </span>
  );
};

export const ModerationSuite = () => {
  const [activeTab, setActiveTab] = useState<'center' | 'logs' | 'protection'>('center');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Moderation Suite</h1>
          <p className="text-text-secondary">Enforce rules and maintain order with advanced moderation tools.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-bg-secondary rounded-xl border border-border">
          <button 
            onClick={() => setActiveTab('center')}
            className={cn("px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all", activeTab === 'center' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary")}
          >
            Action Center
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={cn("px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all", activeTab === 'logs' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary")}
          >
            Audit Logs
          </button>
          <button 
            onClick={() => setActiveTab('protection')}
            className={cn("px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all", activeTab === 'protection' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary")}
          >
            Protection
          </button>
        </div>
      </div>

      {activeTab === 'center' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-8 rounded-2xl border border-border space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-white/5 text-white">
                  <Shield size={20} />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest">Quick Action</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">User ID / Username</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 123456789012345678"
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Action Type</label>
                  <select className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 text-text-primary">
                    <option>Ban</option>
                    <option>Kick</option>
                    <option>Warn</option>
                    <option>Mute</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Reason</label>
                <textarea 
                  placeholder="Enter moderation reason..."
                  className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all h-24 resize-none text-text-primary"
                ></textarea>
              </div>

              <div className="flex items-center gap-4">
                <button className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all">
                  Execute Action
                </button>
                <button className="px-6 py-3 rounded-xl bg-bg-tertiary border border-border font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">
                  Schedule
                </button>
              </div>
            </div>

            <div className="glass p-8 rounded-2xl border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-white">
                    <History size={20} />
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-widest">Recent Appeals</h3>
                </div>
                <button className="text-[10px] uppercase tracking-widest text-text-secondary hover:text-white">View All</button>
              </div>

              <div className="space-y-4">
                {[
                  { user: 'BannedUser#0001', time: '2h ago', status: 'pending' },
                  { user: 'OldMember#1234', time: '5h ago', status: 'pending' },
                ].map((appeal, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-bg-tertiary border border-border group hover:border-white/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-bg-secondary border border-border overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appeal.user}`} alt="" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{appeal.user}</p>
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest">Appeal submitted {appeal.time}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-border space-y-4">
              <h3 className="font-bold text-[10px] uppercase tracking-widest text-text-secondary">Mod Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-bg-tertiary border border-border">
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Bans</p>
                  <p className="text-2xl font-bold">1,242</p>
                </div>
                <div className="p-4 rounded-xl bg-bg-tertiary border border-border">
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Warns</p>
                  <p className="text-2xl font-bold">3,891</p>
                </div>
                <div className="p-4 rounded-xl bg-bg-tertiary border border-border">
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Mutes</p>
                  <p className="text-2xl font-bold">856</p>
                </div>
                <div className="p-4 rounded-xl bg-bg-tertiary border border-border">
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Kicks</p>
                  <p className="text-2xl font-bold">412</p>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl border border-border bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/5 text-white">
                  <Zap size={20} />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest">Auto-Mod Active</h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                AI-powered spam detection is currently monitoring all channels. 12 potential raids were blocked today.
              </p>
              <button className="w-full py-2 rounded-lg bg-bg-tertiary border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                Configure Auto-Mod
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input 
                type="text" 
                placeholder="Search logs..." 
                className="w-full bg-bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-border text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-all">
              <Filter size={18} />
              Filter
            </button>
          </div>

          <div className="glass rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Moderator</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Target User</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Action</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Reason</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Time</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[8px] font-bold">
                          {log.mod[0]}
                        </div>
                        <span className="text-xs font-bold">{log.mod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs">{log.user}</span>
                    </td>
                    <td className="px-6 py-4">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-text-secondary truncate max-w-[200px] block">{log.reason}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] text-text-secondary uppercase tracking-widest">{log.time}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 rounded-lg hover:bg-white/10 text-text-secondary opacity-0 group-hover:opacity-100 transition-all">
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'protection' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-2xl border border-border space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Anti-Spam Settings</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Enable Anti-Spam</p>
                  <p className="text-xs text-text-secondary">Detect and block message bursts</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-white relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full"></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Message Threshold</label>
                <div className="flex items-center gap-4">
                  <input type="range" className="flex-1 accent-white" />
                  <span className="text-sm font-bold w-8">5</span>
                </div>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest">Messages per 3 seconds</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Punishment</label>
                <select className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 text-text-primary">
                  <option>Mute (10m)</option>
                  <option>Warn</option>
                  <option>Kick</option>
                  <option>Ban</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl border border-border space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Raid Protection</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-white" size={20} />
                  <div>
                    <p className="text-sm font-bold">Panic Mode</p>
                    <p className="text-xs text-text-secondary">Instantly lock all channels</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all">
                  ACTIVATE
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Anti-Link</p>
                  <p className="text-xs text-text-secondary">Block all external links</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-white relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Anti-Invite</p>
                  <p className="text-xs text-text-secondary">Block Discord server invites</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-bg-tertiary border border-border relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white/20 rounded-full"></div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <button className="w-full py-3 rounded-xl bg-bg-tertiary border border-border font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">
                  View Raid History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
