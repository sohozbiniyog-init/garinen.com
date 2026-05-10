import { prisma } from '@/lib/db/prisma';
import { verifyHardcodedAdmin } from '@/lib/auth/hardcoded-admins';
import bcryptjs from 'bcryptjs';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  tier: 'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN';
}

/**
 * Verify admin credentials against hardcoded admins (bootstrap) or AdminAccount table
 * Checks hardcoded admins first (for initial setup), then the AdminAccount table
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  try {
    // 1. Check hardcoded admins first (for bootstrap/initial access)
    const hardcodedAdmin = verifyHardcodedAdmin(email.toLowerCase(), password);
    if (hardcodedAdmin) {
      return {
        id: `hardcoded-${email}`, // Synthetic ID for hardcoded admins
        email: hardcodedAdmin.email,
        name: hardcodedAdmin.name,
        tier: hardcodedAdmin.tier,
      };
    }

    // 2. Check AdminAccount table (for dynamically created admins)
    const adminAccount = await prisma.adminAccount.findUnique({
      where: { email: email.toLowerCase() },
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

    // Compare password with bcrypt hash
    const passwordMatch = await bcryptjs.compare(password, adminAccount.passwordHash);

    if (!passwordMatch) {
      return null;
    }

    // Return admin details
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
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        role: true,
        adminTier: true
      }
    });

    if (!user || user.role !== 'ADMIN' || !user.adminTier) {
      return null;
    }

    return user.adminTier;
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
