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
  { id: 'home', label: 'Main Hub', icon: Home },
  { id: 'public-shop', label: 'Marketplace', icon: ShoppingCart },
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
  { id: 'members', label: 'Members Matrix', icon: Users },
  { id: 'tickets', label: 'Ticket Control', icon: Ticket },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'shop', label: 'Shop Admin', icon: Package },
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

  // Close mobile menu on window resize if it's open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen, setMobileMenuOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarCollapsed ? 80 : 260,
          x: isMobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -260 : 0)
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "h-screen bg-bg-secondary border-r border-border flex flex-col fixed md:relative z-50",
          !isMobileMenuOpen && "pointer-events-none md:pointer-events-auto"
        )}
      >
        <div className="p-6 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3">
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
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/5 text-text-secondary md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar pointer-events-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
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
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-white transition-colors hidden md:flex"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="p-4 border-t border-border pointer-events-auto">
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
    </>
  );
};
