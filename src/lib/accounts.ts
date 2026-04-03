/**
 * ACCOUNTS REGISTRY & PERMISSION CONTROLLER
 * 
 * This file acts as the "Source of Truth" for account permissions.
 * By defining roles here, you ensure that high-level access is controlled
 * via code rather than just database entries, making it "Injection Bulletproof."
 */

import { supabase, safeFetch } from './supabase';

export type UserRole = 'owner' | 'admin' | 'mod' | 'user';

export interface AccountDefinition {
  email: string;
  roles: UserRole[];
  permissions: string[];
  isSystemAccount: boolean;
  username?: string;
  userid?: string;
}

/**
 * Helper to get the highest priority role for UI display
 */
export const getPrimaryRole = (roles: UserRole[]): UserRole => {
  if (roles.includes('owner')) return 'owner';
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('mod')) return 'mod';
  return 'user';
};

/**
 * AUTHENTICATE DASHBOARD ACCOUNT
 * Tries dashboard_accounts table first, then falls back to dummy logins.
 */
export const authenticateDashboardAccount = async (email: string, password: string): Promise<AccountDefinition | null> => {
  const normalizedEmail = email.toLowerCase().trim();
  
  // 1. Try Supabase table dashboard_accounts
  try {
    const { data, error } = await supabase
      .from('dashboard_accounts')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('password', password)
      .single();
      
    if (data && !error) {
      return {
        email: data.email,
        roles: data.perms ? [data.perms as UserRole] : ['mod'],
        permissions: ['*'],
        isSystemAccount: true,
        username: data.username,
        userid: data.userid
      };
    }
  } catch (err) {
    // Table might not exist or other error
  }

  // 2. Fallback to dummy logins
  const dummyLogins: Record<string, { pass: string, role: UserRole }> = {
    'owner@example.com': { pass: 'owner', role: 'owner' },
    'admin@example.com': { pass: 'admin', role: 'admin' },
    'mod@example.com': { pass: 'mod', role: 'mod' }
  };

  if (dummyLogins[normalizedEmail] && dummyLogins[normalizedEmail].pass === password) {
    return {
      email: normalizedEmail,
      roles: [dummyLogins[normalizedEmail].role],
      permissions: ['*'],
      isSystemAccount: true,
      username: normalizedEmail.split('@')[0],
      userid: 'dummy-' + dummyLogins[normalizedEmail].role
    };
  }

  return null;
};

/**
 * SECURE LOOKUP FUNCTION (Async)
 * Fetches account details from Supabase authorized_users table.
 */
export const fetchAccountByEmail = async (email: string | undefined | null): Promise<AccountDefinition | null> => {
  if (!email) return null;
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // 1. Try dashboard_accounts first (for dashboard-only users)
  try {
    const { data: dashData, error: dashError } = await supabase
      .from('dashboard_accounts')
      .select('*')
      .eq('email', normalizedEmail)
      .single();
      
    if (dashData && !dashError) {
      return {
        email: dashData.email,
        roles: dashData.perms ? [dashData.perms as UserRole] : ['mod'],
        permissions: ['*'],
        isSystemAccount: true,
        username: dashData.username,
        userid: dashData.userid
      };
    }
  } catch (err) {
    // Table might not exist
  }

  // 2. Try authorized_users (for Discord users)
  const data = await safeFetch(
    supabase
      .from('authorized_users')
      .select('*')
      .eq('email', normalizedEmail)
      .single(),
    null,
    'Fetch account by email'
  );

  if (data) {
    return {
      email: data.email,
      roles: (data.roles as UserRole[]) || ['mod'],
      permissions: data.permissions || ['dashboard'],
      isSystemAccount: true
    };
  }

  return null;
};

/**
 * PERMISSION CHECKER
 */
export const hasPermission = (account: AccountDefinition | null, permission: string): boolean => {
  if (!account) return false;
  
  if (account.permissions.includes('*')) return true;
  return account.permissions.includes(permission);
};

/**
 * Fetches all system accounts from Supabase.
 */
export const fetchAllSystemAccounts = async (): Promise<AccountDefinition[]> => {
  const data = await safeFetch(
    supabase
      .from('authorized_users')
      .select('*')
      .order('created_at', { ascending: false }),
    [],
    'Fetch all system accounts'
  );

  return data.map((acc: any) => ({
    email: acc.email,
    roles: (acc.roles as UserRole[]) || ['mod'],
    permissions: acc.permissions || ['dashboard'],
    isSystemAccount: true
  }));
};
