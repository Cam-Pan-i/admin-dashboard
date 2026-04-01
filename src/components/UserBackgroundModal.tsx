import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, Shield, Mail, Info, ExternalLink, Database, RefreshCw } from 'lucide-react';

interface UserBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
}

/**
 * UserBackgroundModal - Placeholder for detailed user background info.
 * 
 * NEXT AI INSTRUCTIONS:
 * 1. Connect this component to the backend database.
 * 2. Fetch the user's cross-server data (servers they are in, roles, etc.).
 * 3. The bot already has access to this data; you need to query the 'user_background' or similar table.
 * 4. Replace the mock data below with real data from the database.
 * 5. Ensure proper error handling if the user data is not found.
 */
export const UserBackgroundModal: React.FC<UserBackgroundModalProps> = ({ isOpen, onClose, userId, username }) => {
  // Mock data - to be replaced by the next AI with real database fetching logic
  const mockData = {
    email: "user@example.com",
    servers: [
      { id: "1", name: "Official Support", roles: ["Moderator", "Verified"] },
      { id: "2", name: "Community Hub", roles: ["Member", "Active"] },
      { id: "3", name: "Dev Testing", roles: ["Developer"] },
    ],
    additionalInfo: "User has been active across 5 different monitored servers. No previous bans recorded in the global matrix.",
    lastUpdated: "2026-03-31"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative w-full max-w-lg glass border border-white/10 rounded-xl overflow-hidden shadow-2xl neo-border"
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative">
              <div className="absolute inset-0 scanline opacity-10"></div>
              <div className="flex items-center gap-3 relative">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Database size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tighter uppercase italic">User Background</h2>
                  <p className="text-[8px] text-text-secondary uppercase tracking-[0.2em] font-bold opacity-60">Cross-Server Intelligence // Matrix Scan</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-white/10 transition-all text-text-secondary hover:text-white group"
              >
                <X size={16} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* User Identity Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Mail size={12} className="text-blue-400/60" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Primary Identification</span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                  <span className="text-xs font-mono tracking-tight text-white/80">{mockData.email}</span>
                  <span className="text-[8px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-sm font-bold uppercase border border-green-500/20">Verified</span>
                </div>
              </div>

              {/* Servers & Roles Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Server size={12} className="text-purple-400/60" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Server Footprint [{mockData.servers.length}]</span>
                </div>
                <div className="space-y-2">
                  {mockData.servers.map((server) => (
                    <div key={server.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 group hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-tight group-hover:text-white transition-colors">{server.name}</span>
                        <ExternalLink size={12} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {server.roles.map((role) => (
                          <span key={role} className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-white/5 border border-white/5 text-[8px] font-bold uppercase tracking-tighter text-text-secondary font-mono">
                            <Shield size={8} />
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intelligence Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Info size={12} className="text-yellow-400/60" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Intelligence Summary</span>
                </div>
                <div className="p-4 rounded-xl bg-yellow-500/[0.02] border border-yellow-500/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/20"></div>
                  <p className="text-xs text-yellow-200/60 leading-relaxed italic font-medium">
                    "{mockData.additionalInfo}"
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[8px] text-text-secondary uppercase font-bold tracking-[0.2em]">Last Sync: {mockData.lastUpdated}</span>
                <button className="text-[9px] text-blue-400 font-bold uppercase tracking-wider hover:text-blue-300 transition-colors flex items-center gap-1.5">
                  <RefreshCw size={10} />
                  Request Deep Scan
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
