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

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

export const ServerConfig = () => {
  const [activeTab, setActiveTab] = useState<'identity' | 'permissions' | 'modules' | 'alerts' | 'discord'>('identity');
  const [discordData, setDiscordData] = useState<DiscordGuild | null>(null);
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err: any) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (payload: any) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.ok) {
        setSuccess('Settings updated successfully');
        fetchSettings();
      } else {
        throw new Error(data.error || 'Failed to update settings');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fetchDiscordData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [guildRes, channelsRes] = await Promise.all([
        fetch('/api/discord/guild'),
        fetch('/api/discord/channels')
      ]);

      if (!guildRes.ok) {
        const data = await guildRes.json();
        throw new Error(data.error || 'Failed to fetch Discord data');
      }
      
      const guildData = await guildRes.json();
      const channelsData = await channelsRes.json();
      
      setDiscordData(guildData);
      setChannels(channelsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'discord' || activeTab === 'alerts' || activeTab === 'permissions') {
      fetchDiscordData();
    }
  }, [activeTab]);

  const intToHex = (color: number) => {
    if (color === 0) return '#99aab5';
    return `#${color.toString(16).padStart(6, '0')}`;
  };

  const handleIdentityUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const payload = {
      bot_name: formData.get('bot_name'),
      prefix: formData.get('prefix'),
      bot_status: formData.get('bot_status'),
      activity_type: formData.get('activity_type'),
      activity_text: formData.get('activity_text'),
      maintenance_mode: formData.get('maintenance_mode') === 'on',
      maintenance_msg: formData.get('maintenance_msg'),
    };
    saveSettings(payload);
  };

  const handlePermissionsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const payload = {
      owner_role_id: formData.get('owner_role_id'),
      admin_role_id: formData.get('admin_role_id'),
      mod_role_id: formData.get('mod_role_id'),
      helper_role_id: formData.get('helper_role_id'),
      auto_role_id: formData.get('auto_role_id'),
      verified_role: formData.get('verified_role'),
    };
    saveSettings(payload);
  };

  const handleModulesUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const payload = {
      raid_shield: formData.get('raid_shield') === 'on',
      ghost_ping_detector: formData.get('ghost_ping_detector') === 'on',
      anti_link: formData.get('anti_link') === 'on',
      anti_invites: formData.get('anti_invites') === 'on',
      welcome_enabled: formData.get('welcome_enabled') === 'on',
      leave_enabled: formData.get('leave_enabled') === 'on',
      shop_active: formData.get('shop_active') === 'on',
      auto_ship: formData.get('auto_ship') === 'on',
    };
    saveSettings(payload);
  };

  const handleAlertsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const payload = {
      log_channel_id: formData.get('log_channel_id'),
      welcome_channel_id: formData.get('welcome_channel_id'),
      leave_channel_id: formData.get('leave_channel_id'),
      suggestion_channel_id: formData.get('suggestion_channel_id'),
      starboard_channel_id: formData.get('starboard_channel_id'),
      transcript_channel_id: formData.get('transcript_channel_id'),
      ticket_landing_id: formData.get('ticket_landing_id'),
      verification_channel: formData.get('verification_channel'),
    };
    saveSettings(payload);
  };

  const Toggle = ({ name, defaultChecked, label }: { name: string, defaultChecked: boolean, label: string }) => (
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          name={name} 
          defaultChecked={defaultChecked} 
          className="sr-only peer" 
        />
        <div className="w-10 h-5 bg-bg-tertiary border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:border-white/10 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-black peer-checked:after:left-[2px]"></div>
      </label>
    </div>
  );

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
                "px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all capitalize whitespace-nowrap shrink-0", 
                activeTab === t ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {(error || success) && (
        <div className={cn(
          "p-4 rounded-xl border flex items-center gap-3",
          error ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-green-500/10 border-green-500/20 text-green-500"
        )}>
          <AlertCircle size={18} />
          <p className="text-xs font-bold uppercase tracking-wider">{error || success}</p>
        </div>
      )}

      {activeTab === 'identity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleIdentityUpdate} className="glass p-8 rounded-2xl border border-border space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-white/5 text-white">
                  <Bot size={20} />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wider">Bot Identity</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Bot Name</label>
                  <input 
                    type="text" 
                    name="bot_name"
                    defaultValue={settings?.bot_name || "Bob The Seller"}
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Command Prefix</label>
                  <input 
                    type="text" 
                    name="prefix"
                    defaultValue={settings?.prefix || "/"}
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Status</label>
                  <select 
                    name="bot_status"
                    defaultValue={settings?.bot_status || "online"}
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 text-text-primary"
                  >
                    <option value="online">Online</option>
                    <option value="idle">Idle</option>
                    <option value="dnd">Do Not Disturb</option>
                    <option value="invisible">Invisible</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Activity Type</label>
                  <select 
                    name="activity_type"
                    defaultValue={settings?.activity_type || "playing"}
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 text-text-primary"
                  >
                    <option value="playing">Playing</option>
                    <option value="watching">Watching</option>
                    <option value="listening">Listening</option>
                    <option value="streaming">Streaming</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Activity Text</label>
                <input 
                  type="text" 
                  name="activity_text"
                  defaultValue={settings?.activity_text || "with your orders | /help"}
                  className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Maintenance Message</label>
                <input 
                  type="text" 
                  name="maintenance_msg"
                  defaultValue={settings?.maintenance_msg || "Bot is currently under maintenance."}
                  className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-text-secondary uppercase tracking-wider">
                  <RefreshCw size={14} className={cn(loading && "animate-spin")} />
                  {loading ? "Syncing..." : "Settings Synced"}
                </div>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-wider hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  {saving ? "Updating..." : "Update Identity"}
                </button>
              </div>
            </form>

            <div className="glass p-8 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/5 text-white">
                    <Power size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider">System Control</h3>
                    <p className="text-xs text-text-secondary">Restart the bot process or clear cache.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-xl bg-bg-tertiary border border-border text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 transition-all">
                    Clear Cache
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-wider hover:bg-white/90 transition-all">
                    Restart Bot
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-border">
              <h3 className="font-bold text-[10px] uppercase tracking-wider text-text-secondary mb-6">Bot Preview</h3>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black">
                      <Bot size={24} />
                    </div>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#0a0a0a]",
                      settings?.bot_status === 'online' ? "bg-green-500" : 
                      settings?.bot_status === 'idle' ? "bg-yellow-500" :
                      settings?.bot_status === 'dnd' ? "bg-red-500" : "bg-gray-500"
                    )}></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-bold text-sm">{settings?.bot_name || "Bob The Seller"}</span>
                      <span className="bg-white/10 text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase border border-white/20">Bot</span>
                    </div>
                    <p className="text-text-secondary text-[10px] uppercase tracking-wider">{settings?.activity_type || "Playing"} <span className="font-bold text-white">{settings?.activity_text || "with your orders | /help"}</span></p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleIdentityUpdate} className="glass p-6 rounded-2xl border border-border space-y-4">
              <h3 className="font-bold text-[10px] uppercase tracking-wider text-text-secondary">Quick Toggles</h3>
              <Toggle name="maintenance_mode" defaultChecked={settings?.maintenance_mode} label="Maintenance Mode" />
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Toggles"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <form onSubmit={handlePermissionsUpdate} className="glass rounded-2xl border border-border overflow-hidden">
            <div className="px-8 py-6 border-b border-border bg-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider">Role Configuration</h3>
                <p className="text-xs text-text-secondary">Map your Discord roles to bot permission levels.</p>
              </div>
              <button 
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-wider hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Permissions"}
              </button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { id: 'owner_role_id', label: 'Owner Role', icon: Shield },
                { id: 'admin_role_id', label: 'Admin Role', icon: Shield },
                { id: 'mod_role_id', label: 'Moderator Role', icon: Shield },
                { id: 'helper_role_id', label: 'Helper Role', icon: Shield },
                { id: 'auto_role_id', label: 'Auto Role (New Members)', icon: Users },
                { id: 'verified_role', label: 'Verified Role', icon: UserCheck },
              ].map((role) => (
                <div key={role.id} className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <role.icon size={14} className="text-text-secondary" />
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{role.label}</label>
                  </div>
                  <select 
                    name={role.id}
                    defaultValue={settings?.[role.id] || ""}
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 text-text-primary"
                  >
                    <option value="">None</option>
                    {discordData?.roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </form>

          <div className="glass rounded-2xl border border-border overflow-hidden">
            <div className="px-8 py-6 border-b border-border bg-white/5">
              <h3 className="font-bold text-sm uppercase tracking-wider">Permissions Matrix</h3>
              <p className="text-xs text-text-secondary">Visual representation of role capabilities.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Module</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">Owner</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">Admin</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">Moderator</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">Helper</th>
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
                          <span className="text-xs font-bold uppercase tracking-wider">{row.name}</span>
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
        </div>
      )}

      {activeTab === 'modules' && (
        <form onSubmit={handleModulesUpdate} className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider">Module Management</h3>
              <p className="text-xs text-text-secondary">Enable or disable core bot features.</p>
            </div>
            <button 
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-wider hover:bg-white/90 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Module Config"}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'raid_shield', name: 'Raid Shield', desc: 'Advanced protection against automated raids.', enabled: settings?.raid_shield },
              { id: 'ghost_ping_detector', name: 'Ghost Ping Detector', desc: 'Detect and log deleted pings.', enabled: settings?.ghost_ping_detector },
              { id: 'anti_link', name: 'Anti-Link', desc: 'Block unauthorized external links.', enabled: settings?.anti_link },
              { id: 'anti_invites', name: 'Anti-Invites', desc: 'Block Discord server invite links.', enabled: settings?.anti_invites },
              { id: 'welcome_enabled', name: 'Welcome System', desc: 'Send automated welcome messages.', enabled: settings?.welcome_enabled },
              { id: 'leave_enabled', name: 'Leave System', desc: 'Track when members leave the server.', enabled: settings?.leave_enabled },
              { id: 'shop_active', name: 'Shop Module', desc: 'Enable digital storefront and automated payments.', enabled: settings?.shop_active },
              { id: 'auto_ship', name: 'Auto-Ship', desc: 'Automatically fulfill orders upon payment.', enabled: settings?.auto_ship },
            ].map((cog) => (
              <div key={cog.id} className="glass p-6 rounded-2xl border border-border space-y-4 relative overflow-hidden group">
                <div className={cn(
                  "absolute top-0 right-0 w-24 h-24 blur-3xl -mr-12 -mt-12 transition-all",
                  cog.enabled ? "bg-white/5 group-hover:bg-white/10" : "bg-bg-tertiary"
                )}></div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm uppercase tracking-wider">{cog.name}</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name={cog.id} 
                      defaultChecked={cog.enabled} 
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-5 bg-bg-tertiary border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:border-white/10 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-black peer-checked:after:left-[2px]"></div>
                  </label>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{cog.desc}</p>
              </div>
            ))}
          </div>
        </form>
      )}

      {activeTab === 'alerts' && (
        <form onSubmit={handleAlertsUpdate} className="glass p-8 rounded-2xl border border-border space-y-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-white">
                <Bell size={20} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wider">Alert Routing</h3>
            </div>
            <button 
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-wider hover:bg-white/90 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Routing"}
            </button>
          </div>

          <div className="space-y-4">
            {[
              { id: 'welcome_channel_id', event: 'Welcome Messages' },
              { id: 'leave_channel_id', event: 'Leave Messages' },
              { id: 'log_channel_id', event: 'Audit Logs' },
              { id: 'suggestion_channel_id', event: 'Suggestions' },
              { id: 'starboard_channel_id', event: 'Starboard' },
              { id: 'transcript_channel_id', event: 'Ticket Transcripts' },
              { id: 'ticket_landing_id', event: 'Ticket Landing' },
              { id: 'verification_channel', event: 'Verification Gate' },
            ].map((route, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-bg-tertiary border border-border group hover:border-white/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-bg-secondary border border-border flex items-center justify-center text-text-secondary">
                    <Zap size={14} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{route.event}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider">Route to:</span>
                  <select 
                    name={route.id}
                    defaultValue={settings?.[route.id] || ""}
                    className="bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-white/50 text-text-primary min-w-[180px]"
                  >
                    <option value="">Disabled</option>
                    {channels.map(c => (
                      <option key={c.id} value={c.id}>#{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </form>
      )}

      {activeTab === 'discord' && (
        <div className="space-y-8">
          {loading ? (
            <div className="glass p-12 rounded-2xl border border-border flex flex-col items-center justify-center gap-4">
              <RefreshCw size={32} className="animate-spin text-white/50" />
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Fetching Discord Data...</p>
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
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-white/90 transition-all"
                >
                  Retry Connection
                </button>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">
                  Ensure DISCORD_TOKEN and MAIN_GUILD are set in your environment.
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
                          <span className="text-xs font-bold uppercase tracking-wider">{discordData.memberCount.toLocaleString()} Members</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-3 rounded-xl glass border border-border hover:bg-white/10 transition-all text-text-secondary hover:text-white">
                      <ExternalLink size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Server Name</p>
                      <p className="text-sm font-bold">{discordData.name}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Total Roles</p>
                      <p className="text-sm font-bold">{discordData.roles.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Verification Level</p>
                      <p className="text-sm font-bold">High</p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl border border-border overflow-hidden">
                  <div className="px-8 py-6 border-b border-border bg-white/5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wider">Server Roles</h3>
                      <p className="text-xs text-text-secondary">A list of all roles available in your Discord server.</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-wider">
                      {discordData.roles.length} Roles
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-white/[0.02]">
                          <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Role Name</th>
                          <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">ID</th>
                          <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-right">Color</th>
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
                  <h3 className="font-bold text-[10px] uppercase tracking-wider text-text-secondary">Integration Status</h3>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                      <span className="text-xs font-bold uppercase tracking-wider">Connected</span>
                    </div>
                    <span className="text-[10px] text-text-secondary font-mono">v10 API</span>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Your bot is currently connected to the Discord API and fetching real-time server metadata.
                  </p>
                </div>

                <div className="glass p-6 rounded-2xl border border-border space-y-4">
                  <h3 className="font-bold text-[10px] uppercase tracking-wider text-text-secondary">Quick Actions</h3>
                  <button className="w-full py-3 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-wider hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                    <RefreshCw size={14} />
                    Sync Metadata
                  </button>
                  <button className="w-full py-3 rounded-xl glass border border-border text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <Hash size={14} />
                    View Channels
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass p-12 rounded-2xl border border-border flex flex-col items-center justify-center gap-4">
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">No Discord data available.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
