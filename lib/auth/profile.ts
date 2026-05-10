import { prisma } from '@/lib/db/prisma';

export type UserRole = 'BUYER' | 'VENDOR' | 'ADMIN';
export type AdminTier = 'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN';
export type VendorApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type SyncUserProfileInput = {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  role: UserRole;
  adminTier?: AdminTier | null;
  vendorApprovalStatus?: VendorApprovalStatus | null;
};

export async function syncUserProfile(input: SyncUserProfileInput) {
  const email = input.email?.trim().toLowerCase() || null;

  if (!email) {
    throw new Error('syncUserProfile requires an email');
  }

  const name = input.name?.trim() || email;

  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      phone: input.phone?.trim() || undefined,
      role: input.role,
      adminTier: input.adminTier || undefined,
      vendorApprovalStatus: input.vendorApprovalStatus || undefined,
    },
    update: {
      name,
      phone: input.phone?.trim() || undefined,
      role: input.role,
      adminTier: input.adminTier || undefined,
      vendorApprovalStatus: input.vendorApprovalStatus || undefined,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      adminTier: true,
      vendorApprovalStatus: true,
    },
  });
}