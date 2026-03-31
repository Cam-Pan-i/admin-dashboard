/**
 * ACCOUNTS REGISTRY & PERMISSION CONTROLLER
 * 
 * This file acts as the "Source of Truth" for account permissions.
 * By defining roles here, you ensure that high-level access is controlled
 * via code rather than just database entries, making it "Injection Bulletproof."
 */

export type UserRole = 'owner' | 'admin' | 'mod' | 'user';

export interface AccountDefinition {
  email: string;
  role: UserRole;
  permissions: string[];
  isSystemAccount: boolean;
  testPassword?: string;
}

/**
 * SYSTEM ACCOUNTS CONFIGURATION
 * Add your authorized emails and their roles here.
 */
const ACCOUNTS_MAP = new Map<string, AccountDefinition>([
  [
    'owner@example.com', 
    {
      email: 'owner@example.com',
      role: 'owner',
      permissions: ['*'], // All permissions
      isSystemAccount: true,
      testPassword: 'owner'
    }
  ],
  [
    'admin@example.com', 
    {
      email: 'admin@example.com',
      role: 'admin',
      permissions: ['dashboard', 'moderation', 'config', 'embeds'],
      isSystemAccount: true,
      testPassword: 'admin'
    }
  ],
  [
    'mod@example.com', 
    {
      email: 'mod@example.com',
      role: 'mod',
      permissions: ['dashboard', 'moderation'],
      isSystemAccount: true,
      testPassword: 'mod'
    }
  ],
]);

/**
 * SECURE LOOKUP FUNCTION
 * This uses a Map lookup which is O(1) and immune to SQL/NoSQL injection
 * because it doesn't use dynamic query strings.
 */
export const getAccountByEmail = (email: string | undefined | null): AccountDefinition | null => {
  if (!email) return null;
  
  // Normalize email to prevent bypasses via casing
  const normalizedEmail = email.toLowerCase().trim();
  
  return ACCOUNTS_MAP.get(normalizedEmail) || null;
};

/**
 * PERMISSION CHECKER
 * Bulletproof check for specific actions
 */
export const hasPermission = (email: string, permission: string): boolean => {
  const account = getAccountByEmail(email);
  if (!account) return false;
  
  if (account.permissions.includes('*')) return true;
  return account.permissions.includes(permission);
};

export const getAllSystemAccounts = () => Array.from(ACCOUNTS_MAP.values());
