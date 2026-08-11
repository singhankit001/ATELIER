import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from './useThemeStore';

/**
 * Guards against the exact bug this store previously had: `setMode()`
 * always wrote THEME_MODE to AsyncStorage, but nothing ever called
 * `hydrate()` on launch (RootNavigator only hydrated auth + favorites),
 * so a user's Dark/Light choice silently reverted to System after every
 * restart despite genuinely being persisted. See useAuthStore.test.ts
 * for why resetting in-memory state and re-hydrating from the same
 * (mocked) AsyncStorage is a faithful proxy for a real app restart.
 */
const resetToColdBootState = () => {
  useThemeStore.setState({ mode: 'system', isHydrating: true });
};

describe('useThemeStore persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    resetToColdBootState();
  });

  it('a chosen theme mode survives a simulated restart', async () => {
    useThemeStore.getState().setMode('dark');
    await Promise.resolve(); // setMode persists fire-and-forget

    resetToColdBootState();
    expect(useThemeStore.getState().mode).toBe('system'); // confirms the reset actually took effect

    await useThemeStore.getState().hydrate();

    expect(useThemeStore.getState().mode).toBe('dark');
    expect(useThemeStore.getState().isHydrating).toBe(false);
  });

  it('a cold boot with nothing ever chosen defaults to system', async () => {
    await useThemeStore.getState().hydrate();

    expect(useThemeStore.getState().mode).toBe('system');
    expect(useThemeStore.getState().isHydrating).toBe(false);
  });

  it('switching mode twice and restarting keeps only the latest choice', async () => {
    useThemeStore.getState().setMode('dark');
    await Promise.resolve();
    useThemeStore.getState().setMode('light');
    await Promise.resolve();

    resetToColdBootState();
    await useThemeStore.getState().hydrate();

    expect(useThemeStore.getState().mode).toBe('light');
  });
});
