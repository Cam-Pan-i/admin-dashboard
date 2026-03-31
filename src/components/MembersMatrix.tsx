import React, { useState } from 'react';
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
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const members = [
  { 
    id: '1', 
    username: 'Kaka#0001', 
    joinDate: '2024-03-15', 
    status: 'online', 
    roles: ['Owner', 'Admin'], 
    messages: 1240, 
    modHistory: 0,
    bio: 'The creator of this community. Always here to help!',
    location: 'San Francisco, CA',
    lastSeen: 'Just now'
  },
  { 
    id: '2', 
    username: 'Bob#1234', 
    joinDate: '2024-03-16', 
    status: 'idle', 
    roles: ['Moderator'], 
    messages: 850, 
    modHistory: 2,
    bio: 'Keeping the peace since 2024.',
    location: 'London, UK',
    lastSeen: '5 mins ago'
  },
  { 
    id: '3', 
    username: 'Alice#5678', 
    joinDate: '2024-03-18', 
    status: 'offline', 
    roles: ['Verified'], 
    messages: 320, 
    modHistory: 0,
    bio: 'Loves coding and coffee.',
    location: 'Berlin, DE',
    lastSeen: '2 hours ago'
  },
  { 
    id: '4', 
    username: 'Charlie#9999', 
    joinDate: '2024-03-20', 
    status: 'online', 
    roles: ['Verified'], 
    messages: 150, 
    modHistory: 1,
    bio: 'Just here for the memes.',
    location: 'New York, NY',
    lastSeen: 'Online'
  },
  { 
    id: '5', 
    username: 'David#1111', 
    joinDate: '2024-03-21', 
    status: 'online', 
    roles: ['New Member'], 
    messages: 12, 
    modHistory: 0,
    bio: 'Excited to be here!',
    location: 'Toronto, CA',
    lastSeen: 'Online'
  },
  { 
    id: '6', 
    username: 'Eve#2222', 
    joinDate: '2024-03-22', 
    status: 'offline', 
    roles: ['Verified'], 
    messages: 45, 
    modHistory: 0,
    bio: 'Digital artist and explorer.',
    location: 'Paris, FR',
    lastSeen: '1 day ago'
  },
  { 
    id: '7', 
    username: 'Frank#3333', 
    joinDate: '2024-03-23', 
    status: 'idle', 
    roles: ['Verified'], 
    messages: 89, 
    modHistory: 0,
    bio: 'Gamer and tech enthusiast.',
    location: 'Tokyo, JP',
    lastSeen: '30 mins ago'
  },
  { 
    id: '8', 
    username: 'Grace#4444', 
    joinDate: '2024-03-24', 
    status: 'online', 
    roles: ['Verified'], 
    messages: 210, 
    modHistory: 0,
    bio: 'Community builder.',
    location: 'Sydney, AU',
    lastSeen: 'Online'
  },
];

type Member = typeof members[0];

const RoleBadge = ({ role }: { role: string, key?: string }) => {
  const colors: Record<string, string> = {
    'Owner': 'bg-white/10 text-white border-white/20',
    'Admin': 'bg-white/5 text-text-secondary border-white/10',
    'Moderator': 'bg-white/5 text-text-secondary border-white/10',
    'Verified': 'bg-white/5 text-text-secondary border-white/10',
    'New Member': 'bg-white/5 text-text-secondary border-white/10',
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider",
      colors[role] || colors['New Member']
    )}>
      {role}
    </span>
  );
};

export const MembersMatrix = () => {
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

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
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.username}`} 
                      alt={selectedMember.username} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-3xl font-bold tracking-tight">{selectedMember.username}</h2>
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        selectedMember.status === 'online' ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : 
                        selectedMember.status === 'idle' ? "bg-white/50" : "bg-white/20"
                      )}></div>
                    </div>
                    <p className="text-text-secondary font-mono text-sm">ID: {selectedMember.id}8293471029384</p>
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
                      {selectedMember.roles.map(role => <RoleBadge key={role} role={role} />)}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-text-secondary">
                        <Calendar size={16} className="text-white/40" />
                        <span className="text-xs">Joined <span className="text-white">{selectedMember.joinDate}</span></span>
                      </div>
                      <div className="flex items-center gap-3 text-text-secondary">
                        <Clock size={16} className="text-white/40" />
                        <span className="text-xs">Last seen <span className="text-white">{selectedMember.lastSeen}</span></span>
                      </div>
                      <div className="flex items-center gap-3 text-text-secondary">
                        <User size={16} className="text-white/40" />
                        <span className="text-xs">Location <span className="text-white">{selectedMember.location}</span></span>
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
                          <p className="text-2xl font-bold">{selectedMember.messages.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-text-secondary">
                            <ShieldAlert size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Mod History</span>
                          </div>
                          <p className={cn(
                            "text-2xl font-bold",
                            selectedMember.modHistory > 0 ? "text-white" : "text-text-secondary"
                          )}>{selectedMember.modHistory}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                        <MessageSquare size={18} />
                        Send Message
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="py-3 rounded-xl glass border border-border text-sm font-bold hover:bg-white/10 transition-all">
                          Edit Profile
                        </button>
                        <button className="py-3 rounded-xl glass border border-destructive/20 text-destructive text-sm font-bold hover:bg-destructive/10 transition-all">
                          Ban User
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
              {members.map((member) => (
                <tr 
                  key={member.id} 
                  onClick={() => setSelectedMember(member)}
                  className="hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-bg-tertiary border border-border overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} alt="" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="text-sm font-bold group-hover:text-white transition-colors">{member.username}</p>
                        <p className="text-[10px] text-text-secondary font-mono">ID: {member.id}8293...</p>
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
                      <span className="text-xs">{member.joinDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {member.roles.map(role => <RoleBadge key={role} role={role} />)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-text-secondary">
                        <MessageSquare size={14} />
                        <span className="text-xs">{member.messages}</span>
                      </div>
                      {member.modHistory > 0 && (
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
