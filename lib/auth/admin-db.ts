import bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  tier: 'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN';
}

/**
 * Verify admin credentials against AdminAccount table (source of truth).
 * All admin credentials are stored in AdminAccount with bcrypt-hashed passwords.
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  try {
    const normalizedEmail = email.toLowerCase();

    // Check AdminAccount table for the admin record
    const adminAccount = await prisma.adminAccount.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        tier: true,
      },
    });

    if (!adminAccount) {
      return null;
    }

    const passwordMatch = await bcryptjs.compare(password, adminAccount.passwordHash);

    if (!passwordMatch) {
      return null;
    }

    return {
      id: adminAccount.id,
      email: adminAccount.email,
      name: adminAccount.name,
      tier: adminAccount.tier,
    };
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return null;
  }
}

/**
 * Check if a user is an admin and return their tier
 */
export async function getAdminTier(
  email: string
): Promise<'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN' | null> {
  try {
    // Prefer AdminAccount as the source-of-truth for admin tier
    const admin = await prisma.adminAccount.findUnique({
      where: { email: email.toLowerCase() },
      select: { tier: true },
    });

    if (!admin || !admin.tier) return null;
    return admin.tier;
  } catch (error) {
    console.error('Error getting admin tier:', error);
    return null;
  }
}

/**
 * Check if admin has permission to assign other admins
 * Only SUPER_ADMIN can do this
 */
export function canAssignAdmins(tier: string): boolean {
  return tier === 'SUPER_ADMIN';
}

/**
 * Check if admin can approve vendor listings
 * SUPER_ADMIN and VENDOR_ADMIN can do this
 */
export function canApproveVendors(tier: string): boolean {
  return tier === 'SUPER_ADMIN' || tier === 'VENDOR_ADMIN';
}
