#!/usr/bin/env node
/**
 * Seed AdminAccount table with hardcoded admin credentials
 * Run: node scripts/seed-admins.js
 * Copy output and paste into Supabase SQL Editor
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Admins to seed (from HARDCODED_ADMINS)
const admins = [
  {
    email: 'super.admin@ghuri.local',
    phone: '+8801711111111',
    name: 'Super Administrator',
    password: process.env.ADMIN_SUPER_PASSWORD || 'SuperAdmin@2026#Secure',
    tier: 'SUPER_ADMIN',
  },
  {
    email: 'vendor.admin1@ghuri.local',
    phone: '+8801722222222',
    name: 'Vendor Administrator 1',
    password: process.env.ADMIN_VENDOR1_PASSWORD || 'VendorAdmin1@2026#Secure',
    tier: 'VENDOR_ADMIN',
  },
  {
    email: 'vendor.admin2@ghuri.local',
    phone: '+8801733333333',
    name: 'Vendor Administrator 2',
    password: process.env.ADMIN_VENDOR2_PASSWORD || 'VendorAdmin2@2026#Secure',
    tier: 'VENDOR_ADMIN',
  },
  {
    email: 'vendor.admin3@ghuri.local',
    phone: '+8801744444444',
    name: 'Vendor Administrator 3',
    password: process.env.ADMIN_VENDOR3_PASSWORD || 'VendorAdmin3@2026#Secure',
    tier: 'BASIC_ADMIN',
  },
  {
    email: 'vendor.admin4@ghuri.local',
    phone: '+8801755555555',
    name: 'Vendor Administrator 4',
    password: process.env.ADMIN_VENDOR4_PASSWORD || 'VendorAdmin4@2026#Secure',
    tier: 'BASIC_ADMIN',
  },
];

async function generateSQL() {
  console.log('-- Seed AdminAccount table with hardcoded admin credentials');
  console.log('-- Generated from: scripts/seed-admins.js\n');

  let sqlInserts = [];

  for (const admin of admins) {
    const passwordHash = await bcrypt.hash(admin.password, 12);
    const id = crypto.randomUUID(); // Generate CUID-style ID
    const now = new Date().toISOString();

    // Escape single quotes in values
    const escapedName = admin.name.replace(/'/g, "''");
    const escapedEmail = admin.email.replace(/'/g, "''");
    const escapedPhone = admin.phone ? admin.phone.replace(/'/g, "''") : null;

    const insertSQL = `INSERT INTO "public"."AdminAccount" ("id", "email", "name", "phone", "passwordHash", "tier", "createdAt", "updatedAt")
VALUES ('${id}', '${escapedEmail}', '${escapedName}', ${escapedPhone ? `'${escapedPhone}'` : 'NULL'}, '${passwordHash}', '${admin.tier}', '${now}', '${now}');`;

    sqlInserts.push(insertSQL);
    console.log(insertSQL);
  }

  console.log('\n-- Copy and paste the above SQL into Supabase SQL Editor');
  console.log('-- Then verify with: SELECT email, name, tier FROM "AdminAccount";');
}

generateSQL().catch(console.error);
