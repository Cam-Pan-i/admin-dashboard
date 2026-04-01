import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  LayoutDashboard, 
  Users, 
  Ticket, 
  ShieldCheck, 
  Package, 
  ShoppingCart,
  Shield, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles,
  Layout,
  X
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
  { id: 'embeds', label: 'Embed Builder', icon: Layout },
  { id: 'accounts', label: 'Account Control', icon: ShieldCheck },
  { id: 'config', label: 'Server Config', icon: Settings },
];

export const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (id: string) => void }) => {
  const { isSidebarCollapsed, setSidebarCollapsed, isMobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const { user, role } = useAuthStore();

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarCollapsed ? 72 : 240,
          x: isMobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -240 : 0)
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={cn(
          "h-screen bg-bg-primary border-r border-white/[0.03] flex flex-col fixed md:relative z-50",
          !isMobileMenuOpen && "pointer-events-none md:pointer-events-auto"
        )}
      >
        <div className="h-20 flex items-center px-6 justify-between overflow-hidden border-b border-white/[0.03]">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              <Bot className="text-black w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="font-black text-sm tracking-[0.2em] leading-none">BOB</span>
                <span className="text-[10px] text-text-secondary font-bold tracking-wider mt-1">MASTER ADMIN</span>
              </motion.div>
            )}
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/5 text-text-secondary md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar pointer-events-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden",
                activeTab === item.id 
                  ? "text-white" 
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white/[0.03] border border-white/[0.05] rounded-lg"
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                />
              )}
              
              <div className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 z-10",
                activeTab === item.id ? "bg-white/10" : "group-hover:bg-white/5"
              )}>
                <item.icon size={16} className={cn(
                  "transition-all duration-300",
                  activeTab === item.id ? "scale-110" : "opacity-50 group-hover:opacity-100"
                )} />
              </div>

              {!isSidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-bold text-[11px] uppercase tracking-wider z-10"
                >
                  {item.label}
                </motion.span>
              )}

              {activeTab === item.id && (
                <motion.div 
                  layoutId="sidebar-indicator"
                  className="absolute left-0 w-0.5 h-4 bg-white rounded-r-full z-10"
                />
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/[0.03] pointer-events-auto bg-bg-secondary/50">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 group-hover:border-white/20 transition-all">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="User" referrerPolicy="no-referrer" />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[11px] font-black truncate tracking-wider uppercase">{user?.email?.split('@')[0]}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] text-text-secondary truncate uppercase font-bold tracking-wider">{role}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-[88px] w-6 h-6 rounded-lg bg-bg-primary border border-white/10 flex items-center justify-center text-text-secondary hover:text-white transition-all hover:scale-110 z-50 hidden md:flex"
        >
          {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>
    </>
  );
};
