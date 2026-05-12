import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/auth/route-helpers'
import type { PendingCookie } from '@/lib/auth/route-helpers'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const pendingCookies: PendingCookie[] = []
    const supabase = createSupabaseRouteClient(request, pendingCookies)

    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      return NextResponse.json({ user: null, claims: null }, { status: 200 })
    }

    try {
      // Fetch user profile from database to get accurate role/claims
      const profile = await prisma.user.findUnique({
        where: { email: user.email ?? '' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatarUrl: true,
          role: true,
          adminTier: true,
          vendorApprovalStatus: true,
          vendorOnboardingCreatedAt: true,
          profession: true,
        },
      })

      if (!profile) {
        // User exists in Supabase but not in our database (new signup)
        return NextResponse.json(
          {
            user,
            profile,
            claims: {
              role: 'BUYER',
              admin_tier: null,
              vendor_approval_status: null,
              vendor_onboarding_created_at: null,
            },
          },
          { status: 200 }
        )
      }

      // Return claims based on database profile
      return NextResponse.json(
        {
          user,
          profile,
          claims: {
            role: profile.role || 'BUYER',
            admin_tier: profile.adminTier || null,
            vendor_approval_status: profile.vendorApprovalStatus || null,
            vendor_onboarding_created_at: profile.vendorOnboardingCreatedAt ? profile.vendorOnboardingCreatedAt.toISOString() : null,
          },
        },
        { status: 200 }
      )
    } catch (err) {
      console.warn('Failed to fetch user profile in /api/auth/me:', err)
      // Fall back to basic user info if database query fails
      return NextResponse.json(
        {
          user,
          profile: null,
          claims: {
            role: 'BUYER',
            admin_tier: null,
            vendor_approval_status: null,
            vendor_onboarding_created_at: null,
          },
        },
        { status: 200 }
      )
    }
  } catch (err) {
    console.error('GET /api/auth/me error:', err)
    return NextResponse.json({ error: 'Failed to get auth info' }, { status: 500 })
  }
}
