import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bot, 
  Shield, 
  Bell, 
  Zap, 
  Power, 
  RefreshCw, 
  ChevronRight,
  UserCheck,
  Lock,
  Globe,
  MessageSquare,
  Users,
  Hash,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
}

interface DiscordGuild {
  name: string;
  memberCount: number;
  icon: string | null;
  roles: DiscordRole[];
}

export const ServerConfig = () => {
  const [activeTab, setActiveTab] = useState<'identity' | 'permissions' | 'modules' | 'alerts' | 'discord'>('identity');
  const [discordData, setDiscordData] = useState<DiscordGuild | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscordData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/discord/guild');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch Discord data');
      }
      const data = await response.json();
      setDiscordData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'discord') {
      fetchDiscordData();
    }
  }, [activeTab]);

  const intToHex = (color: number) => {
    if (color === 0) return '#99aab5';
    return `#${color.toString(16).padStart(6, '0')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Server Configuration</h1>
          <p className="text-text-secondary">Fine-tune your bot's identity and core server settings.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-bg-secondary rounded-xl border border-border overflow-x-auto custom-scrollbar max-w-full">
          {['identity', 'permissions', 'modules', 'alerts', 'discord'].map((t) => (
            <button 
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all capitalize whitespace-nowrap shrink-0", 
                activeTab === t ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'identity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-8 rounded-2xl border border-border space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-white/5 text-white">
                  <Bot size={20} />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest">Bot Identity</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Bot Name</label>
                  <input 
                    type="text" 
                    defaultValue="Bob The Seller"
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Command Prefix</label>
                  <input 
                    type="text" 
                    defaultValue="/"
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Status</label>
                  <select className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 text-text-primary">
                    <option>Online</option>
                    <option>Idle</option>
                    <option>Do Not Disturb</option>
                    <option>Invisible</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Activity Type</label>
                  <select className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 text-text-primary">
                    <option>Playing</option>
                    <option>Watching</option>
                    <option>Listening</option>
                    <option>Streaming</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Activity Text</label>
                <input 
                  type="text" 
                  defaultValue="with your orders | /help"
                  className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-text-secondary uppercase tracking-widest">
                  <RefreshCw size={14} className="animate-spin-slow" />
                  Last updated 2 hours ago
                </div>
                <button className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all">
                  Update Identity
                </button>
              </div>
            </div>

            <div className="glass p-8 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/5 text-white">
                    <Power size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest">System Control</h3>
                    <p className="text-xs text-text-secondary">Restart the bot process or clear cache.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-xl bg-bg-tertiary border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                    Clear Cache
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all">
                    Restart Bot
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-border">
              <h3 className="font-bold text-[10px] uppercase tracking-widest text-text-secondary mb-6">Bot Preview</h3>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black">
                      <Bot size={24} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white border-[3px] border-[#0a0a0a]"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-bold text-sm">Bob The Seller</span>
                      <span className="bg-white/10 text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase border border-white/20">Bot</span>
                    </div>
                    <p className="text-text-secondary text-[10px] uppercase tracking-widest">Playing <span className="font-bold text-white">with your orders | /help</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl border border-border space-y-4">
              <h3 className="font-bold text-[10px] uppercase tracking-widest text-text-secondary">Quick Toggles</h3>
              {[
                { label: 'Public Invites', enabled: true },
                { label: 'DM Notifications', enabled: false },
                { label: 'Slash Commands', enabled: true },
                { label: 'Legacy Commands', enabled: false },
              ].map((toggle, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-medium">{toggle.label}</span>
                  <div className={cn(
                    "w-10 h-5 rounded-full relative cursor-pointer transition-all",
                    toggle.enabled ? "bg-white" : "bg-bg-tertiary border border-border"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all",
                      toggle.enabled ? "right-0.5 bg-black" : "left-0.5 bg-white/20"
                    )}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="glass rounded-2xl border border-border overflow-hidden">
          <div className="px-8 py-6 border-b border-border bg-white/5">
            <h3 className="font-bold text-sm uppercase tracking-widest">Permissions Matrix</h3>
            <p className="text-xs text-text-secondary">Define which roles can access specific bot modules.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Module</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary text-center">Owner</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary text-center">Admin</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary text-center">Moderator</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary text-center">Helper</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: 'Dashboard Access', icon: Globe },
                  { name: 'Member Management', icon: UserCheck },
                  { name: 'Ticket Handling', icon: MessageSquare },
                  { name: 'Shop Management', icon: Zap },
                  { name: 'Moderation Tools', icon: Shield },
                  { name: 'System Config', icon: Settings },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <row.icon size={16} className="text-text-secondary" />
                        <span className="text-xs font-bold uppercase tracking-widest">{row.name}</span>
                      </div>
                    </td>
                    {[true, true, i < 5, i < 3].map((allowed, j) => (
                      <td key={j} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {allowed ? (
                            <div className="w-5 h-5 rounded-md bg-white/10 text-white flex items-center justify-center border border-white/20">
                              <UserCheck size={12} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md bg-white/5 text-white/20 flex items-center justify-center border border-white/5">
                              <Lock size={12} />
                            </div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 'cog_shop', name: 'Shop Module', desc: 'Enable digital storefront and automated payments.', enabled: true },
            { id: 'cog_tickets', name: 'Ticket System', desc: 'Advanced support ticket management with transcripts.', enabled: true },
            { id: 'cog_verify', name: 'Verification', desc: 'Secure captcha-based server entry gatekeeping.', enabled: true },
            { id: 'cog_mod', name: 'Moderation', desc: 'Comprehensive logging and moderation action suite.', enabled: true },
            { id: 'cog_economy', name: 'Economy', desc: 'User XP, levels, and virtual currency system.', enabled: false },
            { id: 'cog_logs', name: 'Audit Logs', desc: 'Track every event that happens in your server.', enabled: true },
          ].map((cog) => (
            <div key={cog.id} className="glass p-6 rounded-2xl border border-border space-y-4 relative overflow-hidden group">
              <div className={cn(
                "absolute top-0 right-0 w-24 h-24 blur-3xl -mr-12 -mt-12 transition-all",
                cog.enabled ? "bg-white/5 group-hover:bg-white/10" : "bg-bg-tertiary"
              )}></div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-widest">{cog.name}</h3>
                <div className={cn(
                  "w-10 h-5 rounded-full relative cursor-pointer transition-all",
                  cog.enabled ? "bg-white" : "bg-bg-tertiary border border-border"
                )}>
                  <div className={cn(
                    "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all",
                    cog.enabled ? "right-0.5 bg-black" : "left-0.5 bg-white/20"
                  )}></div>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{cog.desc}</p>
              <button className="text-[10px] font-bold text-white uppercase tracking-widest hover:underline flex items-center gap-1">
                Configure Module <ChevronRight size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="glass p-8 rounded-2xl border border-border space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-white/5 text-white">
              <Bell size={20} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-widest">Alert Routing</h3>
          </div>

          <div className="space-y-4">
            {[
              { event: 'Member Join', channel: '#joins-leaves' },
              { event: 'Message Delete', channel: '#audit-logs' },
              { event: 'Role Update', channel: '#audit-logs' },
              { event: 'Ticket Opened', channel: '#staff-alerts' },
              { event: 'Payment Received', channel: '#sales-logs' },
              { event: 'Raid Detected', channel: '#panic-room' },
            ].map((route, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-bg-tertiary border border-border group hover:border-white/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-bg-secondary border border-border flex items-center justify-center text-text-secondary">
                    <Zap size={14} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">{route.event}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest">Route to:</span>
                  <select className="bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-white/50 text-text-primary">
                    <option>{route.channel}</option>
                    <option>#general</option>
                    <option>#off-topic</option>
                    <option>Disable</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'discord' && (
        <div className="space-y-8">
          {loading ? (
            <div className="glass p-12 rounded-2xl border border-border flex flex-col items-center justify-center gap-4">
              <RefreshCw size={32} className="animate-spin text-white/50" />
              <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Fetching Discord Data...</p>
            </div>
          ) : error ? (
            <div className="glass p-12 rounded-2xl border border-border flex flex-col items-center justify-center gap-6 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Discord Integration Error</h3>
                <p className="text-sm text-text-secondary max-w-md mx-auto">{error}</p>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                  onClick={fetchDiscordData}
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 transition-all"
                >
                  Retry Connection
                </button>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest">
                  Ensure DISCORD_BOT_TOKEN and DISCORD_GUILD_ID are set in your environment.
                </p>
              </div>
            </div>
          ) : discordData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass p-8 rounded-2xl border border-border space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-bg-tertiary border border-border overflow-hidden shadow-xl">
                        {discordData.icon ? (
                          <img src={discordData.icon} alt={discordData.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <Users size={32} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">{discordData.name}</h2>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Users size={14} />
                          <span className="text-xs font-bold uppercase tracking-widest">{discordData.memberCount.toLocaleString()} Members</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-3 rounded-xl glass border border-border hover:bg-white/10 transition-all text-text-secondary hover:text-white">
                      <ExternalLink size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Server Name</p>
                      <p className="text-sm font-bold">{discordData.name}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Total Roles</p>
                      <p className="text-sm font-bold">{discordData.roles.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Verification Level</p>
                      <p className="text-sm font-bold">High</p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl border border-border overflow-hidden">
                  <div className="px-8 py-6 border-b border-border bg-white/5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-widest">Server Roles</h3>
                      <p className="text-xs text-text-secondary">A list of all roles available in your Discord server.</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                      {discordData.roles.length} Roles
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-white/[0.02]">
                          <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Role Name</th>
                          <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">ID</th>
                          <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary text-right">Color</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {discordData.roles.map((role) => (
                          <tr key={role.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-3 h-3 rounded-full shadow-sm" 
                                  style={{ backgroundColor: intToHex(role.color) }}
                                />
                                <span className="text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">{role.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <span className="text-[10px] font-mono text-text-secondary">{role.id}</span>
                            </td>
                            <td className="px-8 py-4 text-right">
                              <span className="text-[10px] font-mono text-text-secondary uppercase">{intToHex(role.color)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass p-6 rounded-2xl border border-border space-y-4">
                  <h3 className="font-bold text-[10px] uppercase tracking-widest text-text-secondary">Integration Status</h3>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                      <span className="text-xs font-bold uppercase tracking-widest">Connected</span>
                    </div>
                    <span className="text-[10px] text-text-secondary font-mono">v10 API</span>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Your bot is currently connected to the Discord API and fetching real-time server metadata.
                  </p>
                </div>

                <div className="glass p-6 rounded-2xl border border-border space-y-4">
                  <h3 className="font-bold text-[10px] uppercase tracking-widest text-text-secondary">Quick Actions</h3>
                  <button className="w-full py-3 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                    <RefreshCw size={14} />
                    Sync Metadata
                  </button>
                  <button className="w-full py-3 rounded-xl glass border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <Hash size={14} />
                    View Channels
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass p-12 rounded-2xl border border-border flex flex-col items-center justify-center gap-4">
              <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">No Discord data available.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
