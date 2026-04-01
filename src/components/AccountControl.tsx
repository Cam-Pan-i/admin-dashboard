import React from 'react';
import { Shield, Mail, Lock, UserCheck, AlertTriangle } from 'lucide-react';
import { getAllSystemAccounts } from '../lib/accounts';

export const AccountControl: React.FC = () => {
  const accounts = getAllSystemAccounts();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter italic uppercase text-glow">Account Control</h1>
          <p className="text-text-secondary text-xs uppercase tracking-[0.2em] font-medium opacity-70">
            Manage code-defined system accounts and high-level permissions.
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-yellow-500/5 border border-yellow-500/20 rounded-lg neo-border">
          <AlertTriangle className="text-yellow-500" size={14} />
          <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-[0.2em]">Code-Defined Only</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="glass p-8 rounded-xl border border-white/10 neo-border relative overflow-hidden">
          <div className="absolute inset-0 scanline opacity-5"></div>
          <div className="flex items-center gap-3 mb-8 relative">
            <div className="p-2 rounded-lg bg-white/5 text-white border border-white/10">
              <Shield size={18} />
            </div>
            <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-white/80">System Accounts Registry</h3>
          </div>

          <div className="overflow-x-auto custom-scrollbar relative">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-5 px-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Email Address</th>
                  <th className="py-5 px-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Access Level</th>
                  <th className="py-5 px-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Permissions Matrix</th>
                  <th className="py-5 px-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.email} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-text-secondary border border-white/5 group-hover:border-white/10 transition-colors">
                          <Mail size={12} />
                        </div>
                        <span className="text-xs font-mono text-white/90">{acc.email}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-[0.2em] border ${
                        acc.role === 'owner' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        acc.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {acc.role}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {acc.permissions.map(p => (
                          <span key={p} className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-mono text-text-secondary border border-white/5 uppercase tracking-tighter">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2 text-green-400/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Active</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass p-8 rounded-xl border border-white/10 neo-border relative overflow-hidden">
          <div className="absolute inset-0 scanline opacity-5"></div>
          <div className="space-y-6 relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-white/60 border border-white/10">
                <Lock size={16} />
              </div>
              <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-white/80">Security Protocol</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-medium opacity-80 max-w-2xl">
              These accounts are managed directly in <code className="bg-white/5 px-2 py-0.5 rounded text-white font-mono text-[10px] border border-white/10">src/lib/accounts.ts</code>. 
              This provides a hard-coded layer of security that is immune to database-level injection attacks. 
              To add or modify accounts, update the registry file and redeploy.
            </p>
            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Shield size={48} />
              </div>
              <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-2">Developer Note</p>
              <p className="text-[11px] text-blue-300/70 leading-relaxed font-medium">
                Passwords are still managed via Supabase for cryptographic security. The registry file handles 
                <strong className="text-blue-200"> Identity Verification</strong> and <strong className="text-blue-200">Permission Escalation</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
