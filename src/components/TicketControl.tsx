import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Clock, 
  MessageSquare, 
  User, 
  Tag, 
  MoreVertical,
  ChevronRight,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { supabase, safeFetch } from '../lib/supabase';

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors: Record<string, string> = {
    'high': 'text-white bg-white/10 border-white/20',
    'normal': 'text-text-secondary bg-white/5 border-white/10',
    'low': 'text-text-secondary bg-white/5 border-white/10',
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider",
      colors[priority]
    )}>
      {priority}
    </span>
  );
};

export const TicketControl = () => {
  const [view, setView] = useState<'kanban' | 'list' | 'analytics'>('kanban');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    const data = await safeFetch(
      supabase.from('tickets').select('*').order('created_at', { ascending: false }),
      [],
      'Fetch tickets'
    );
    
    // Map Supabase tickets to UI format
    const formattedTickets = data.map((t: any) => ({
      id: `T-${t.id.toString().slice(-4)}`,
      title: t.reason || t.description || 'No subject',
      user: t.creator_name || 'Unknown',
      status: t.closed_at ? 'resolved' : (t.claimed_by ? 'in-progress' : 'open'),
      priority: t.priority || 'normal',
      time: t.created_at ? new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      staff: t.claimed_by
    }));
    
    setTickets(formattedTickets);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Ticket Control</h1>
          <p className="text-text-secondary">Real-time support management and transcript analysis.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-bg-secondary rounded-xl border border-border">
          <button 
            onClick={() => setView('kanban')}
            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", view === 'kanban' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary")}
          >
            Kanban
          </button>
          <button 
            onClick={() => setView('list')}
            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", view === 'list' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary")}
          >
            List
          </button>
          <button 
            onClick={() => setView('analytics')}
            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", view === 'analytics' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary")}
          >
            Analytics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { id: 'open', label: 'Open', icon: AlertCircle, color: 'text-white' },
          { id: 'in-progress', label: 'In Progress', icon: Clock, color: 'text-white/70' },
          { id: 'awaiting-user', label: 'Awaiting User', icon: User, color: 'text-white/50' },
          { id: 'resolved', label: 'Resolved', icon: CheckCircle2, color: 'text-white/30' },
        ].map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <column.icon size={16} className={column.color} />
                <h3 className="font-bold text-sm">{column.label}</h3>
                <span className="text-[10px] bg-bg-tertiary px-1.5 py-0.5 rounded border border-border text-text-secondary">
                  {loading ? '...' : tickets.filter(t => t.status === column.id).length}
                </span>
              </div>
              <button onClick={fetchTickets} className="text-text-secondary hover:text-text-primary">
                <RefreshCw size={14} className={cn(loading && "animate-spin")} />
              </button>
            </div>

            <div className="space-y-3 min-h-[500px] p-2 rounded-2xl bg-white/[0.02] border border-dashed border-border/50">
              {loading && tickets.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-white/10" />
                </div>
              ) : tickets.filter(t => t.status === column.id).map((ticket) => (
                <motion.div 
                  key={ticket.id}
                  layoutId={ticket.id}
                  whileHover={{ y: -2 }}
                  className="glass p-4 rounded-xl border border-border space-y-3 cursor-grab active:cursor-grabbing group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-text-secondary">{ticket.id}</span>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <h4 className="text-sm font-bold leading-snug group-hover:text-white transition-colors">{ticket.title}</h4>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-bg-tertiary border border-border overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.user}`} alt="" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[10px] font-medium text-text-secondary">{ticket.user}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-text-secondary">
                      <Clock size={10} />
                      {ticket.time}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex -space-x-2">
                      {ticket.staff ? (
                        <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[8px] font-bold" title={ticket.staff}>
                          {ticket.staff[0]}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-bg-tertiary border border-border border-dashed flex items-center justify-center text-text-secondary" title="Unassigned">
                          <User size={10} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:text-white transition-colors">
                        <MessageSquare size={14} />
                      </button>
                      <button className="p-1 hover:text-white transition-colors">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
