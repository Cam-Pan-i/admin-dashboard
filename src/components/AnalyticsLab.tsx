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
          <h1 className="text-4xl font-bold tracking-tight">Analytics Lab</h1>
          <p className="text-text-secondary">Deep dive into your server's growth and engagement metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-border text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-all">
            <Calendar size={18} />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-white">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest">Member Growth Over Time</h3>
            </div>
            <div className="flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest">
              <TrendingUp size={16} />
              +22.4%
            </div>
          </div>
          <div className="h-[350px] w-full">
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
                  tick={{ fill: '#8b949e', fontSize: 10 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8b949e', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#growthGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl border border-border">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-white/5 text-white">
              <Shield size={20} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-widest">Mod Action Breakdown</h3>
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
                >
                  {modActions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold">1,742</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Total Actions</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {modActions.map((action) => (
              <div key={action.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: action.color }}></div>
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest">{action.name}</span>
                </div>
                <span className="text-xs font-bold">{action.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-2xl border border-border">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-white/5 text-white">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-widest">Activity Distribution</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityHeatmap}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8b949e', fontSize: 10 }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Line type="stepAfter" dataKey="value" stroke="#ffffff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-[10px] text-text-secondary mt-4 uppercase tracking-widest font-bold">Peak activity detected at 16:00 UTC</p>
        </div>

        <div className="glass p-8 rounded-2xl border border-border flex flex-col justify-center items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10">
            <BarChart3 size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-bold uppercase tracking-widest">Engagement Score</h3>
            <p className="text-text-secondary text-xs uppercase tracking-widest mt-2">Your server is in the top 5% of similar communities.</p>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-3 rounded-2xl bg-bg-tertiary border border-border">
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Retention</p>
              <p className="text-xl font-bold text-white">82%</p>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-bg-tertiary border border-border">
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Virality</p>
              <p className="text-xl font-bold text-white/70">1.4x</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
