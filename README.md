# GariNen — Automobile E-Commerce Platform

Next.js 15 + Supabase + Prisma automotive marketplace with admin, vendor, and buyer roles.

## Quick Start

1. Install dependencies: `npm install`
   - If you pulled recent changes, run `npm install` again to add `jose` used by `middleware.ts`.
2. Copy `.env.example` to `.env.local`
3. Run dev server: `npm run dev`
4. Open `http://localhost:3000`

## Project Structure

```
ghuri-automobiles/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register, reset password)
│   ├── (public)/          # Public pages (home, listings, about, contact)
│   ├── admin/             # Admin panel routes
│   ├── api/               # API endpoints
│   ├── dashboard/         # User dashboards (buyer, vendor, seller)
│   ├── vendor/            # Vendor onboarding & profile
│   └── layout.tsx         # Root layout
│
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Auth form components
│   ├── dashboard/        # Dashboard UI components
│   ├── forms/            # Reusable form components
│   ├── common/           # Shared components (header, footer, etc.)
│   ├── vendor/           # Vendor-specific components
│   └── (individual .tsx) # Legacy: to be reorganized
│
├── lib/                   # Utilities & helpers
│   ├── auth/             # Auth logic (credentials, JWT, profiles)
│   ├── api/              # API client helpers
│   ├── db/               # Database helpers
│   ├── config/           # App configurations
│   ├── utils/            # General utilities
│   └── (individual .ts)  # Legacy: to be reorganized
│
├── prisma/               # Database schema & migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/               # Static assets
├── docs/                 # Documentation
├── config/               # Root-level configs (to create)
└── package.json
```

## Production Database Setup

1. Supabase Session pooler → `DATABASE_URL`
2. Supabase Direct connection → `DIRECT_URL`
3. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only
4. Run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
5. Verify build: `npm run build`

## Features

- ✅ Multi-role auth (Buyer, Vendor, Admin)
- ✅ Admin tier system (Super, Vendor, Basic)
- ✅ Vendor approval workflow
- ✅ Secure password-based sign-in
- ✅ Role-based dashboards
- ✅ JWT-based authorization
- ⏳ Change password + hardcoded admin cleanup
- ⏳ Rate limiting, 2FA, audit logs

## Sentry configuration

If you enable Sentry for error monitoring, configure the following environment variables instead of committing secrets:

- `SENTRY_DSN` — server-side DSN (used by `sentry.server.config.ts` / edge/server).
- `NEXT_PUBLIC_SENTRY_DSN` — client-side DSN (used by `instrumentation-client.ts`).
- `SENTRY_TRACES_SAMPLE_RATE` — server-side traces sample rate (e.g. `0.1`).
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` — client-side traces sample rate (e.g. `0.0`).
- `SENTRY_ORG` and `SENTRY_PROJECT` — optional, used by the Sentry build plugin if you upload source maps.

Do NOT commit auth tokens or `.env.sentry-build-plugin`. Keep tokens in your CI/CD or local environment (e.g., `.env.local`) and never push them to the repo.

Example (local `.env.local`):

```
NEXT_PUBLIC_SENTRY_DSN=https://<public_key>@o12345.ingest.sentry.io/12345
SENTRY_DSN=https://<server_key>@o12345.ingest.sentry.io/12345
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0
SENTRY_TRACES_SAMPLE_RATE=0.05
```

Restart the dev server after changing environment variables.