import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Shield, 
  Ban, 
  MessageSquare, 
  Clock,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  X,
  Calendar,
  ShieldAlert,
  Activity,
  User,
  RefreshCw,
  AlertCircle,
  Zap,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { UserBackgroundModal } from './UserBackgroundModal';

interface DiscordRole {
  id: string;
  name: string;
  color: number;
}

interface Member {
  id: string;
  username: string;
  avatar: string | null;
  joinDate: string;
  premiumSince: string | null;
  roles: DiscordRole[];
  status: string;
  nickname: string | null;
  isBot: boolean;
  // Mock data for fields not in Discord API
  messages?: number;
  modHistory?: number;
  bio?: string;
  location?: string;
  lastSeen?: string;
}

const RoleBadge: React.FC<{ role: DiscordRole }> = ({ role }) => {
  const intToHex = (color: number) => {
    if (color === 0) return '#99aab5';
    return `#${color.toString(16).padStart(6, '0')}`;
  };

  return (
    <span 
      className="px-2 py-0.5 rounded-sm text-[9px] font-bold border uppercase tracking-tighter bg-white/5 font-mono"
      style={{ color: intToHex(role.color), borderColor: `${intToHex(role.color)}44` }}
    >
      {role.name}
    </span>
  );
};

export const MembersMatrix = () => {
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/discord/members');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch members');
      }
      const data = await response.json();
      // Add some mock data for the fields not in Discord API
      const enrichedData = data.map((m: any) => ({
        ...m,
        messages: Math.floor(Math.random() * 2000),
        modHistory: Math.floor(Math.random() * 3),
        bio: m.isBot ? 'I am a helpful bot.' : 'A valued member of the community.',
        location: 'Global',
        lastSeen: 'Online'
      }));
      setMembers(enrichedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    m.username.toLowerCase().includes(search.toLowerCase()) || 
    m.id.includes(search) ||
    (m.nickname && m.nickname.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-2xl glass border border-white/10 rounded-xl overflow-hidden shadow-2xl neo-border"
            >
              <div className="h-24 bg-gradient-to-b from-white/5 to-transparent relative border-b border-white/5">
                <div className="absolute inset-0 scanline opacity-20"></div>
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-md glass border border-white/10 hover:bg-white/10 transition-all z-10 group"
                >
                  <X size={16} className="text-text-secondary group-hover:text-white" />
                </button>
              </div>
              
              <div className="px-8 pb-8 -mt-10 relative">
                <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-8">
                  <div className="w-24 h-24 rounded-xl bg-bg-tertiary border border-white/20 overflow-hidden shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-white/80">View Profile</span>
                    </div>
                    <img 
                      src={selectedMember.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.username}`} 
                      alt={selectedMember.username} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold tracking-tighter uppercase italic">
                        {selectedMember.nickname || selectedMember.username.split('#')[0]}
                      </h2>
                      {selectedMember.isBot && (
                        <span className="bg-blue-500/20 text-blue-400 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase border border-blue-500/30 font-mono">System Bot</span>
                      )}
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        selectedMember.status === 'online' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
                        selectedMember.status === 'idle' ? "bg-yellow-500/50" : "bg-white/10"
                      )}></div>
                    </div>
                    <p className="text-text-secondary font-mono text-[10px] tracking-wider uppercase opacity-60">Matrix ID: {selectedMember.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary mb-3 flex items-center gap-2">
                        <User size={10} className="text-blue-400" />
                        Personnel Dossier
                      </h3>
                      <p className="text-xs leading-relaxed text-white/70 font-medium italic border-l-2 border-white/10 pl-4">
                        {selectedMember.bio}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary flex items-center gap-2">
                        <Shield size={10} className="text-purple-400" />
                        Clearance Levels
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMember.roles.map(role => <RoleBadge key={role.id} role={role} />)}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-3 text-text-secondary group">
                        <Calendar size={12} className="text-white/20 group-hover:text-white/40 transition-colors" />
                        <span className="text-[10px] font-mono uppercase tracking-wider">Enlisted: <span className="text-white/80">{format(new Date(selectedMember.joinDate), 'yyyy.MM.dd')}</span></span>
                      </div>
                      {selectedMember.premiumSince && (
                        <div className="flex items-center gap-3 text-text-secondary group">
                          <Zap size={12} className="text-yellow-400/40 group-hover:text-yellow-400/60 transition-colors" />
                          <span className="text-[10px] font-mono uppercase tracking-wider">Booster: <span className="text-yellow-400/80">{format(new Date(selectedMember.premiumSince), 'yyyy.MM.dd')}</span></span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-text-secondary group">
                        <Clock size={12} className="text-white/20 group-hover:text-white/40 transition-colors" />
                        <span className="text-[10px] font-mono uppercase tracking-wider">Last Sync: <span className="text-white/80">{selectedMember.lastSeen}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-xl border border-white/10 p-5 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Activity size={40} />
                      </div>
                      <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary">Operational Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold uppercase tracking-wider text-text-secondary">Comm Volume</p>
                          <p className="text-xl font-bold font-mono tracking-tighter">{(selectedMember.messages || 0).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold uppercase tracking-wider text-text-secondary">Infractions</p>
                          <p className={cn(
                            "text-xl font-bold font-mono tracking-tighter",
                            (selectedMember.modHistory || 0) > 0 ? "text-red-400" : "text-text-secondary"
                          )}>{selectedMember.modHistory || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button className="w-full py-2.5 rounded-lg bg-white text-black font-bold text-[10px] uppercase tracking-wider hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        <MessageSquare size={14} />
                        Establish Comms
                      </button>
                      <button 
                        onClick={() => setIsBackgroundModalOpen(true)}
                        className="w-full py-2.5 rounded-lg glass border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        <Database size={14} className="text-blue-400" />
                        Deep Scan Background
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <UserBackgroundModal 
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        userId={selectedMember?.id || ''}
        username={selectedMember?.username || ''}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic">Members Matrix</h1>
          <p className="text-text-secondary text-xs font-mono tracking-wider uppercase opacity-60">Personnel Database & Community Intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-bold text-[10px] uppercase tracking-wider hover:bg-white/90 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <UserPlus size={16} />
            Invite Personnel
          </button>
          <button className="p-2 rounded-lg glass border border-white/10 hover:bg-white/10 text-text-secondary transition-all">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-white transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="SEARCH BY USERNAME OR ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-[10px] font-mono tracking-wider uppercase focus:outline-none focus:border-white/30 transition-all placeholder:text-white/20"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg glass border border-white/10 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all">
          <Filter size={16} />
          Filters
        </button>
        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg glass border border-white/10 text-[10px] font-mono uppercase tracking-wider">
          <span className="text-text-secondary">Active: <span className="text-white">8</span> / 12,482</span>
        </div>
      </div>

      <div className="glass rounded-xl border border-white/10 overflow-hidden neo-border">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <RefreshCw size={24} className="animate-spin text-white/30" />
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-text-secondary">Syncing Matrix Data...</p>
            </div>
          ) : error ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
              <AlertCircle size={24} className="text-red-400" />
              <p className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">{error}</p>
              <button onClick={fetchMembers} className="px-6 py-2 rounded-lg bg-white text-black font-bold text-[10px] uppercase tracking-wider">Retry Sync</button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary">Personnel</th>
                  <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary">Status</th>
                  <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary">Enlisted</th>
                  <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary">Clearance</th>
                  <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary">Activity</th>
                  <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.map((member) => (
                  <tr 
                    key={member.id} 
                    onClick={() => setSelectedMember(member)}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-bg-tertiary border border-white/10 overflow-hidden relative">
                          <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-bold group-hover:text-white transition-colors uppercase tracking-tight">
                            {member.nickname || member.username.split('#')[0]}
                          </p>
                          <p className="text-[8px] text-text-secondary font-mono uppercase tracking-wider opacity-60">ID: {member.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          member.status === 'online' ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" : 
                          member.status === 'idle' ? "bg-yellow-500/50" : "bg-white/10"
                        )}></div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">{member.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Clock size={12} className="opacity-40" />
                        <span className="text-[10px] font-mono">{format(new Date(member.joinDate), 'yyyy.MM.dd')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.roles.slice(0, 2).map(role => <RoleBadge key={role.id} role={role} />)}
                        {member.roles.length > 2 && (
                          <span className="text-[8px] text-text-secondary font-bold font-mono">+{member.roles.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <MessageSquare size={12} className="opacity-40" />
                          <span className="text-[10px] font-mono">{member.messages}</span>
                        </div>
                        {(member.modHistory || 0) > 0 && (
                          <div className="flex items-center gap-1.5 text-red-400/80">
                            <Shield size={12} />
                            <span className="text-[10px] font-mono">{member.modHistory}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button title="Moderate" className="p-1.5 rounded-md hover:bg-white/10 text-text-secondary hover:text-white transition-all">
                          <Ban size={14} />
                        </button>
                        <button title="More" className="p-1.5 rounded-md hover:bg-white/10 text-text-secondary hover:text-white transition-all">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-3 bg-white/[0.02] flex items-center justify-between border-t border-white/10">
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-md glass border border-white/10 hover:bg-white/10 disabled:opacity-30" disabled>
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3, '...', 12].map((p, i) => (
                <button 
                  key={i} 
                  className={cn(
                    "w-7 h-7 rounded-md text-[9px] font-bold transition-all uppercase tracking-wider",
                    p === 1 ? "bg-white text-black" : "hover:bg-white/10 text-text-secondary"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <button className="p-1.5 rounded-md glass border border-white/10 hover:bg-white/10">
              <ChevronRight size={14} />
            </button>
          </div>
          <p className="text-[9px] font-mono text-text-secondary uppercase tracking-[0.2em]">Matrix Page 01 // 1560</p>
        </div>
      </div>
    </div>
  );
};
