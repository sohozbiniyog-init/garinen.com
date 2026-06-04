# Security Policy

## Supported Versions

This repository currently supports the latest `main` branch and the production deployment built from it.

Security fixes are applied to the active branch first. If a vulnerability affects released code, we patch the current branch and rotate any exposed credentials before redeploying.

## Preferred Reporting Channel

Use a private GitHub Security Advisory for this repository as the primary reporting channel.

If the advisory flow is unavailable, do not open a public issue or discussion. Keep the report private and share only with repository maintainers through a private channel.

## Reporting a Vulnerability

Report issues involving any of the following:
- leaked environment variables or credentials
- Supabase auth, JWT, or role-claim bypasses
- Prisma or database permission problems
- unauthorized file upload or storage access
- broken access control in admin, vendor, buyer, or API routes
- sensitive data exposure in logs, pages, or API responses

When reporting, include:
- a short summary of the issue
- affected route, page, or API endpoint
- steps to reproduce
- impact summary
- proof of concept if safe to share privately
Do not publish exploit details publicly until the issue is fixed and credentials have been rotated.

## Security Expectations for This Project

This platform is a Next.js 15 automotive marketplace with Supabase, Prisma, and role-based access control. The following controls are expected:

- `SUPABASE_SERVICE_ROLE_KEY` must remain server-side only.
- `NEXT_PUBLIC_*` variables must never contain secrets.
- `DATABASE_URL` and `DIRECT_URL` must only point to trusted production or staging databases.
- Admin, vendor, and buyer routes must enforce authorization on the server, not only in the UI.
- Middleware must rely on JWT claims or session checks, not direct database access in Edge runtime.
- Password reset, signup, and vendor approval flows must validate ownership and role before changing state.
- File uploads must be restricted by type, size, and destination, and must not expose private storage paths.
- Logs must not print tokens, passwords, service-role keys, or raw session payloads.

## If a Secret Was Exposed

If a secret, token, or password is exposed in git history, logs, or deployment output:

1. Revoke or rotate the secret immediately.
2. Remove the secret from the affected file, commit, or release artifact.
3. Rewrite git history if the secret was committed.
4. Redeploy with the new credential.
5. Review related logs and access records for suspicious use.

## Scope

This policy covers the full repository, including:

- `app/` route handlers and pages
- `components/` UI that may surface sensitive data
- `lib/` auth, database, and Supabase helpers
- `prisma/` schema, seed files, and migrations
- `scripts/` maintenance and bootstrap utilities
