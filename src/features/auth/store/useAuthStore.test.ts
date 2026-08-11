import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './useAuthStore';

/**
 * Simulates "force close → reopen" the only way a Jest process can:
 * the store is a singleton, so a literal process restart isn't
 * available, but `hydrate()` reads from the exact same AsyncStorage keys
 * `login()`/`logout()` write to — so resetting in-memory state to what a
 * cold boot actually starts with (isAuthenticated: false, user: null,
 * isInitializing: true) and then calling hydrate() again exercises the
 * real persistence round-trip, not just each half of it in isolation.
 * This is strictly stronger evidence than reading the code, even though
 * it's not a substitute for an actual device force-close test.
 */
const resetToColdBootState = () => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isInitializing: true, isPortalActive: false });
};

describe('useAuthStore session persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    resetToColdBootState();
  });

  it('a logged-in session survives a simulated restart', async () => {
    await useAuthStore.getState().login(
      { id: '1', name: 'Ankit', email: 'ankit@example.com' },
      'mock-jwt-token-1'
    );
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Simulate the app process restarting: wipe in-memory state, keep storage.
    resetToColdBootState();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('ankit@example.com');
    expect(useAuthStore.getState().token).toBe('mock-jwt-token-1');
    expect(useAuthStore.getState().isInitializing).toBe(false);
  });

  it('logging out clears the session so a simulated restart lands on Login', async () => {
    await useAuthStore.getState().login(
      { id: '1', name: 'Ankit', email: 'ankit@example.com' },
      'mock-jwt-token-1'
    );
    await useAuthStore.getState().logout();

    resetToColdBootState();
    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('a cold boot with nothing ever persisted lands on Login, not stuck initializing', async () => {
    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isInitializing).toBe(false);
  });

  it('updateProfile persists across a simulated restart', async () => {
    await useAuthStore.getState().login(
      { id: '1', name: 'Ankit', email: 'ankit@example.com' },
      'mock-jwt-token-1'
    );
    await useAuthStore.getState().updateProfile({ city: 'Mumbai', mobile: '9876543210' });

    resetToColdBootState();
    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().user?.city).toBe('Mumbai');
    expect(useAuthStore.getState().user?.mobile).toBe('9876543210');
  });
});
