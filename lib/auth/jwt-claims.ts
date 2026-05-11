import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyOptions } from 'jose';

export type JwtCustomClaims = {
  role: string | null;
  admin_tier: string | null;
  vendor_approval_status: string | null;
};

type VerifyFn = (
  jwt: string | Uint8Array,
  key: unknown,
  options?: JWTVerifyOptions
) => Promise<{ payload: JWTPayload }>;

type JwksFactoryFn = (url: URL) => unknown;

export async function getCustomClaimsFromSupabaseJwt(
  token: string,
  options?: {
    supabaseUrl?: string;
    publishableKey?: string;
    verify?: VerifyFn;
    createJwks?: JwksFactoryFn;
  }
): Promise<JwtCustomClaims> {
  const supabaseUrl = options?.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = options?.publishableKey ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  const jwksFactory = options?.createJwks ?? ((url: URL) => createRemoteJWKSet(url));
  const verify = options?.verify ?? ((jwt: string | Uint8Array, key: unknown, verifyOptions?: JWTVerifyOptions) => jwtVerify(jwt, key as never, verifyOptions));

  const jwksUrl = new URL('/auth/v1/.well-known/jwks.json', supabaseUrl);
  const jwks = jwksFactory(jwksUrl);
  const issuer = supabaseUrl.replace(/\/+$/, '') + '/auth/v1';

  const verified = await verify(token, jwks, {
    issuer,
    audience: 'authenticated',
  });

  const claimsSource = verified.payload.app_metadata as { custom_claims?: Partial<JwtCustomClaims> } | undefined;
  const customClaims = claimsSource?.custom_claims;

  return {
    role: customClaims?.role ?? null,
    admin_tier: customClaims?.admin_tier ?? null,
    vendor_approval_status: customClaims?.vendor_approval_status ?? null,
  };
}
