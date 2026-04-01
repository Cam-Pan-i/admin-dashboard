import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './components/Dashboard';
import { MembersMatrix } from './components/MembersMatrix';
import { TicketControl } from './components/TicketControl';
import { VerificationCommand } from './components/VerificationCommand';
import { StockShop } from './components/StockShop';
import { ModerationSuite } from './components/ModerationSuite';
import { AnalyticsLab } from './components/AnalyticsLab';
import { ServerConfig } from './components/ServerConfig';
import { GeminiAssistant } from './components/GeminiAssistant';
import { AccountControl } from './components/AccountControl';
import { EmbedBuilder } from './components/EmbedBuilder';
import { MainHome } from './components/MainHome';
import { AuthCallback } from './components/AuthCallback';
import { PublicShop } from './components/PublicShop';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import { cn } from './lib/utils';

import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './components/LoginPage';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { useEffect } from 'react';
import { getAccountByEmail } from './lib/accounts';

const queryClient = new QueryClient();

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const path = window.location.pathname;
    if (path === '/main') return 'home';
    if (path === '/shop') return 'public-shop';
    if (path === '/callback') return 'callback';
    return 'dashboard';
  });
  
  const [currentPath, setCurrentPath] = useState(typeof window !== 'undefined' ? window.location.pathname : '/');
  const { user, setUser, setRole, isLoading, signOut } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  const isPublicPath = ['/main', '/shop', '/callback'].includes(currentPath);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path === '/main') setActiveTab('home');
      else if (path === '/shop') setActiveTab('public-shop');
      else if (path === '/callback') setActiveTab('callback');
      else setActiveTab('dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle Zustand hydration
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    
    // Check if already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const updateRole = (email: string | undefined) => {
      const account = getAccountByEmail(email);
      if (account) {
        setRole(account.role as any);
      } else {
        // Default role for non-system accounts
        setRole('mod');
      }
    };

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          updateRole(session.user.email);
        } else if (!user) {
          // Only clear if we don't have a mock user
          setUser(null);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          updateRole(session.user.email);
        } else if (!user) {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // In mock mode, if we're hydrated and have no user, stop loading
      if (isLoading && !user) {
        setUser(null);
      }
    }
  }, [setUser, setRole, user, isLoading, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
          <Bot className="text-white/20 w-6 h-6" />
        </div>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    const publicPaths: Record<string, string> = {
      'home': '/main',
      'public-shop': '/shop',
      'callback': '/callback'
    };

    if (publicPaths[tab]) {
      window.history.pushState({}, '', publicPaths[tab]);
      setCurrentPath(publicPaths[tab]);
    } else {
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
      setCurrentPath('/');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <MainHome setActiveTab={handleTabChange} />;
      case 'callback':
        return <AuthCallback />;
      case 'public-shop':
        return <PublicShop />;
      case 'dashboard':
        return <Dashboard />;
      case 'members':
        return <MembersMatrix />;
      case 'tickets':
        return <TicketControl />;
      case 'verification':
        return <VerificationCommand />;
      case 'shop':
        return <StockShop />;
      case 'moderation':
        return <ModerationSuite />;
      case 'analytics':
        return <AnalyticsLab />;
      case 'config':
        return <ServerConfig />;
      case 'ai':
        return <GeminiAssistant />;
      case 'embeds':
        return <EmbedBuilder />;
      case 'accounts':
        return <AccountControl />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-bg-tertiary flex items-center justify-center text-text-secondary">
              <span className="text-2xl font-bold">?</span>
            </div>
            <h2 className="text-xl font-bold">Module Under Construction</h2>
            <p className="text-text-secondary">We're building the {activeTab} module. Check back soon!</p>
          </div>
        );
    }
  };

  // Public Routes (No Login Required)
  if (isPublicPath) {
    const isFullPage = activeTab === 'callback';
    
    return (
      <QueryClientProvider client={queryClient}>
        <div className={cn(
          "min-h-screen bg-bg-primary text-text-primary selection:bg-white/30",
          isFullPage ? "p-8" : ""
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={!isFullPage ? "max-w-7xl mx-auto p-4 md:p-8" : ""}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </QueryClientProvider>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
          <Bot className="text-white/20 w-6 h-6" />
        </div>
      </div>
    );
  }

  // Protected Routes (Login Required)
  if (!user) {
    return <LoginPage />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-bg-primary text-text-primary selection:bg-white/30">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          
          <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
