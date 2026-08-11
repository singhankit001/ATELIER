import { z } from 'zod';

/** Pure validation — see registerSchema.ts for why this lives outside the screen file. */
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
