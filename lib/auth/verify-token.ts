import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

type SupabaseCustomClaims = {
  role?: string
  admin_tier?: string
  vendor_approval_status?: string
}

type SupabaseAppMetadata = {
  custom_claims?: SupabaseCustomClaims
}

export type SupabaseJwtPayload = JWTPayload & {
  email?: string
  app_metadata?: SupabaseAppMetadata
}

export async function verifySupabaseAccessToken(token: string): Promise<SupabaseJwtPayload> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !publishable) {
    throw new Error('Supabase environment variables are not configured')
  }

  const jwksUrl = new URL('/auth/v1/.well-known/jwks.json', supabaseUrl)
  const JWKS = createRemoteJWKSet(jwksUrl)
  const issuer = supabaseUrl.replace(/\/+$/, '') + '/auth/v1'

  const verified = await jwtVerify(token, JWKS, {
    issuer,
    audience: 'authenticated',
  })

  return verified.payload as SupabaseJwtPayload
}
