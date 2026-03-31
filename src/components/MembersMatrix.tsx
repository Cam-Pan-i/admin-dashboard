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
      className="px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider bg-white/5"
      style={{ color: intToHex(role.color), borderColor: `${intToHex(role.color)}33` }}
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass border border-border rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="h-32 bg-gradient-to-r from-white/10 to-transparent relative">
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 p-2 rounded-full glass border border-border hover:bg-white/10 transition-all z-10"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="px-8 pb-8 -mt-12 relative">
                <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-bg-tertiary border-4 border-black overflow-hidden shadow-xl">
                    <img 
                      src={selectedMember.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.username}`} 
                      alt={selectedMember.username} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-3xl font-bold tracking-tight">
                        {selectedMember.nickname || selectedMember.username.split('#')[0]}
                      </h2>
                      {selectedMember.isBot && (
                        <span className="bg-white/10 text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase border border-white/20">Bot</span>
                      )}
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        selectedMember.status === 'online' ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : 
                        selectedMember.status === 'idle' ? "bg-white/50" : "bg-white/20"
                      )}></div>
                    </div>
                    <p className="text-text-secondary font-mono text-sm">ID: {selectedMember.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-3">About</h3>
                      <p className="text-sm leading-relaxed text-white/90">
                        {selectedMember.bio}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedMember.roles.map(role => <RoleBadge key={role.id} role={role} />)}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-text-secondary">
                        <Calendar size={16} className="text-white/40" />
                        <span className="text-xs">Joined <span className="text-white">{format(new Date(selectedMember.joinDate), 'PPP')}</span></span>
                      </div>
                      {selectedMember.premiumSince && (
                        <div className="flex items-center gap-3 text-text-secondary">
                          <Zap size={16} className="text-white/40" />
                          <span className="text-xs">Boosting since <span className="text-white">{format(new Date(selectedMember.premiumSince), 'PPP')}</span></span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-text-secondary">
                        <Clock size={16} className="text-white/40" />
                        <span className="text-xs">Last seen <span className="text-white">{selectedMember.lastSeen}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="glass rounded-2xl border border-border p-5 space-y-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Statistics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-text-secondary">
                            <Activity size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Messages</span>
                          </div>
                          <p className="text-2xl font-bold">{(selectedMember.messages || 0).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-text-secondary">
                            <ShieldAlert size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Mod History</span>
                          </div>
                          <p className={cn(
                            "text-2xl font-bold",
                            (selectedMember.modHistory || 0) > 0 ? "text-white" : "text-text-secondary"
                          )}>{selectedMember.modHistory || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                        <MessageSquare size={18} />
                        Send Message
                      </button>
                      <button 
                        onClick={() => setIsBackgroundModalOpen(true)}
                        className="w-full py-3 rounded-xl glass border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        <Database size={18} className="text-blue-400" />
                        User Background
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
          <h1 className="text-4xl font-bold tracking-tight">Members Matrix</h1>
          <p className="text-text-secondary">Manage and monitor your community members with precision.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all">
            <UserPlus size={18} />
            Invite Member
          </button>
          <button className="p-2 rounded-xl glass border border-border hover:bg-white/10 text-text-secondary transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input 
            type="text" 
            placeholder="Search by username or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass border border-border text-sm font-medium hover:bg-white/10 transition-all">
          <Filter size={18} />
          Filters
        </button>
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl glass border border-border text-sm">
          <span className="text-text-secondary">Showing 8 of 12,482</span>
        </div>
      </div>

      <div className="glass rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <RefreshCw size={32} className="animate-spin text-white/50" />
              <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Syncing with Discord...</p>
            </div>
          ) : error ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
              <AlertCircle size={32} className="text-destructive" />
              <p className="text-sm text-text-secondary">{error}</p>
              <button onClick={fetchMembers} className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest">Retry</button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Member</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Join Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Roles</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Activity</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((member) => (
                  <tr 
                    key={member.id} 
                    onClick={() => setSelectedMember(member)}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-bg-tertiary border border-border overflow-hidden">
                          <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} alt="" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="text-sm font-bold group-hover:text-white transition-colors">
                            {member.nickname || member.username.split('#')[0]}
                          </p>
                          <p className="text-[10px] text-text-secondary font-mono">ID: {member.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          member.status === 'online' ? "bg-white" : 
                          member.status === 'idle' ? "bg-white/50" : "bg-white/20"
                        )}></div>
                        <span className="text-xs capitalize text-text-secondary">{member.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Clock size={14} />
                        <span className="text-xs">{format(new Date(member.joinDate), 'MMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.roles.slice(0, 2).map(role => <RoleBadge key={role.id} role={role} />)}
                        {member.roles.length > 2 && (
                          <span className="text-[10px] text-text-secondary font-bold">+{member.roles.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-text-secondary">
                          <MessageSquare size={14} />
                          <span className="text-xs">{member.messages}</span>
                        </div>
                        {(member.modHistory || 0) > 0 && (
                          <div className="flex items-center gap-1 text-white">
                            <Shield size={14} />
                            <span className="text-xs">{member.modHistory}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button title="Moderate" className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-all">
                          <Ban size={16} />
                        </button>
                        <button title="More" className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-all">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 bg-white/5 flex items-center justify-between border-t border-border">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg glass border border-border hover:bg-white/10 disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3, '...', 12].map((p, i) => (
                <button 
                  key={i} 
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                    p === 1 ? "bg-white text-black" : "hover:bg-white/10 text-text-secondary"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <button className="p-2 rounded-lg glass border border-border hover:bg-white/10">
              <ChevronRight size={16} />
            </button>
          </div>
          <p className="text-xs text-text-secondary">Page 1 of 1,560</p>
        </div>
      </div>
    </div>
  );
};
