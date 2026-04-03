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
 * SECURE LOOKUP FUNCTION (Async)
 * Fetches account details from Supabase authorized_users table.
 */
export const fetchAccountByEmail = async (email: string | undefined | null): Promise<AccountDefinition | null> => {
  if (!email) return null;
  
  const normalizedEmail = email.toLowerCase().trim();
  
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
