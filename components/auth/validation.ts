import { z } from 'zod';

export const authSchema = z
  .object({
    mode: z.enum(['signin', 'signup']),
    email: z.string().trim().email('Please enter a valid email address.').max(255),

    name: z.string().trim().max(120).optional(),

    phone: z.string().trim().max(30).optional(),

    password: z.string().min(8, 'Password must be at least 8 characters.').max(128, 'Password is too long.'),

    confirmPassword: z.string().optional(),

    isVendor: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'signup') {
      if (!data.name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['name'],
          message: 'Please enter your name.',
        });
      }

      if (!data.phone?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone'],
          message: 'Please enter your phone number.',
        });
      }

      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: 'Passwords do not match.',
        });
      }
    }
  });

export type AuthFormValues = z.infer<typeof authSchema>;
