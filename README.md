# GariNen

Initial Next.js 15 scaffold for the GariNen rehaul.

## Start

1. Install dependencies.
2. Copy `.env.example` to `.env.local`.
3. Run `npm run dev`.

## Production Database Setup

1. In Supabase, copy the Session pooler connection string and set it as DATABASE_URL.
2. In Supabase, copy the Direct connection string and set it as DIRECT_URL.
3. Keep SUPABASE_SERVICE_ROLE_KEY server-side only and never expose it in NEXT_PUBLIC variables.
4. Run Prisma commands with DIRECT_URL available:
	- npx prisma generate
	- npx prisma migrate deploy
5. Deploy and verify with:
	- npm run build
	- API smoke checks for /api/offers and /api/reviews

## Current status

- Next.js app shell created.
- Landing page started.
- Prisma schema skeleton added.
- Route protection placeholder added.