import { prisma } from '@/lib/db/prisma';
import { Prisma, User, Role } from '@prisma/client';
import { normalizeBangladeshPhone } from '@/lib/auth/phone';

export type UserRole = Role;
export type AdminTier = 'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN';
export type VendorApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type SyncUserProfileInput = {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  role: UserRole;
  adminTier?: AdminTier | null;
  vendorApprovalStatus?: VendorApprovalStatus | null;
  vendorOnboardingCreatedAt?: Date | null;
};

export async function syncUserProfile(input: SyncUserProfileInput): Promise<User> {
  const email = input.email?.trim().toLowerCase() || null;

  if (!email) {
    throw new Error('syncUserProfile requires an email');
  }

  const name = input.name?.trim() || email;
  const phone = input.phone ? normalizeBangladeshPhone(input.phone) : null;

  const profileData = {
    name,
    phone,
    role: input.role,
    adminTier: input.adminTier || undefined,
    vendorApprovalStatus: input.vendorApprovalStatus || undefined,
    vendorOnboardingCreatedAt: input.vendorOnboardingCreatedAt || undefined,
  };

  const upsertProfile = (includePhone: boolean) =>
    prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: profileData.name,
        ...(includePhone && phone ? { phone } : {}),
        role: profileData.role as Role,
        adminTier: profileData.adminTier,
        vendorApprovalStatus: profileData.vendorApprovalStatus,
        vendorOnboardingCreatedAt: profileData.vendorOnboardingCreatedAt as Date | null,
      },
      update: {
        name: profileData.name,
        ...(includePhone && phone ? { phone } : {}),
        role: profileData.role as Role,
        adminTier: profileData.adminTier,
        vendorApprovalStatus: profileData.vendorApprovalStatus,
        ...(profileData.vendorOnboardingCreatedAt ? { vendorOnboardingCreatedAt: profileData.vendorOnboardingCreatedAt as Date | null } : {}),
      },
      // return full user record
    });

  try {
    return await upsertProfile(true);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = error.meta?.target;
      const targets = Array.isArray(target) ? target.map(String) : typeof target === 'string' ? [target] : [];

      if (targets.includes('phone')) {
        return await upsertProfile(false);
      }
    }

    throw error;
  }
}