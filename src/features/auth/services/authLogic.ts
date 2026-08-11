import type { User } from '../store/useAuthStore';

/**
 * Pure business logic for the mock local-only auth system — no
 * AsyncStorage/network I/O — so login/registration correctness can be
 * tested directly against plain objects. authService.ts is the thin
 * imperative shell that reads/writes storage and delegates here.
 */

export interface StoredAccount {
  user: User;
  passwordHash: string;
}

export type AccountsRegistry = Record<string, StoredAccount>;

export const SEED_ACCOUNT_EMAIL = 'test@example.com';
export const SEED_ACCOUNT_PASSWORD = 'password';

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/** Resolves login credentials against the seed account + a registered-accounts registry. Throws on any mismatch. */
export const resolveLogin = (
  email: string,
  password: string,
  accounts: AccountsRegistry
): { user: User; token: string } => {
  const cleanEmail = normalizeEmail(email);

  if (cleanEmail === SEED_ACCOUNT_EMAIL && password === SEED_ACCOUNT_PASSWORD) {
    return {
      user: { id: '1', name: 'Test Curator', email: cleanEmail, city: 'Paris' },
      token: 'mock-jwt-token-123',
    };
  }

  const account = accounts[cleanEmail];
  if (account && account.passwordHash === password) {
    return {
      user: account.user,
      token: `mock-jwt-token-${account.user.id}`,
    };
  }

  // Deliberately identical message whether the email is unknown or the
  // password is wrong — never reveal which one was incorrect.
  throw new Error('Invalid email or password. Please check your credentials.');
};

export const isEmailRegistered = (email: string, accounts: AccountsRegistry): boolean => {
  const cleanEmail = normalizeEmail(email);
  return Boolean(accounts[cleanEmail]) || cleanEmail === SEED_ACCOUNT_EMAIL;
};

export const buildNewAccount = (
  name: string,
  email: string,
  password: string,
  gender: string,
  mobile: string,
  address: string,
  city: string,
  state: string | undefined
): { account: StoredAccount; cleanEmail: string } => {
  const cleanEmail = normalizeEmail(email);
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email: cleanEmail,
    gender,
    mobile,
    address,
    city,
    state,
  };
  return { account: { user: newUser, passwordHash: password }, cleanEmail };
};
