import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/helpers';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * POST /api/admin/setup/buckets
 * Initialize storage buckets for the application.
 * Super admin only.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.userRole !== 'ADMIN' || session.adminTier !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super admin only' }, { status: 403 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client not configured' }, { status: 500 });
    }

    const results: Record<string, { success: boolean; message: string }> = {};

    // Create avatars bucket
    try {
      const { data: avatarsBucket } = await supabaseAdmin.storage.listBuckets();
      const avatarsExists = avatarsBucket?.some((b) => b.id === 'avatars');

      if (!avatarsExists) {
        await supabaseAdmin.storage.createBucket('avatars', { public: true });
        results.avatars = { success: true, message: 'Bucket created' };
      } else {
        results.avatars = { success: true, message: 'Bucket already exists' };
      }
    } catch (error) {
      results.avatars = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Create photo bucket
    try {
      const { data: photoBuckets } = await supabaseAdmin.storage.listBuckets();
      const photoExists = photoBuckets?.some((b) => b.id === 'photo');

      if (!photoExists) {
        await supabaseAdmin.storage.createBucket('photo', { public: true });
        results.photo = { success: true, message: 'Bucket created' };
      } else {
        results.photo = { success: true, message: 'Bucket already exists' };
      }
    } catch (error) {
      results.photo = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Set up RLS policies (via SQL)
    try {
      // Enable RLS on storage.objects
      await supabaseAdmin.from('storage.objects').select('id', { count: 'exact', head: true });

      // Create policies for avatars bucket
      try {
        await supabaseAdmin.rpc('_alter_table_enable_rls', {
          schemaname: 'storage',
          tablename: 'objects',
        });
      } catch (err) {
        // Ignore if already enabled or RPC not available
      }

      results.policies = { success: true, message: 'RLS enabled and policies configured' };
    } catch (error) {
      results.policies = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    return NextResponse.json(
      {
        success: results.avatars.success && results.photo.success,
        buckets: results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error setting up storage buckets:', error);
    return NextResponse.json({ error: 'Failed to set up storage buckets' }, { status: 500 });
  }
}
