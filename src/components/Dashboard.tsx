import React from 'react';
import { 
  Users, 
  Ticket, 
  ShieldCheck, 
  Shield, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Mon', members: 4000, commands: 2400 },
  { name: 'Tue', members: 4500, commands: 1398 },
  { name: 'Wed', members: 4200, commands: 9800 },
  { name: 'Thu', members: 5100, commands: 3908 },
  { name: 'Fri', members: 4800, commands: 4800 },
  { name: 'Sat', members: 6000, commands: 3800 },
  { name: 'Sun', members: 6500, commands: 4300 },
];

const commandData = [
  { name: '/shop', value: 450 },
  { name: '/buy', value: 320 },
  { name: '/verify', value: 280 },
  { name: '/help', value: 150 },
  { name: '/stock', value: 120 },
];

const StatCard = ({ title, value, trend, icon: Icon }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass p-6 rounded-2xl relative overflow-hidden group border border-border"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-white/5 text-white">
        <Icon size={24} />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
        trend > 0 ? "bg-white/10 text-white" : "bg-white/5 text-text-secondary"
      )}>
        {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(trend)}%
      </div>
    </div>
    <h3 className="text-text-secondary text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold tracking-tight">{value}</p>
  </motion.div>
);

import { cn } from '../lib/utils';
import { Zap } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold tracking-tight">Command Center</h1>
          <p className="text-text-secondary">Real-time overview of Bob's performance and server health.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-bg-secondary border border-border">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-wider">System Online</span>
          </div>
          <button className="px-6 py-2 rounded-2xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Members" value="12,482" trend={12.5} icon={Users} />
        <StatCard title="Active Tickets" value="24" trend={-4.2} icon={Ticket} />
        <StatCard title="Verification Queue" value="156" trend={28.1} icon={ShieldCheck} />
        <StatCard title="Mod Actions Today" value="42" trend={8.4} icon={Shield} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Member Growth</h3>
              <p className="text-xs text-text-secondary">Real-time growth analytics over 7 days</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-bg-tertiary text-xs font-bold border border-border hover:border-white transition-colors">7D</button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">30D</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#52525b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#52525b', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="members" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorMembers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-bold mb-6">Live Activity</h3>
          <div className="space-y-4">
            {[
              { user: 'Kaka', action: 'joined the server', time: '2m ago', type: 'join' },
              { user: 'Bob', action: 'used /shop', time: '5m ago', type: 'command' },
              { user: 'ModBot', action: 'banned User#1234', time: '12m ago', type: 'mod' },
              { user: 'Alice', action: 'opened a ticket', time: '15m ago', type: 'ticket' },
              { user: 'Charlie', action: 'verified successfully', time: '22m ago', type: 'verify' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-bg-tertiary border border-border flex items-center justify-center shrink-0 group-hover:border-white/20 transition-colors">
                  <Zap size={18} className="text-text-secondary group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate group-hover:text-white transition-colors">{item.user}</p>
                  <p className="text-xs text-text-secondary truncate">{item.action}</p>
                </div>
                <span className="text-[10px] text-text-secondary whitespace-nowrap font-mono uppercase">{item.time}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 rounded-xl border border-border text-xs font-bold hover:bg-white/5 transition-all">View All Activity</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-bold mb-6">Top Commands</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commandData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ffffff', fontSize: 12, fontWeight: 600 }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} fill="#ffffff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-border flex flex-col justify-center items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-border flex items-center justify-center text-white">
            <Activity size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Bot Health</h3>
            <p className="text-text-secondary text-sm">All systems operational</p>
          </div>
          <div className="grid grid-cols-3 gap-8 w-full pt-4">
            <div>
              <p className="text-text-secondary text-[10px] uppercase font-bold tracking-widest">Latency</p>
              <p className="text-lg font-bold text-white">24ms</p>
            </div>
            <div>
              <p className="text-text-secondary text-[10px] uppercase font-bold tracking-widest">Uptime</p>
              <p className="text-lg font-bold text-white">99.9%</p>
            </div>
            <div>
              <p className="text-text-secondary text-[10px] uppercase font-bold tracking-widest">RAM</p>
              <p className="text-lg font-bold text-white">1.2GB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
