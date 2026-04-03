import React, { useState, useEffect } from 'react';
import { 
  Settings, 
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
  ExternalLink,
  Ticket,
  CheckCircle2,
  ClipboardList,
  ShoppingBag,
  Calendar,
  ZapOff,
  Activity,
  Server,
  Trash2,
  Save,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { supabase, safeFetch } from '../lib/supabase';

type Section = 
  | 'general' 
  | 'moderation' 
  | 'tickets' 
  | 'verification' 
  | 'logging' 
  | 'shop' 
  | 'attendance' 
  | 'automation' 
  | 'community' 
  | 'presence' 
  | 'infrastructure' 
  | 'danger';

interface DiscordRole {
  id: string;
  name: string;
  color: number;
}

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

export const ServerConfig = () => {
  const [activeSection, setActiveSection] = useState<Section>('general');
  const [settings, setSettings] = useState<any>(null);
  const [roles, setRoles] = useState<DiscordRole[]>([]);
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [settingsData, guildData, channelsData] = await Promise.all([
        safeFetch(supabase.from('bot_settings').select('*').eq('id', 'global').single(), null, 'Fetch bot settings'),
        safeFetch(supabase.from('guild_info').select('roles').single(), { roles: [] }, 'Fetch roles'),
        safeFetch(supabase.from('channels').select('*'), [], 'Fetch channels')
      ]);

      if (settingsData) {
        setSettings(settingsData);
      } else {
        // Fallback or initial state
        setSettings({
          id: 'global',
          bot_name: 'Bob Admin',
          prefix: '!',
          language: 'en',
          timezone: 'UTC',
          auto_mod: true,
          mod_level: 'medium',
          leveling_enabled: true,
          status: 'online',
          activity_type: 'playing'
        });
      }
      setRoles(guildData?.roles || []);
      setChannels(channelsData);
    } catch (err) {
      console.error('Error fetching config data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const updates: any = {};
    
    formData.forEach((value, key) => {
      if (value === 'on') updates[key] = true;
      else if (value === 'off') updates[key] = false;
      else updates[key] = value;
    });

    // Handle checkboxes that are not in formData when unchecked
    const checkboxes = e.currentTarget.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((cb: any) => {
      if (!formData.has(cb.name)) {
        updates[cb.name] = false;
      }
    });

    try {
      const { error: updateError } = await supabase
        .from('bot_settings')
        .update(updates)
        .eq('id', 'global');

      if (updateError) throw updateError;
      
      setSuccess('Settings saved successfully');
      setSettings({ ...settings, ...updates });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const triggerSignal = async (signal: string) => {
    if (!window.confirm(`Are you sure you want to trigger ${signal}?`)) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('bot_settings')
        .update({ [signal]: true })
        .eq('id', 'global');
      
      if (error) throw error;
      setSuccess(`${signal} triggered`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const sections: { id: Section; label: string; icon: any }[] = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'moderation', label: 'Moderation', icon: Shield },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'verification', label: 'Verification', icon: UserCheck },
    { id: 'logging', label: 'Logging', icon: ClipboardList },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'presence', label: 'Presence', icon: Activity },
    { id: 'infrastructure', label: 'Infrastructure', icon: Server },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 shrink-0 space-y-1">
        <div className="mb-6 px-4">
          <h1 className="text-2xl font-bold tracking-tight uppercase italic">Settings</h1>
          <p className="text-[10px] text-text-secondary font-mono tracking-widest uppercase opacity-60">Configuration Matrix</p>
        </div>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold transition-all border",
              activeSection === section.id 
                ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                : "text-text-secondary border-transparent hover:bg-white/5 hover:text-white"
            )}
          >
            <section.icon size={16} />
            {section.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 space-y-6">
        {(error || success) && (
          <div className={cn(
            "p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2",
            error ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-green-500/10 border-green-500/20 text-green-500"
          )}>
            <AlertCircle size={18} />
            <p className="text-[10px] font-bold uppercase tracking-wider">{error || success}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="glass p-8 rounded-2xl border border-white/10 neo-border relative overflow-hidden">
          <div className="absolute inset-0 scanline opacity-5 pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-8 relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-white border border-white/10">
                {sections.find(s => s.id === activeSection)?.icon({ size: 20 })}
              </div>
              <h2 className="text-xl font-bold uppercase tracking-wider italic">
                {sections.find(s => s.id === activeSection)?.label} Configuration
              </h2>
            </div>
            {activeSection !== 'danger' && (
              <button 
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-white text-black font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>

          <div className="space-y-8 relative">
            {activeSection === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Bot Name</label>
                  <input name="bot_name" defaultValue={settings?.bot_name} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Command Prefix</label>
                  <input name="prefix" defaultValue={settings?.prefix} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Language</label>
                  <select name="language" defaultValue={settings?.language} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Timezone</label>
                  <input name="timezone" defaultValue={settings?.timezone} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono" />
                </div>
              </div>
            )}

            {activeSection === 'moderation' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider">Auto-Moderation</h4>
                    <p className="text-[9px] text-text-secondary uppercase tracking-wider opacity-60">Enable automated enforcement protocols</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="auto_mod" defaultChecked={settings?.auto_mod} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Moderation Level</label>
                    <select name="mod_level" defaultValue={settings?.mod_level} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                      <option value="low">Low (Passive)</option>
                      <option value="medium">Medium (Standard)</option>
                      <option value="high">High (Strict)</option>
                      <option value="extreme">Extreme (Lockdown)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Logging Channel</label>
                    <select name="mod_logging_channel" defaultValue={settings?.mod_logging_channel} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                      <option value="">Select Channel</option>
                      {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'tickets' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Ticket Category ID</label>
                  <input name="ticket_category" defaultValue={settings?.ticket_category} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Support Role</label>
                  <select name="support_role" defaultValue={settings?.support_role} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                    <option value="">Select Role</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Transcript Channel</label>
                  <select name="ticket_transcript_channel" defaultValue={settings?.ticket_transcript_channel} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                    <option value="">Select Channel</option>
                    {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {activeSection === 'verification' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Verification Type</label>
                    <select name="verification_type" defaultValue={settings?.verification_type} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                      <option value="button">Button Click</option>
                      <option value="captcha">CAPTCHA</option>
                      <option value="code">Secret Code</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Verified Role</label>
                    <select name="verified_role" defaultValue={settings?.verified_role} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                      <option value="">Select Role</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Verification Channel</label>
                    <select name="verification_channel" defaultValue={settings?.verification_channel} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                      <option value="">Select Channel</option>
                      {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'logging' && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Main Log Channel</label>
                  <select name="log_channel" defaultValue={settings?.log_channel} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                    <option value="">Select Channel</option>
                    {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Monitored Events</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Message Delete', 'Message Edit', 'Member Join', 'Member Leave', 'Role Update', 'Voice State'].map(event => (
                      <div key={event} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <input type="checkbox" className="w-4 h-4 rounded bg-white/10 border-white/20 checked:bg-white" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'shop' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Currency</label>
                  <input name="shop_currency" defaultValue={settings?.shop_currency} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Tax Rate (%)</label>
                  <input name="shop_tax_rate" type="number" step="0.01" defaultValue={settings?.shop_tax_rate} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Customer Role</label>
                  <select name="shop_role" defaultValue={settings?.shop_role} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                    <option value="">Select Role</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {activeSection === 'attendance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Attendance Channel</label>
                  <select name="attendance_channel" defaultValue={settings?.attendance_channel} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                    <option value="">Select Channel</option>
                    {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Staff Role</label>
                  <select name="attendance_role" defaultValue={settings?.attendance_role} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                    <option value="">Select Role</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {activeSection === 'automation' && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Welcome Message</label>
                  <textarea name="welcome_message" defaultValue={settings?.welcome_message} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono h-32 resize-none" placeholder="Welcome {user} to {server}!" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Leave Message</label>
                  <textarea name="leave_message" defaultValue={settings?.leave_message} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono h-32 resize-none" placeholder="{user} has left the server." />
                </div>
              </div>
            )}

            {activeSection === 'community' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider">Leveling System</h4>
                    <p className="text-[9px] text-text-secondary uppercase tracking-wider opacity-60">Enable XP and ranking mechanics</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="leveling_enabled" defaultChecked={settings?.leveling_enabled} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">XP Multiplier</label>
                  <input name="xp_rate" type="number" step="0.1" defaultValue={settings?.xp_rate || 1.0} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono" />
                </div>
              </div>
            )}

            {activeSection === 'presence' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Status</label>
                  <select name="status" defaultValue={settings?.status} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                    <option value="online">Online</option>
                    <option value="idle">Idle</option>
                    <option value="dnd">Do Not Disturb</option>
                    <option value="invisible">Invisible</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Activity Type</label>
                  <select name="activity_type" defaultValue={settings?.activity_type} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono appearance-none">
                    <option value="playing">Playing</option>
                    <option value="watching">Watching</option>
                    <option value="listening">Listening</option>
                    <option value="streaming">Streaming</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Activity Name</label>
                  <input name="activity_name" defaultValue={settings?.activity_name} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono" />
                </div>
              </div>
            )}

            {activeSection === 'infrastructure' && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">External API Key</label>
                  <div className="relative">
                    <input name="api_key" type="password" defaultValue={settings?.api_key} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono pr-12" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                      <Lock size={14} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Webhook URL</label>
                  <input name="webhook_url" defaultValue={settings?.webhook_url} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/30 transition-all font-mono" />
                </div>
              </div>
            )}

            {activeSection === 'danger' && (
              <div className="space-y-8">
                <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20 space-y-6">
                  <div className="flex items-center gap-3 text-red-500">
                    <AlertCircle size={20} />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest">Critical Systems Control</h3>
                  </div>
                  <p className="text-[9px] text-text-secondary uppercase tracking-wider leading-relaxed">
                    Warning: These actions directly impact the bot's runtime state. Use with extreme caution.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => triggerSignal('restart_signal')}
                      className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/90 transition-all"
                    >
                      <RefreshCw size={16} />
                      Restart Bot
                    </button>
                    <button 
                      type="button"
                      onClick={() => triggerSignal('stop_signal')}
                      className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-red-500 text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 transition-all"
                    >
                      <Power size={16} />
                      Stop Process
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6">
                  <div className="flex items-center gap-3 text-white">
                    <Trash2 size={20} />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest">Data Maintenance</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      type="button"
                      onClick={() => triggerSignal('purge_shop_signal')}
                      className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-white/10 text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
                    >
                      <ZapOff size={16} />
                      Purge Shop Cache
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
