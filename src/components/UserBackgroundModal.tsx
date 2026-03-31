import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, Shield, Mail, Info, ExternalLink, Database } from 'lucide-react';

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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Database size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">User Background</h2>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Cross-Server Intelligence</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-all text-text-secondary hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* User Identity Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-text-secondary">
                  <Mail size={16} className="text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Primary Email</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-sm font-medium">{mockData.email}</span>
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold uppercase">Verified</span>
                </div>
              </div>

              {/* Servers & Roles Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-text-secondary">
                  <Server size={16} className="text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Server Footprint ({mockData.servers.length})</span>
                </div>
                <div className="space-y-3">
                  {mockData.servers.map((server) => (
                    <div key={server.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{server.name}</span>
                        <ExternalLink size={14} className="text-text-secondary" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {server.roles.map((role) => (
                          <span key={role} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                            <Shield size={10} />
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intelligence Summary */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-text-secondary">
                  <Info size={16} className="text-yellow-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Intelligence Summary</span>
                </div>
                <div className="p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/20">
                  <p className="text-sm text-yellow-200/80 leading-relaxed italic">
                    "{mockData.additionalInfo}"
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Last Sync: {mockData.lastUpdated}</span>
                <button className="text-[10px] text-blue-400 font-bold uppercase tracking-widest hover:underline">Request Deep Scan</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
