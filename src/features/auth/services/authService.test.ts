import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './authService';

/**
 * Unlike authLogic.test.ts (pure functions, no I/O), this exercises the
 * real authService against the mocked AsyncStorage from jest.setup.js —
 * i.e. it proves registration actually persists a user that a later
 * login can read back, not just that the pure resolution logic is
 * correct in isolation.
 */
describe('authService (integration, mocked AsyncStorage)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('registers a new account and persists it — a subsequent login succeeds against the same credentials', async () => {
    const { user } = await authService.register(
      'Ankit Singh', 'ankit@example.com', 'secret6', 'male', '9876543210', '221B Baker Street', 'Pune', 'Maharashtra'
    );
    expect(user.email).toBe('ankit@example.com');

    const loginResult = await authService.login('ankit@example.com', 'secret6');
    expect(loginResult.user.id).toBe(user.id);
    expect(loginResult.user.name).toBe('Ankit Singh');
  });

  it('rejects registering the same email twice', async () => {
    await authService.register('First User', 'dup@example.com', 'secret6', 'male', '9876543210', 'Addr', 'City', 'State');

    await expect(
      authService.register('Second User', 'dup@example.com', 'secret6', 'female', '9876543210', 'Addr', 'City', 'State')
    ).rejects.toThrow('An account with this email address already exists.');
  });

  it('rejects the duplicate check case/whitespace-insensitively', async () => {
    await authService.register('First User', 'case@example.com', 'secret6', 'male', '9876543210', 'Addr', 'City', 'State');

    await expect(
      authService.register('Second User', '  Case@Example.com  ', 'secret6', 'female', '9876543210', 'Addr', 'City', 'State')
    ).rejects.toThrow('An account with this email address already exists.');
  });

  it('rejects login with a registered email but the wrong password', async () => {
    await authService.register('Ankit Singh', 'wrongpw@example.com', 'secret6', 'male', '9876543210', 'Addr', 'City', 'State');

    await expect(authService.login('wrongpw@example.com', 'not-the-password')).rejects.toThrow(
      'Invalid email or password. Please check your credentials.'
    );
  });

  it('rejects login for an email that was never registered', async () => {
    await expect(authService.login('nobody@example.com', 'anything')).rejects.toThrow(
      'Invalid email or password. Please check your credentials.'
    );
  });

  it('still allows the seed account to log in even with other accounts registered', async () => {
    await authService.register('Someone', 'someone@example.com', 'secret6', 'male', '9876543210', 'Addr', 'City', 'State');
    const { user } = await authService.login('test@example.com', 'password');
    expect(user.email).toBe('test@example.com');
  });

  it('loginAsGuest issues a local session without persisting or touching the registered-accounts registry', async () => {
    const before = await AsyncStorage.getItem('REGISTERED_ACCOUNTS_REGISTRY');
    const { user, token } = await authService.loginAsGuest();
    const after = await AsyncStorage.getItem('REGISTERED_ACCOUNTS_REGISTRY');

    expect(user.name).toBe('Guest Visitor');
    expect(token).toContain('guest-session-');
    expect(after).toBe(before); // untouched
  });
});
