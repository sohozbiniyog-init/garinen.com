import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { createSupabaseRouteClient, jsonWithCookies, PendingCookie } from '@/lib/auth/route-helpers';
import { prisma } from '@/lib/db/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';
import bcryptjs from 'bcryptjs';
import { jwtDecode } from 'jwt-decode';

/**
 * Change password for authenticated users
 * Supports both regular users (Supabase Auth) and admin accounts (AdminAccount table)
 */
export async function POST(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      return jsonWithCookies({ error: 'Supabase is not configured' }, 500, pendingCookies);
    }

    const body = await request.json();
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return jsonWithCookies({ error: 'Current and new passwords are required' }, 400, pendingCookies);
    }

    // Validate new password strength (8+ chars, uppercase, lowercase, number, special char)
    if (newPassword.length < 8) {
      return jsonWithCookies({ error: 'New password must be at least 8 characters long' }, 400, pendingCookies);
    }

    if (!/[A-Z]/.test(newPassword)) {
      return jsonWithCookies({ error: 'New password must contain at least one uppercase letter' }, 400, pendingCookies);
    }

    if (!/[a-z]/.test(newPassword)) {
      return jsonWithCookies({ error: 'New password must contain at least one lowercase letter' }, 400, pendingCookies);
    }

    if (!/[0-9]/.test(newPassword)) {
      return jsonWithCookies({ error: 'New password must contain at least one number' }, 400, pendingCookies);
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return jsonWithCookies({ error: 'New password must contain at least one special character' }, 400, pendingCookies);
    }

    const supabase = createSupabaseRouteClient(request, pendingCookies);
    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data.user?.email) {
      return jsonWithCookies({ error: 'You must be signed in to change your password' }, 401, pendingCookies);
    }

    const userEmail = data.user.email;

    // Get JWT to check if user is admin
    const sessionData = await supabase.auth.getSession();
    let adminTier: string | null = null;

    if (sessionData.data.session?.access_token) {
      try {
        const decoded = jwtDecode<any>(sessionData.data.session.access_token);
        adminTier = decoded.app_metadata?.custom_claims?.admin_tier || null;
      } catch (err) {
        console.warn('Failed to decode JWT for password change:', err);
      }
    }

    // If user is an admin, verify against AdminAccount table
    if (adminTier) {
      const adminAccount = await prisma.adminAccount.findUnique({
        where: { email: userEmail.toLowerCase() },
        select: {
          id: true,
          passwordHash: true,
          email: true,
          name: true,
        },
      });

      if (!adminAccount) {
        return jsonWithCookies({ error: 'Admin account not found' }, 404, pendingCookies);
      }

      // Verify current password
      const passwordMatch = await bcryptjs.compare(currentPassword, adminAccount.passwordHash);
      if (!passwordMatch) {
        return jsonWithCookies({ error: 'Current password is incorrect' }, 400, pendingCookies);
      }

      // Hash new password
      const newPasswordHash = await bcryptjs.hash(newPassword, 12);

      // Update AdminAccount in Prisma
      await prisma.adminAccount.update({
        where: { id: adminAccount.id },
        data: { passwordHash: newPasswordHash },
      });

      // Update Supabase Auth password
      if (!supabaseAdmin) {
        return jsonWithCookies({ error: 'Supabase admin client is not configured' }, 500, pendingCookies);
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
        password: newPassword,
      });

      if (updateError) {
        return jsonWithCookies({ error: `Failed to update Supabase password: ${updateError.message}` }, 400, pendingCookies);
      }

      // Sign out all sessions
      await supabase.auth.signOut().catch(() => null);

      return jsonWithCookies(
        {
          success: true,
          message: 'Admin password updated successfully. Please sign in again with your new password.',
          requiresRelogin: true,
        },
        200,
        pendingCookies
      );
    }

    // For regular users, verify with Supabase Auth
    const verifier = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    const { error: verifyError } = await verifier.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (verifyError) {
      return jsonWithCookies({ error: 'Current password is incorrect' }, 400, pendingCookies);
    }

    // Update Supabase Auth password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return jsonWithCookies({ error: updateError.message }, 400, pendingCookies);
    }

    // Sign out all sessions
    await supabase.auth.signOut().catch(() => null);

    return jsonWithCookies(
      {
        success: true,
        message: 'Password updated successfully. Please sign in again with your new password.',
        requiresRelogin: true,
      },
      200,
      pendingCookies
    );
  } catch (error) {
    console.error('POST /api/auth/change-password error:', error);
    return jsonWithCookies({ error: 'Failed to change password' }, 500, pendingCookies);
  }
}

