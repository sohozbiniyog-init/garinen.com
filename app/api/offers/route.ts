import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/lib/utils/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

const OFFER_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
const OFFER_SOURCES = ['VENDOR', 'ADMIN'] as const;

type OfferStatus = (typeof OFFER_STATUSES)[number];
type OfferSource = (typeof OFFER_SOURCES)[number];

const offerSelect = '*';

function isOfferStatus(value: string | null): value is OfferStatus {
  return Boolean(value && OFFER_STATUSES.includes(value as OfferStatus));
}

function isOfferSource(value: string | null): value is OfferSource {
  return Boolean(value && OFFER_SOURCES.includes(value as OfferSource));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sourceRole = searchParams.get('sourceRole');
    const vendorId = searchParams.get('vendorId');
    const featured = searchParams.get('featured');

    // Use cache for approved offers (most frequently accessed)
    if (!vendorId && status === 'APPROVED') {
      const cachedOffers = await cacheService.getOffers(
        async () => {
          if (!supabaseAdmin) {
            throw new Error('Supabase admin client is not configured');
          }

          let query = supabaseAdmin
            .from('Offer')
            .select(offerSelect)
            .eq('status', 'APPROVED')
            .order('createdAt', { ascending: false });

          if (isOfferSource(sourceRole)) {
            query = query.eq('sourceRole', sourceRole);
          }

          const { data, error } = await query;

          if (error) {
            throw error;
          }

          return data ?? [];
        },
        'APPROVED'
      );

      if (featured === 'true') {
        return NextResponse.json(cachedOffers);
      }
      return NextResponse.json(cachedOffers);
    }

    // For other queries, fetch fresh from database
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not configured');
    }

    let query = supabaseAdmin.from('Offer').select(offerSelect).order('createdAt', { ascending: false });

    if (isOfferStatus(status)) {
      query = query.eq('status', status);
    }

    if (isOfferSource(sourceRole)) {
      query = query.eq('sourceRole', sourceRole);
    }

    if (vendorId) {
      query = query.eq('vendorId', vendorId);
    }

    const { data: offers, error } = await query;

    if (error) {
      throw error;
    }

    if (featured === 'true') {
      return NextResponse.json((offers ?? []).filter((offer) => offer.status === 'APPROVED'));
    }

    return NextResponse.json(offers ?? []);
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendorId,
      vendorName,
      sourceRole = 'VENDOR',
      title,
      subtitle,
      description,
      discountLabel,
      ctaLabel,
      ctaHref,
      imageUrl,
      status,
    } = body;

    if (!vendorId || !vendorName || !title || !description || !discountLabel || !ctaHref) {
      return NextResponse.json(
        { error: 'Missing required fields: vendorId, vendorName, title, description, discountLabel, ctaHref' },
        { status: 400 }
      );
    }

    if (!isOfferSource(sourceRole)) {
      return NextResponse.json({ error: `Invalid sourceRole. Must be one of: ${OFFER_SOURCES.join(', ')}` }, { status: 400 });
    }

    if (status && !isOfferStatus(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${OFFER_STATUSES.join(', ')}` }, { status: 400 });
    }

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not configured');
    }

    const { data: offer, error } = await supabaseAdmin
      .from('Offer')
      .insert({
        vendorId,
        vendorName,
        sourceRole,
        title,
        subtitle: subtitle || null,
        description,
        discountLabel,
        ctaLabel: ctaLabel || 'View Offer',
        ctaHref,
        imageUrl: imageUrl || null,
        status: status || (sourceRole === 'ADMIN' ? 'APPROVED' : 'PENDING'),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Invalidate offers cache
    cacheService.invalidateOffers();

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
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

    if (typeof updates.vendorId === 'string') data.vendorId = updates.vendorId;
    if (typeof updates.vendorName === 'string') data.vendorName = updates.vendorName;
    if (typeof updates.title === 'string') data.title = updates.title;
    if (typeof updates.subtitle === 'string' || updates.subtitle === null) data.subtitle = updates.subtitle;
    if (typeof updates.description === 'string') data.description = updates.description;
    if (typeof updates.discountLabel === 'string') data.discountLabel = updates.discountLabel;
    if (typeof updates.ctaLabel === 'string') data.ctaLabel = updates.ctaLabel;
    if (typeof updates.ctaHref === 'string') data.ctaHref = updates.ctaHref;
    if (typeof updates.imageUrl === 'string' || updates.imageUrl === null) data.imageUrl = updates.imageUrl;
    if (typeof updates.status === 'string' && isOfferStatus(updates.status)) data.status = updates.status;
    if (typeof updates.sourceRole === 'string' && isOfferSource(updates.sourceRole)) data.sourceRole = updates.sourceRole;

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not configured');
    }

    const { data: updatedOffer, error } = await supabaseAdmin
      .from('Offer')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Invalidate offers cache
    cacheService.invalidateOffer(id);
    cacheService.invalidateOffers();

    return NextResponse.json(updatedOffer);
  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
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

    const { error } = await supabaseAdmin.from('Offer').delete().eq('id', id);

    if (error) {
      throw error;
    }

    // Invalidate offers cache
    cacheService.invalidateOffer(id);
    cacheService.invalidateOffers();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting offer:', error);
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
  }
}
