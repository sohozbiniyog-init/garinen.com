import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadPath = formData.get('uploadPath') as string;
    const userId = formData.get('userId') as string;

    if (!file || !uploadPath || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(uploadPath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(uploadPath);

    // Update user avatar in database (if using Prisma)
    // Note: You may need to adjust this based on your actual schema
    // This is a placeholder for database update logic
    
    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        path: uploadPath,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
