import { loginSchema } from './loginSchema';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'ankit@example.com', password: 'secret6' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret6' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please enter a valid email address');
    }
  });

  it('rejects a password under 6 characters', () => {
    const result = loginSchema.safeParse({ email: 'ankit@example.com', password: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty form entirely', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toEqual(expect.arrayContaining(['email', 'password']));
    }
  });
});
