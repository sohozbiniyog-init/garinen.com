import { z } from 'zod';

export const requestFeatureSchema = z.object({
  listingId: z.string().trim().min(1, 'Listing ID is required'),
  sourceRole: z.enum(['VENDOR', 'ADMIN']).default('VENDOR'),
});

export const approveFeatureSchema = z.object({
  id: z.string().trim().min(1, 'Feature request ID is required'),
  status: z.enum(['APPROVED', 'REJECTED']),
  approverMessage: z.string().optional(),
});

export const reorderFeaturesSchema = z.object({
  orders: z.record(z.string(), z.number()).describe('Map of featureId -> displayOrder'),
});

export type RequestFeatureInput = z.infer<typeof requestFeatureSchema>;
export type ApproveFeatureInput = z.infer<typeof approveFeatureSchema>;
export type ReorderFeaturesInput = z.infer<typeof reorderFeaturesSchema>;
