import { registerSchema } from './registerSchema';

const validPayload = {
  name: 'Ankit Singh',
  email: 'ankit@example.com',
  gender: 'male' as const,
  mobile: '9876543210',
  city: 'Pune',
  state: 'Maharashtra',
  address: 'MG Road, Pune',
  password: 'secret6',
  confirmPassword: 'secret6',
};

describe('registerSchema', () => {
  it('accepts a fully valid registration', () => {
    const result = registerSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects a completely empty form with per-field errors', () => {
    const result = registerSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toEqual(
        expect.arrayContaining(['name', 'email', 'gender', 'mobile', 'city', 'address', 'password'])
      );
    }
  });

  it('rejects an empty full name', () => {
    const result = registerSchema.safeParse({ ...validPayload, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find((i) => i.path[0] === 'name')?.message).toBe('Name is required');
    }
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ ...validPayload, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find((i) => i.path[0] === 'email')?.message).toBe('Invalid email address');
    }
  });

  it('rejects a 9-digit mobile number', () => {
    const result = registerSchema.safeParse({ ...validPayload, mobile: '987654321' });
    expect(result.success).toBe(false);
  });

  it('rejects an 11-digit mobile number', () => {
    const result = registerSchema.safeParse({ ...validPayload, mobile: '98765432101' });
    expect(result.success).toBe(false);
  });

  it('rejects an alphabetic mobile number', () => {
    const result = registerSchema.safeParse({ ...validPayload, mobile: 'abcdefghij' });
    expect(result.success).toBe(false);
  });

  it('rejects a password under 6 characters', () => {
    const result = registerSchema.safeParse({ ...validPayload, password: '123', confirmPassword: '123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find((i) => i.path[0] === 'password')?.message).toBe(
        'Password must be at least 6 characters'
      );
    }
  });

  it('rejects a mismatched confirm password, attached to the confirmPassword field', () => {
    const result = registerSchema.safeParse({ ...validPayload, confirmPassword: 'different' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'confirmPassword');
      expect(issue?.message).toBe("Passwords don't match");
    }
  });

  it('rejects a missing gender with a human-readable message (not the raw enum dump)', () => {
    const { gender, ...rest } = validPayload;
    const result = registerSchema.safeParse(rest);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'gender');
      expect(issue?.message).toBe('Gender is required');
      expect(issue?.message).not.toMatch(/invalid option/i);
    }
  });

  it('rejects a missing city', () => {
    const result = registerSchema.safeParse({ ...validPayload, city: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing address', () => {
    const result = registerSchema.safeParse({ ...validPayload, address: '' });
    expect(result.success).toBe(false);
  });

  it('treats state as optional', () => {
    const { state, ...rest } = validPayload;
    const result = registerSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });
});
