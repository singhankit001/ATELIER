import { create } from 'zustand';
import { storage } from '../storage/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  isHydrating: boolean;
  setMode: (mode: ThemeMode) => void;
  hydrate: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  isHydrating: true,

  setMode: (mode) => {
    set({ mode });
    storage.setItem('THEME_MODE', mode).catch(console.error);
  },

  hydrate: async () => {
    try {
      const stored = await storage.getItem<ThemeMode>('THEME_MODE');
      if (stored) {
        set({ mode: stored, isHydrating: false });
      } else {
        set({ isHydrating: false });
      }
    } catch {
      set({ isHydrating: false });
    }
  }
}));
