import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not configured');
    }

    let query = supabaseAdmin.from('Review').select('*').order('createdAt', { ascending: false });

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data: reviews, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(reviews ?? []);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, listingTitle, author, location, rating, content, featured = false } = body;

    if (!listingId || !listingTitle || !author || !location || !rating || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: listingId, listingTitle, author, location, rating, content' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not configured');
    }

    const { data: review, error } = await supabaseAdmin
      .from('Review')
      .insert({
        listingId,
        listingTitle,
        author,
        location,
        rating: Number(rating),
        content,
        featured: Boolean(featured),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body as Record<string, unknown>;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};

    if (typeof updates.listingId === 'string') data.listingId = updates.listingId;
    if (typeof updates.listingTitle === 'string') data.listingTitle = updates.listingTitle;
    if (typeof updates.author === 'string') data.author = updates.author;
    if (typeof updates.location === 'string') data.location = updates.location;
    if (typeof updates.content === 'string') data.content = updates.content;
    if (typeof updates.rating === 'number') data.rating = updates.rating;
    if (typeof updates.featured === 'boolean') data.featured = updates.featured;

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not configured');
    }

    const { data: updatedReview, error } = await supabaseAdmin
      .from('Review')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id query parameter' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not configured');
    }

    const { error } = await supabaseAdmin.from('Review').delete().eq('id', id);

    if (error) {
      throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}

