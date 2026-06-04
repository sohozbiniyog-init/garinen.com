import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

interface AdminSeedData {
  email: string;
  phone: string;
  name: string;
  password: string;
  tier: 'SUPER_ADMIN' | 'VENDOR_ADMIN' | 'BASIC_ADMIN';
  description: string;
}

/**
 * 5 Admin credentials for initial setup
 * These will be seeded into the database with bcrypt-hashed passwords
 * NOTE: Keep this synchronized with your secure credential management
 * ROTATION: These should be rotated when reset-password and change-password are implemented
 */
const ADMIN_SEEDS: AdminSeedData[] = [
  {
    email: 'super.admin@ghuri.local',
    phone: '+8801711111111',
    name: 'Super Administrator',
    password: requireEnv('ADMIN_SUPER_PASSWORD'),
    tier: 'SUPER_ADMIN',
    description: 'Full admin access - can add admins and manage vendors'
  },
  {
    email: 'vendor.admin1@ghuri.local',
    phone: '+8801722222222',
    name: 'Vendor Administrator 1',
    password: requireEnv('ADMIN_VENDOR1_PASSWORD'),
    tier: 'VENDOR_ADMIN',
    description: 'Can only manage vendor assignments'
  },
  {
    email: 'vendor.admin2@ghuri.local',
    phone: '+8801733333333',
    name: 'Vendor Administrator 2',
    password: requireEnv('ADMIN_VENDOR2_PASSWORD'),
    tier: 'BASIC_ADMIN',
    description: 'Can only manage vendor assignments'
  },
  {
    email: 'vendor.admin3@ghuri.local',
    phone: '+8801744444444',
    name: 'Vendor Administrator 3',
    password: requireEnv('ADMIN_VENDOR3_PASSWORD'),
    tier: 'BASIC_ADMIN',
    description: 'Can only manage vendor assignments'
  },
  {
    email: 'vendor.admin4@ghuri.local',
    phone: '+8801755555555',
    name: 'Vendor Administrator 4',
    password: requireEnv('ADMIN_VENDOR4_PASSWORD'),
    tier: 'BASIC_ADMIN',
    description: 'Can only manage vendor assignments'
  }
];

async function main() {
  console.log('🌱 Starting admin seed...');

  for (const adminData of ADMIN_SEEDS) {
    try {
      // Check if admin already exists
      const existing = await prisma.user.findUnique({
        where: { email: adminData.email }
      });

      if (existing) {
        console.log(`⏭️  Admin ${adminData.email} already exists, skipping...`);
        continue;
      }

      // Hash password with bcrypt (10 rounds)
      const hashedPassword = await bcryptjs.hash(adminData.password, 10);

      // Create admin user
      const admin = await prisma.user.create({
        data: {
          email: adminData.email,
          phone: adminData.phone,
          name: adminData.name,
          role: 'ADMIN',
          adminTier: adminData.tier,
          vendorInfo: {
            description: adminData.description,
            passwordHash: hashedPassword, // Store bcrypt hash
            seedPassword: true, // Mark that this was seeded
            createdAt: new Date().toISOString()
          }
        }
      });

      console.log(`✅ Seeded admin: ${admin.email} (${adminData.tier})`);
    } catch (error) {
      console.error(`❌ Failed to seed admin ${adminData.email}:`, error);
    }
  }

  console.log('✨ Admin seed complete!');
}

main()
  .catch((error) => {
    console.error('Fatal seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
