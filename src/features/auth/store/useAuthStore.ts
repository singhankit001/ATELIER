import { create } from 'zustand';
import { storage } from '../../../core/storage/storage';

export interface User {
  id: string;
  name: string;
  email: string;
  gender?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isPortalActive: boolean;
  setPortalActive: (active: boolean) => void;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitializing: false,
  isPortalActive: false,

  setPortalActive: (active: boolean) => set({ isPortalActive: active }),
  
  /**
   * Auth state updates immediately and unconditionally — the screen
   * transition (isPortalActive) is a purely visual signal layered on top,
   * never a gate on authentication itself. See AuthTransitionOverlay: it
   * owns clearing isPortalActive once its own animation (or failsafe
   * timeout) completes, so a stalled animation can never trap the user.
   */
  login: async (user, token) => {
    await storage.setItem('AUTH_TOKEN', token);
    await storage.setItem('AUTH_USER', user);
    set({ user, token, isAuthenticated: true, isPortalActive: true });
  },
  
  logout: async () => {
    await storage.removeItem('AUTH_TOKEN');
    await storage.removeItem('AUTH_USER');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateProfile: async (updatedData) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedData };
      storage.setItem('AUTH_USER', newUser).catch(console.error);
      return { user: newUser };
    });
  },
  
  hydrate: async () => {
    try {
      const hydrationPromise = (async () => {
        const token = await storage.getItem<string>('AUTH_TOKEN');
        const user = await storage.getItem<User>('AUTH_USER');
        return { token, user };
      })();

      // A pure failsafe against a genuinely hung read — not a normal-path
      // timing budget. AsyncStorage reads are typically single-digit ms,
      // but a real device under load can occasionally take longer than a
      // couple hundred ms; a tight timeout here doesn't speed up the
      // common case, it just risks silently logging out a valid session
      // and showing Login instead of Home. 3s is long enough to never
      // fire in practice while still guaranteeing the app can't hang
      // on the loading spinner forever.
      const timeoutPromise = new Promise<{ token: null; user: null }>((_, reject) => {
        setTimeout(() => reject(new Error('Hydration timeout exceeded 3000ms')), 3000);
      });

      const { token, user } = await Promise.race([hydrationPromise, timeoutPromise]);
      if (token && user) {
        set({ token, user, isAuthenticated: true, isInitializing: false });
      } else {
        set({ isInitializing: false });
      }
    } catch (e) {
      set({ isInitializing: false });
    }
  },
}));
