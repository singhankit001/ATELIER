import { z } from 'zod';

/** Pure validation — see auth/validation/registerSchema.ts for why this lives outside the screen file. */
export const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  // Optional (a returning patron may not want to add this here), but if
  // they do enter something it has to meet the same bar registration
  // enforces — otherwise a save here could silently downgrade an already
  // valid mobile number, or store one that was never actually valid.
  mobile: z.string().optional().refine(
    (v) => !v || /^\d{10}$/.test(v),
    'Mobile must be exactly 10 digits'
  ),
  gender: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
