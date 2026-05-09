type AdminTier = 'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN';

export interface HardcodedAdmin {
  email: string;
  phone?: string;
  name: string;
  password: string; // in production, use bcrypt hashing
  tier: AdminTier;
  description: string;
}

/**
 * Hardcoded admin users with service-role privileges
 * SUPER_ADMIN: Can add admins and assign vendors
 * VENDOR_ADMIN: Can only assign vendors
 * BASIC_ADMIN: Can only assign vendors (same as VENDOR_ADMIN)
 */
export const HARDCODED_ADMINS: HardcodedAdmin[] = [
  {
    email: 'super.admin@ghuri.local',
    phone: '+8801711111111',
    name: 'Super Administrator',
    password: 'SuperAdmin@2026#Secure',
    tier: 'SUPER_ADMIN',
    description: 'Full admin access - can add admins and manage vendors'
  },
  {
    email: 'vendor.admin1@ghuri.local',
    phone: '+8801722222222',
    name: 'Vendor Administrator 1',
    password: 'VendorAdmin@2026#Secure',
    tier: 'VENDOR_ADMIN',
    description: 'Can only manage vendor assignments'
  },
  {
    email: 'vendor.admin2@ghuri.local',
    phone: '+8801733333333',
    name: 'Vendor Administrator 2',
    password: 'VendorAdmin@2026#Secure',
    tier: 'BASIC_ADMIN',
    description: 'Can only manage vendor assignments'
  },
  {
    email: 'vendor.admin3@ghuri.local',
    phone: '+8801744444444',
    name: 'Vendor Administrator 3',
    password: 'VendorAdmin@2026#Secure',
    tier: 'BASIC_ADMIN',
    description: 'Can only manage vendor assignments'
  },
  {
    email: 'vendor.admin4@ghuri.local',
    phone: '+8801755555555',
    name: 'Vendor Administrator 4',
    password: 'VendorAdmin@2026#Secure',
    tier: 'BASIC_ADMIN',
    description: 'Can only manage vendor assignments'
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
