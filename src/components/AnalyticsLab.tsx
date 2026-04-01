import React from 'react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Shield,
  Download,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const memberGrowth = [
  { date: '2024-03-01', count: 10200 },
  { date: '2024-03-05', count: 10500 },
  { date: '2024-03-10', count: 10800 },
  { date: '2024-03-15', count: 11200 },
  { date: '2024-03-20', count: 11800 },
  { date: '2024-03-25', count: 12100 },
  { date: '2024-03-31', count: 12482 },
];

const modActions = [
  { name: 'Bans', value: 420, color: '#ffffff' },
  { name: 'Warns', value: 850, color: '#ffffff99' },
  { name: 'Mutes', value: 320, color: '#ffffff66' },
  { name: 'Kicks', value: 150, color: '#ffffff33' },
];

const activityHeatmap = [
  { hour: '00:00', value: 45 },
  { hour: '04:00', value: 20 },
  { hour: '08:00', value: 65 },
  { hour: '12:00', value: 95 },
  { hour: '16:00', value: 120 },
  { hour: '20:00', value: 85 },
  { hour: '23:59', value: 55 },
];

export const AnalyticsLab = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic">Analytics Lab</h1>
          <p className="text-text-secondary text-xs font-mono tracking-widest uppercase opacity-60">Intelligence Gathering & Behavioral Analysis Matrix</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-white/10 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-white/10 transition-all neo-border">
            <Calendar size={14} />
            Temporal Range: 30D
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Download size={14} />
            Export Intelligence
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-xl border border-white/10 neo-border relative overflow-hidden">
          <div className="absolute inset-0 scanline opacity-5"></div>
          <div className="flex items-center justify-between mb-8 relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-white border border-white/10">
                <Users size={18} />
              </div>
              <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-white/80">Population Growth Matrix</h3>
            </div>
            <div className="flex items-center gap-2 text-white text-[9px] font-bold uppercase tracking-[0.2em] font-mono">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-green-400">+22.4%</span>
            </div>
          </div>
          <div className="h-[350px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memberGrowth}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8b949e', fontSize: 9, fontFamily: 'monospace' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8b949e', fontSize: 9, fontFamily: 'monospace' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="count" stroke="#ffffff" strokeWidth={1.5} fillOpacity={1} fill="url(#growthGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-xl border border-white/10 neo-border relative overflow-hidden">
          <div className="absolute inset-0 scanline opacity-5"></div>
          <div className="flex items-center gap-3 mb-8 relative">
            <div className="p-2 rounded-lg bg-white/5 text-white border border-white/10">
              <Shield size={18} />
            </div>
            <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-white/80">Enforcement Distribution</h3>
          </div>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modActions}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {modActions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold font-mono tracking-tighter">1,742</span>
              <span className="text-[8px] text-text-secondary uppercase tracking-[0.2em] font-bold opacity-60">Total Events</span>
            </div>
          </div>
          <div className="mt-6 space-y-3 relative">
            {modActions.map((action) => (
              <div key={action.name} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: action.color }}></div>
                  <span className="text-[9px] text-text-secondary uppercase tracking-[0.2em] font-bold">{action.name}</span>
                </div>
                <span className="text-[10px] font-bold font-mono">{action.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-xl border border-white/10 neo-border relative overflow-hidden">
          <div className="absolute inset-0 scanline opacity-5"></div>
          <div className="flex items-center gap-3 mb-8 relative">
            <div className="p-2 rounded-lg bg-white/5 text-white border border-white/10">
              <MessageSquare size={18} />
            </div>
            <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-white/80">Activity Pulse</h3>
          </div>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityHeatmap}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8b949e', fontSize: 9, fontFamily: 'monospace' }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                />
                <Line type="stepAfter" dataKey="value" stroke="#ffffff" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-[8px] text-text-secondary mt-4 uppercase tracking-[0.3em] font-bold opacity-60 italic relative">Peak activity detected at 16:00 UTC</p>
        </div>

        <div className="glass p-8 rounded-xl border border-white/10 flex flex-col justify-center items-center text-center space-y-6 neo-border relative overflow-hidden">
          <div className="absolute inset-0 scanline opacity-5"></div>
          <div className="w-20 h-20 rounded-lg bg-white/5 flex items-center justify-center text-white border border-white/10 relative">
            <BarChart3 size={32} />
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-md bg-white text-black flex items-center justify-center text-[10px] font-bold">A+</div>
          </div>
          <div className="relative">
            <h3 className="text-3xl font-bold uppercase tracking-tighter italic">Engagement Score</h3>
            <p className="text-text-secondary text-[9px] uppercase tracking-[0.2em] mt-2 font-medium opacity-60">Server performance exceeds 95% of monitored clusters.</p>
          </div>
          <div className="flex gap-4 relative">
            <div className="px-8 py-4 rounded-lg bg-white/[0.02] border border-white/5">
              <p className="text-[8px] text-text-secondary font-bold uppercase tracking-[0.2em] mb-1">Retention</p>
              <p className="text-2xl font-bold text-white font-mono tracking-tighter">82%</p>
            </div>
            <div className="px-8 py-4 rounded-lg bg-white/[0.02] border border-white/5">
              <p className="text-[8px] text-text-secondary font-bold uppercase tracking-[0.2em] mb-1">Virality</p>
              <p className="text-2xl font-bold text-white/70 font-mono tracking-tighter">1.4x</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
