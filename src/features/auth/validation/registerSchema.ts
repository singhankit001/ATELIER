import { z } from 'zod';

/**
 * Pure validation — zero React Native / Expo imports, so it (and its
 * tests) can never be destabilized by a native-module mock going stale.
 * LoginScreen/RegisterScreen import from here rather than defining the
 * schema inline.
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  // `.describe()` sets JSON-schema metadata, not a validation error
  // message — using it here previously meant an empty gender field
  // surfaced Zod's raw "Invalid option: expected one of ..." message
  // instead of anything a user could act on.
  gender: z.enum(['male', 'female', 'other'], { error: 'Gender is required' }),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be exactly 10 digits'),
  city: z.string().min(1, 'Please select your city or search your current location'),
  state: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
