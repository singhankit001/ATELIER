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
      const token = await storage.getItem<string>('AUTH_TOKEN');
      const user = await storage.getItem<User>('AUTH_USER');
      
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
