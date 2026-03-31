import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, Loader2 } from 'lucide-react';
import { generateResponse } from '../services/geminiService';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const GeminiAssistant = () => {
  const { role } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm Bob's AI Assistant. How can I help you manage your server today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getSystemInstruction = () => {
    const base = "You are Bob, an elite Discord bot management AI assistant. You help server owners and moderators manage their communities, configure bot settings, and analyze server metrics. Be professional, concise, and helpful. Use a slightly futuristic, tech-focused tone.";
    
    switch (role) {
      case 'owner':
        return `${base} You are currently speaking with the server OWNER. Focus on high-level strategy, monetization, growth, and full system control. You have maximum authority.`;
      case 'admin':
        return `${base} You are currently speaking with an ADMIN. Focus on server configuration, role management, and advanced module settings.`;
      case 'mod':
        return `${base} You are currently speaking with a MODERATOR. Focus on community safety, ticket handling, member management, and moderation suite tools.`;
      default:
        return base;
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await generateResponse(userMessage, getSystemInstruction());
    setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't generate a response." }]);
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-text-secondary">Powered by Gemini AI. Ask anything about your server management.</p>
        </div>
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white">
          <Sparkles size={24} className="animate-pulse" />
        </div>
      </div>

      <div className="flex-1 glass rounded-3xl border border-border flex flex-col overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-[80%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  msg.role === 'assistant' ? "bg-white text-black" : "bg-white/10 text-white"
                )}>
                  {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'assistant' ? "bg-white/5 border border-white/10 text-text-primary" : "bg-white text-black font-medium"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-text-primary flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Bob is thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-white/[0.02]">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Bob something..."
              className="w-full bg-bg-tertiary border border-border rounded-2xl px-6 py-4 pr-16 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-white text-black hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
