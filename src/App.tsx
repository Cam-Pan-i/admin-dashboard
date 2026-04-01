import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';

import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './components/LoginPage';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { getAccountByEmail } from './lib/accounts';

import { MainPage } from './components/public/MainPage';
import { ShopPage } from './components/public/ShopPage';
import { CallbackPage } from './components/public/CallbackPage';

const queryClient = new QueryClient();

function DashboardApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, setUser, setRole, isLoading, isHydrated, setHydrated } = useAuthStore();

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => unsub();
  }, [setHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    const updateRole = (email: string | undefined) => {
      const account = getAccountByEmail(email);
      if (account) {
        setRole(account.role as any);
      } else {
        setRole('mod');
      }
    };

    if (isSupabaseConfigured) {
      // Initial session check
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          updateRole(session.user.email);
        } else {
          setUser(null);
        }
      }).catch(err => {
        console.error("Auth session error:", err);
        setUser(null);
      });

      // Listen for changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          updateRole(session.user.email);
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Simulation mode
      setUser(null);
    }
  }, [isHydrated, setUser, setRole]);

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
          <Bot className="text-white/20 w-6 h-6" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
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

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary selection:bg-white/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
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
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<DashboardApp />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

