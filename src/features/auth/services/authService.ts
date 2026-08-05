import { storage } from '../../../core/storage/storage';
import { User } from '../store/useAuthStore';

interface StoredAccount {
  user: User;
  passwordHash: string;
}

const REGISTERED_USERS_KEY = 'REGISTERED_ACCOUNTS_REGISTRY';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check seed account
    if (cleanEmail === 'test@example.com' && password === 'password') {
      return {
        user: { id: '1', name: 'Test Curator', email: cleanEmail, city: 'Paris' },
        token: 'mock-jwt-token-123',
      };
    }

    // Check registered accounts
    const accounts = await storage.getItem<Record<string, StoredAccount>>(REGISTERED_USERS_KEY) || {};
    const account = accounts[cleanEmail];

    if (account && account.passwordHash === password) {
      return {
        user: account.user,
        token: `mock-jwt-token-${account.user.id}`,
      };
    }

    throw new Error('Invalid email or password. Please check your credentials.');
  },

  register: async (
    name: string, 
    email: string, 
    password: string, 
    gender: string, 
    mobile: string, 
    address: string, 
    city: string
  ): Promise<{ user: User; token: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = await storage.getItem<Record<string, StoredAccount>>(REGISTERED_USERS_KEY) || {};

    if (accounts[cleanEmail] || cleanEmail === 'test@example.com') {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email: cleanEmail,
      gender,
      mobile,
      address,
      city,
    };

    accounts[cleanEmail] = {
      user: newUser,
      passwordHash: password,
    };

    await storage.setItem(REGISTERED_USERS_KEY, accounts);

    return {
      user: newUser,
      token: `mock-jwt-token-${newUser.id}`,
    };
  },
};
