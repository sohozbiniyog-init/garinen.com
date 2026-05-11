import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createSupabaseRouteClient, jsonWithCookies, type PendingCookie } from '@/lib/auth/route-helpers';
import { normalizeBangladeshPhone } from '@/lib/auth/phone';
import { PROFESSION_VALUES, sanitizeProfession, type ProfessionType } from '@/lib/professions';

function sanitizeName(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const value = input.trim().replace(/\s+/g, ' ');
  if (!value) return null;
  if (value.length < 2 || value.length > 80) return null;
  return value;
}

function profileSelect() {
  return {
    id: true,
    email: true,
    name: true,
    phone: true,
    profession: true,
  } as const;
}

export async function GET(request: NextRequest) {
  try {
    const pendingCookies: PendingCookie[] = [];
    const supabase = createSupabaseRouteClient(request, pendingCookies);

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    const profile = await prisma.user.findUnique({
      where: { email: data.user.email },
      select: profileSelect(),
    });

    if (!profile) {
      return jsonWithCookies({ error: 'Profile not found' }, 404, pendingCookies);
    }

    return jsonWithCookies({ profile }, 200, pendingCookies);
  } catch (err) {
    console.error('GET /api/auth/profile error:', err);
    return jsonWithCookies({ error: 'Failed to load profile' }, 500, []);
  }
}

export async function PATCH(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];

  try {
    const supabase = createSupabaseRouteClient(request, pendingCookies);
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user?.email) {
      return jsonWithCookies({ error: 'Unauthorized' }, 401, pendingCookies);
    }

    const body = await request.json();
    const name = sanitizeName(body?.name);
    const profession = sanitizeProfession(body?.profession);
    const normalizedPhone = body?.phone ? normalizeBangladeshPhone(String(body.phone)) : null;

    if (!name) {
      return jsonWithCookies({ error: 'Please provide a valid name.' }, 400, pendingCookies);
    }

    if (body?.phone && !normalizedPhone) {
      return jsonWithCookies({ error: 'Please provide a valid Bangladesh mobile number.' }, 400, pendingCookies);
    }

    if (body?.profession && !profession) {
      return jsonWithCookies({ error: 'Please select a valid profession.' }, 400, pendingCookies);
    }

    const current = await prisma.user.findUnique({
      where: { email: data.user.email },
      select: { id: true, phone: true },
    });

    if (!current) {
      return jsonWithCookies({ error: 'Profile not found' }, 404, pendingCookies);
    }

    if (normalizedPhone && normalizedPhone !== current.phone) {
      const phoneOwner = await prisma.user.findFirst({
        where: {
          phone: normalizedPhone,
          id: { not: current.id },
        },
        select: { id: true },
      });

      if (phoneOwner) {
        return jsonWithCookies({ error: 'Unable to save profile with this phone number.' }, 409, pendingCookies);
      }
    }

    const updated = await prisma.user.update({
      where: { email: data.user.email },
      data: {
        name,
        phone: normalizedPhone,
        profession: (profession || null) as any,
      },
      select: profileSelect(),
    });

    return jsonWithCookies({ message: 'Profile updated successfully.', profile: updated }, 200, pendingCookies);
  } catch (err) {
    console.error('PATCH /api/auth/profile error:', err);
    return jsonWithCookies({ error: 'Failed to update profile' }, 500, pendingCookies);
  }
}
