import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  ShieldCheck, 
  Package, 
  Shield, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

const navItems = [
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
  { id: 'members', label: 'Members Matrix', icon: Users },
  { id: 'tickets', label: 'Ticket Control', icon: Ticket },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'shop', label: 'Stock & Shop', icon: Package },
  { id: 'moderation', label: 'Mod Suite', icon: Shield },
  { id: 'analytics', label: 'Analytics Lab', icon: BarChart3 },
  { id: 'ai', label: 'AI Assistant', icon: Sparkles },
  { id: 'config', label: 'Server Config', icon: Settings },
];

export const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (id: string) => void }) => {
  const { isSidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { user, role } = useAuthStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarCollapsed ? 80 : 260 }}
      className="h-screen bg-bg-secondary border-r border-border flex flex-col relative z-50"
    >
      <div className="p-6 flex items-center gap-3 overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <Bot className="text-black w-6 h-6" />
        </div>
        {!isSidebarCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-xl tracking-tight whitespace-nowrap"
          >
            BOB <span className="text-text-secondary font-light">ADMIN</span>
          </motion.span>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
              activeTab === item.id 
                ? "bg-white/10 text-white" 
                : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", activeTab === item.id ? "text-white" : "group-hover:text-text-primary")} />
            {!isSidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-sm"
              >
                {item.label}
              </motion.span>
            )}
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-pill"
                className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
              />
            )}
          </button>
        ))}
      </nav>

      <button
        onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-white transition-colors"
      >
        {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 overflow-hidden shrink-0">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="User" referrerPolicy="no-referrer" />
          </div>
          {!isSidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-text-secondary truncate uppercase font-bold">{role}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
