import React from 'react';
import { Shield, Mail, Lock, UserCheck, AlertTriangle } from 'lucide-react';
import { getAllSystemAccounts } from '../lib/accounts';

export const AccountControl: React.FC = () => {
  const accounts = getAllSystemAccounts();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Account Control</h1>
          <p className="text-text-secondary">Manage code-defined system accounts and high-level permissions.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <AlertTriangle className="text-yellow-500" size={16} />
          <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Code-Defined Only</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass p-8 rounded-2xl border border-border space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-white/5 text-white">
              <Shield size={20} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-widest">System Accounts Registry</h3>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Email</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Role</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Permissions</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.email} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-white/5 text-text-secondary">
                          <Mail size={14} />
                        </div>
                        <span className="text-sm font-medium">{acc.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                        acc.role === 'owner' ? 'bg-purple-500/20 text-purple-400' :
                        acc.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {acc.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {acc.permissions.map(p => (
                          <span key={p} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-text-secondary">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-green-400">
                        <UserCheck size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl border border-border space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="text-text-secondary" size={18} />
            <h3 className="font-bold text-sm uppercase tracking-widest">Security Protocol</h3>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            These accounts are managed directly in <code className="bg-white/5 px-1.5 py-0.5 rounded text-white">src/lib/accounts.ts</code>. 
            This provides a hard-coded layer of security that is immune to database-level injection attacks. 
            To add or modify accounts, update the registry file and redeploy.
          </p>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Developer Note</p>
            <p className="text-xs text-blue-300/80">
              Passwords are still managed via Supabase for cryptographic security. The registry file handles 
              <strong> Identity Verification</strong> and <strong>Permission Escalation</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
