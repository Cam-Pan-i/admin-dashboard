import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Eye, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { supabase, safeFetch } from '../lib/supabase';

export const VerificationCommand = () => {
  const [difficulty, setDifficulty] = useState('medium');
  const [isEnabled, setIsEnabled] = useState(true);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ successRate: 94.2, failedCount: 72 });

  const fetchVerifications = async () => {
    setLoading(true);
    const data = await safeFetch(
      supabase.from('verification_logs').select('*').eq('status', 'pending').order('timestamp', { ascending: false }),
      [],
      'Fetch pending verifications'
    );
    setPendingVerifications(data);
    
    // Fetch stats
    const [success, failed] = await Promise.all([
      supabase.from('verification_logs').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
      supabase.from('verification_logs').select('*', { count: 'exact', head: true }).eq('status', 'failed')
    ]);
    
    const total = (success.count || 0) + (failed.count || 0);
    const rate = total > 0 ? ((success.count || 0) / total) * 100 : 94.2;
    
    setStats({
      successRate: parseFloat(rate.toFixed(1)),
      failedCount: failed.count || 0
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Verification Command</h1>
          <p className="text-text-secondary">Gatekeep your community with advanced captcha systems.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold",
            isEnabled ? "bg-white/10 text-white border-white/20" : "bg-white/5 text-text-secondary border-white/10"
          )}>
            <div className={cn("w-2 h-2 rounded-full", isEnabled ? "bg-white animate-pulse" : "bg-white/20")}></div>
            {isEnabled ? 'SYSTEM ACTIVE' : 'SYSTEM OFFLINE'}
          </div>
          <button 
            onClick={() => setIsEnabled(!isEnabled)}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-sm transition-all",
              isEnabled ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" : "bg-white text-black hover:bg-white/90"
            )}
          >
            {isEnabled ? 'Disable System' : 'Enable System'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-white/5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Pending Queue</h3>
              <button 
                onClick={fetchVerifications}
                disabled={loading}
                className="text-text-secondary hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={cn(loading && "animate-spin")} />
              </button>
            </div>
            <div className="divide-y divide-border">
              {loading && pendingVerifications.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center gap-4">
                  <RefreshCw size={24} className="animate-spin text-white/20" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Syncing Queue...</p>
                </div>
              ) : pendingVerifications.map((v) => (
                <div key={v.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-bg-tertiary border border-border overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${v.username}`} alt="" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-sm font-bold group-hover:text-white transition-colors">{v.username}</p>
                      <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                        <span className="bg-bg-tertiary px-1.5 py-0.5 rounded border border-border uppercase tracking-widest">Captcha</span>
                        <span>•</span>
                        <span className="uppercase tracking-widest">{v.timestamp ? new Date(v.timestamp).toLocaleTimeString() : '-'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-all" title="Preview Captcha">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-all" title="Approve">
                      <CheckCircle size={16} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-all" title="Deny">
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {pendingVerifications.length === 0 && !loading && (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white mx-auto mb-4 border border-border">
                  <CheckCircle size={24} />
                </div>
                <p className="text-sm font-bold">Queue is empty</p>
                <p className="text-xs text-text-secondary">All users have been processed.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-2xl border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-white/5 text-white">
                  <Zap size={20} />
                </div>
                <h3 className="font-bold text-sm">Success Rate</h3>
              </div>
              <div className="flex items-end gap-4 mb-2">
                <span className="text-4xl font-bold">{stats.successRate}%</span>
                <span className="text-white/60 text-xs font-bold mb-1">+2.1% this week</span>
              </div>
              <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-white" style={{ width: `${stats.successRate}%` }}></div>
              </div>
              <p className="text-[10px] text-text-secondary mt-4 uppercase tracking-widest">Based on total verification attempts in the matrix.</p>
            </div>

            <div className="glass p-6 rounded-2xl border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-white/5 text-white">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="font-bold text-sm">Failed Attempts</h3>
              </div>
              <div className="flex items-end gap-4 mb-2">
                <span className="text-4xl font-bold">{stats.failedCount}</span>
                <span className="text-white/40 text-xs font-bold mb-1">-5.4% this week</span>
              </div>
              <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-white/30" style={{ width: '15%' }}></div>
              </div>
              <p className="text-[10px] text-text-secondary mt-4 uppercase tracking-widest">Potential bot raids detected and mitigated.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-white/5 text-white">
                <Settings size={20} />
              </div>
              <h3 className="font-bold text-sm">System Settings</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Captcha Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {['easy', 'medium', 'hard'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "py-2 rounded-lg text-[10px] font-bold border transition-all capitalize tracking-widest",
                        difficulty === d ? "bg-white text-black border-white" : "bg-bg-tertiary border-border text-text-secondary hover:border-white/50"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Verification Channel</label>
                <select className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 text-text-primary">
                  <option>#verify-here</option>
                  <option>#gatekeeper</option>
                  <option>#welcome</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Verified Role</label>
                <select className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 text-text-primary">
                  <option>@Verified</option>
                  <option>@Member</option>
                  <option>@Citizen</option>
                </select>
              </div>

              <div className="pt-4 border-t border-border">
                <button className="w-full py-3 rounded-xl bg-bg-tertiary border border-border font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">
                  Test Captcha Generator
                </button>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-border bg-white/[0.02]">
            <h4 className="font-bold text-[10px] uppercase tracking-widest mb-2">Pro Tip</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Using "Hard" difficulty significantly reduces bot spam but may increase user friction. We recommend "Medium" for most servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
