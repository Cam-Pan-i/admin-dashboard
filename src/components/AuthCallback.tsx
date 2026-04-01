import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState({
    title: 'Synchronizing',
    message: 'Establishing secure link with your Discord identity.',
    type: 'loading'
  });

  useEffect(() => {
    const handleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = fragment.get('access_token');

      if (error) {
        setStatus({
          title: 'DENIED',
          message: 'Authorization was revoked. Process terminated.',
          type: 'error'
        });
        return;
      }

      if (code) {
        setStatus({
          title: 'VALIDATING',
          message: 'Finalizing secure connection to the central registry...',
          type: 'loading'
        });
        setTimeout(() => {
          window.location.href = `/api/callback?code=${encodeURIComponent(code)}`;
        }, 1600);
        return;
      }

      if (accessToken) {
        setStatus({
          title: 'PROCESSING',
          message: 'Analyzing session token for secure entry...',
          type: 'loading'
        });
        setTimeout(() => {
          window.location.href = `/api/callback?access_token=${encodeURIComponent(accessToken)}`;
        }, 1600);
        return;
      }

      setStatus({
        title: 'EXPIRED',
        message: 'No active session token found. Please restart authentication.',
        type: 'error'
      });
    };

    const timer = setTimeout(handleCallback, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[400px] glass border border-white/10 rounded-[40px] p-16 text-center relative overflow-hidden shadow-2xl"
      >
        {/* Background Orbs (simplified for component) */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 blur-[60px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-white/5 blur-[60px] rounded-full" />

        {/* Loader */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-white/10 rounded-full"
          >
            <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_16px_#fff]" />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.01.043.02.06a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.974 0c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.946-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
            </svg>
          </div>
        </div>

        <h2 className={cn(
          "text-2xl font-bold tracking-tight mb-2 uppercase",
          status.type === 'error' ? "text-red-500" : "text-white"
        )}>
          {status.title}
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed font-medium">
          {status.message}
        </p>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-center gap-2.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-text-secondary">
          <div className={cn(
            "w-2 h-2 rounded-full shadow-[0_0_12px]",
            status.type === 'error' ? "bg-red-500 shadow-red-500" : "bg-white shadow-white animate-pulse"
          )} />
          Secure Protocol Active
        </div>
      </motion.div>
    </div>
  );
};
