import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';

export async function POST(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    // Get JWT from request to verify SUPER_ADMIN status
    const supabase = createSupabaseRouteClient(request, pendingCookies);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return jsonWithCookies({ error: 'Unauthorized: No session' }, 401, pendingCookies);
    }

    // Decode JWT to check admin tier
    const decoded = jwtDecode<any>(session.access_token);
    const adminTier = decoded.app_metadata?.custom_claims?.admin_tier;

    if (adminTier !== 'SUPER_ADMIN') {
      return jsonWithCookies({ error: 'Forbidden: Only SUPER_ADMIN can create admin accounts' }, 403, pendingCookies);
    }

    const currentAdminEmail = decoded.email;

    // Parse request body
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const tier = body.tier as string; // 'SUPER_ADMIN' or 'VENDOR_ADMIN'

    // Validation
    if (!email || !name || !password) {
      return jsonWithCookies({ error: 'Missing required fields: email, name, password' }, 400, pendingCookies);
    }

    if (!email.includes('@')) {
      return jsonWithCookies({ error: 'Invalid email format' }, 400, pendingCookies);
    }

    if (password.length < 8) {
      return jsonWithCookies({ error: 'Password must be at least 8 characters' }, 400, pendingCookies);
    }

    if (tier !== 'SUPER_ADMIN' && tier !== 'VENDOR_ADMIN') {
      return jsonWithCookies({ error: 'Invalid tier: must be SUPER_ADMIN or VENDOR_ADMIN' }, 400, pendingCookies);
    }

    // Check if email already exists
    const existingAdmin = await prisma.adminAccount.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return jsonWithCookies({ error: 'Admin account with this email already exists' }, 409, pendingCookies);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create AdminAccount in Prisma
    const newAdmin = await prisma.adminAccount.create({
      data: {
        email,
        name,
        phone: phone || undefined,
        passwordHash,
        tier: tier as any,
        createdBy: currentAdminEmail,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        tier: true,
        createdAt: true,
      },
    });

    // Create user in Supabase Auth
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: name,
            phone,
            admin_tier: tier,
          },
          app_metadata: {
            custom_claims: {
              role: 'ADMIN',
              admin_tier: tier,
            },
          },
        });
      } catch (authError: any) {
        // If Supabase creation fails but Prisma succeeded, delete the Prisma record
        await prisma.adminAccount.delete({ where: { id: newAdmin.id } });
        throw new Error(`Failed to create Supabase user: ${authError.message}`);
      }
    }

    return jsonWithCookies(
      {
        success: true,
        message: `${tier} account created successfully`,
        admin: newAdmin,
      },
      201,
      pendingCookies
    );
  } catch (error) {
    console.error('POST /api/admin/create-admin error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create admin account';
    return jsonWithCookies({ error: errorMessage }, 500, pendingCookies);
  }
}

