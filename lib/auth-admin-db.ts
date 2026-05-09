import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  tier: 'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN';
}

/**
 * Verify admin credentials against the database
 * Validates email + password and returns admin details if successful
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        adminTier: true,
        vendorInfo: true
      }
    });

    // Check if user exists and is an admin
    if (!user || user.role !== 'ADMIN' || !user.adminTier) {
      return null;
    }

    // Extract stored password hash from vendorInfo
    // NOTE: In production, use a separate adminCredentials table
    let storedPasswordHash: string | null = null;
    if (user.vendorInfo && typeof user.vendorInfo === 'object') {
      const info = user.vendorInfo as Record<string, unknown>;
      storedPasswordHash = info.passwordHash as string | null;
    }

    // If no hash found, this admin was not seeded with a password
    if (!storedPasswordHash) {
      console.warn(`Admin ${email} has no password hash stored`);
      return null;
    }

    // Compare password with bcrypt hash
    const passwordMatch = await bcryptjs.compare(password, storedPasswordHash);

    if (!passwordMatch) {
      return null;
    }

    // Return admin details
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.adminTier
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
