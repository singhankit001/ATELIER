import { storage } from '../../../core/storage/storage';
import { User } from '../store/useAuthStore';
import { resolveLogin, isEmailRegistered, buildNewAccount, AccountsRegistry } from './authLogic';

const REGISTERED_USERS_KEY = 'REGISTERED_ACCOUNTS_REGISTRY';

const loadAccounts = async (): Promise<AccountsRegistry> =>
  (await storage.getItem<AccountsRegistry>(REGISTERED_USERS_KEY)) || {};

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const accounts = await loadAccounts();
    return resolveLogin(email, password, accounts);
  },

  /**
   * A local-only guest session — no network, no persisted account. Lets a
   * visitor step into the collection immediately without committing to
   * membership. Clearly not gallery data, so this doesn't touch the
   * strict "real Picsum data only" rule that governs the artwork feed.
   */
  loginAsGuest: async (): Promise<{ user: User; token: string }> => {
    const guestId = `guest-${Date.now()}`;
    return {
      user: { id: guestId, name: 'Guest Visitor', email: `${guestId}@atelier.local` },
      token: `guest-session-${guestId}`,
    };
  },

  register: async (
    name: string,
    email: string,
    password: string,
    gender: string,
    mobile: string,
    address: string,
    city: string,
    state?: string
  ): Promise<{ user: User; token: string }> => {
    const accounts = await loadAccounts();

    if (isEmailRegistered(email, accounts)) {
      throw new Error('An account with this email address already exists.');
    }

    const { account, cleanEmail } = buildNewAccount(name, email, password, gender, mobile, address, city, state);
    accounts[cleanEmail] = account;
    await storage.setItem(REGISTERED_USERS_KEY, accounts);

    return {
      user: account.user,
      token: `mock-jwt-token-${account.user.id}`,
    };
  },
};
