import { resolveLogin, isEmailRegistered, buildNewAccount, AccountsRegistry } from './authLogic';

const registeredAccounts: AccountsRegistry = {
  'ankit@example.com': {
    user: { id: '42', name: 'Ankit', email: 'ankit@example.com', city: 'Pune' },
    passwordHash: 'secret6',
  },
};

describe('resolveLogin', () => {
  it('logs in with the seed account', () => {
    const result = resolveLogin('test@example.com', 'password', {});
    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeTruthy();
  });

  it('rejects the seed account with the wrong password', () => {
    expect(() => resolveLogin('test@example.com', 'wrong', {})).toThrow(
      'Invalid email or password. Please check your credentials.'
    );
  });

  it('logs in with a registered account and the correct password', () => {
    const result = resolveLogin('ankit@example.com', 'secret6', registeredAccounts);
    expect(result.user.id).toBe('42');
  });

  it('rejects a registered account with the wrong password', () => {
    expect(() => resolveLogin('ankit@example.com', 'wrong-password', registeredAccounts)).toThrow(
      'Invalid email or password. Please check your credentials.'
    );
  });

  it('rejects an unknown email', () => {
    expect(() => resolveLogin('nobody@example.com', 'anything', registeredAccounts)).toThrow(
      'Invalid email or password. Please check your credentials.'
    );
  });

  it('normalizes email casing and surrounding whitespace before matching', () => {
    const result = resolveLogin('  ANKIT@Example.com  ', 'secret6', registeredAccounts);
    expect(result.user.id).toBe('42');
  });
});

describe('isEmailRegistered', () => {
  it('is true for the seed account email', () => {
    expect(isEmailRegistered('test@example.com', {})).toBe(true);
  });

  it('is true for a registered account, case/whitespace-insensitively', () => {
    expect(isEmailRegistered(' Ankit@EXAMPLE.com ', registeredAccounts)).toBe(true);
  });

  it('is false for an unregistered email', () => {
    expect(isEmailRegistered('nobody@example.com', registeredAccounts)).toBe(false);
  });
});

describe('buildNewAccount', () => {
  it('normalizes the email and carries every field through', () => {
    const { account, cleanEmail } = buildNewAccount(
      'New User',
      '  New.User@Example.com  ',
      'secret6',
      'female',
      '9876543210',
      '221B Baker Street',
      'Mumbai',
      'Maharashtra'
    );

    expect(cleanEmail).toBe('new.user@example.com');
    expect(account.passwordHash).toBe('secret6');
    expect(account.user).toMatchObject({
      name: 'New User',
      email: 'new.user@example.com',
      gender: 'female',
      mobile: '9876543210',
      address: '221B Baker Street',
      city: 'Mumbai',
      state: 'Maharashtra',
    });
    expect(account.user.id).toBeTruthy();
  });

  it('allows state to be omitted', () => {
    const { account } = buildNewAccount('N', 'n@example.com', 'secret6', 'other', '9876543210', 'Addr', 'City', undefined);
    expect(account.user.state).toBeUndefined();
  });
});
