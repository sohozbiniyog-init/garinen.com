import bcryptjs from 'bcryptjs';

type AdminTier = 'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN';

export interface HardcodedAdmin {
  email: string;
  phone?: string;
  name: string;
  password: string;
  tier: AdminTier;
  description: string;
}

/**
 * Hardcoded admin users for bootstrap access ONLY
 * Passwords are loaded from environment variables for security
 * In production, these should be migrated to AdminAccount table and disabled
 * 
 * Required environment variables:
 * ADMIN_SUPER_EMAIL, ADMIN_SUPER_PASSWORD
 * ADMIN_VENDOR1_EMAIL, ADMIN_VENDOR1_PASSWORD
 * ADMIN_VENDOR2_EMAIL, ADMIN_VENDOR2_PASSWORD
 */
export const HARDCODED_ADMINS: HardcodedAdmin[] = [
  {
    email: process.env.ADMIN_SUPER_EMAIL || 'super.admin@ghuri.local',
    phone: '+8801711111111',
    name: 'Super Administrator',
    password: process.env.ADMIN_SUPER_PASSWORD || '',
    tier: 'SUPER_ADMIN',
    description: 'Full admin access - can add admins and manage vendors (BOOTSTRAP ONLY)'
  },
  {
    email: process.env.ADMIN_VENDOR1_EMAIL || 'vendor.admin1@ghuri.local',
    phone: '+8801722222222',
    name: 'Vendor Administrator 1',
    password: process.env.ADMIN_VENDOR1_PASSWORD || '',
    tier: 'VENDOR_ADMIN',
    description: 'Can only manage vendor assignments (BOOTSTRAP ONLY)'
  },
  {
    email: process.env.ADMIN_VENDOR2_EMAIL || 'vendor.admin2@ghuri.local',
    phone: '+8801733333333',
    name: 'Vendor Administrator 2',
    password: process.env.ADMIN_VENDOR2_PASSWORD || '',
    tier: 'BASIC_ADMIN',
    description: 'Can only manage vendor assignments (BOOTSTRAP ONLY)'
  }
];

/**
 * Check if credentials match a hardcoded admin
 * Returns the admin details if matched, null otherwise
 */
export function verifyHardcodedAdmin(
  identifier: string,
  password: string
): HardcodedAdmin | null {
  const admin = HARDCODED_ADMINS.find(
    (a) => a.email === identifier
  );

  if (!admin) {
    return null;
  }

  // Simple password comparison (in production, use bcrypt)
  if (admin.password === password) {
    return admin;
  }

  return null;
}

/**
 * Check if an identifier belongs to a hardcoded admin
 */
export function isHardcodedAdmin(identifier: string): HardcodedAdmin | undefined {
  return HARDCODED_ADMINS.find(
    (a) => a.email === identifier
  );
}

/**
 * Get all hardcoded admin identifiers (emails only)
 */
export function getHardcodedAdminIdentifiers(): Set<string> {
  const identifiers = new Set<string>();
  HARDCODED_ADMINS.forEach((admin) => {
    identifiers.add(admin.email);
  });
  return identifiers;
}
