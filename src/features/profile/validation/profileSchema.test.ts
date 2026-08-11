import { profileSchema } from './profileSchema';

const validPayload = {
  name: 'Ankit Singh',
  email: 'ankit@example.com',
  mobile: '9876543210',
  gender: 'Male',
  city: 'Pune',
  state: 'Maharashtra',
  address: 'MG Road, Pune',
};

describe('profileSchema', () => {
  it('accepts a fully valid profile edit', () => {
    expect(profileSchema.safeParse(validPayload).success).toBe(true);
  });

  it('accepts mobile/gender/city/state/address all omitted — only name/email are required on edit', () => {
    const { mobile, gender, city, state, address, ...rest } = validPayload;
    expect(profileSchema.safeParse(rest).success).toBe(true);
  });

  it('accepts an empty-string mobile (treated the same as omitted)', () => {
    const result = profileSchema.safeParse({ ...validPayload, mobile: '' });
    expect(result.success).toBe(true);
  });

  it('rejects a mobile under 10 digits — must match registration\'s bar, not silently accept less', () => {
    const result = profileSchema.safeParse({ ...validPayload, mobile: '987654321' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find((i) => i.path[0] === 'mobile')?.message).toBe(
        'Mobile must be exactly 10 digits'
      );
    }
  });

  it('rejects a mobile over 10 digits', () => {
    const result = profileSchema.safeParse({ ...validPayload, mobile: '98765432101' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-numeric mobile', () => {
    const result = profileSchema.safeParse({ ...validPayload, mobile: 'abcdefghij' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty name', () => {
    const result = profileSchema.safeParse({ ...validPayload, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = profileSchema.safeParse({ ...validPayload, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });
});
