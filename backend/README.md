# Catalog Backend

NestJS + Prisma service that powers the Catalog frontend.

## Prerequisites

- PostgreSQL database (`DATABASE_URL`)
- Clerk JWT public key (`CLERK_JWT_PUBLIC_KEY`)
- Optional providers: Resend (`RESEND_API_KEY`), AWS S3 (`S3_BUCKET_NAME`, `S3_REGION`)
- `PLATFORM_DOMAIN` for multi-tenant subdomain parsing (e.g. `catalog.localhost`)

## Getting Started

```bash
cd backend
npm install
cp env.example .env  # create and populate your environment

npm run prisma:migrate dev
npm run start:dev
```

## Seeding a Local Organization & Staff User

The auth + org guards expect:

1. A `user` row with a Clerk `clerkUserId`.
2. An `organization` with a unique slug.
3. An `organization_user` entry linking the two.

Use the seed script after you know your Clerk User ID (copy it from the Clerk Dashboard → Users).

```bash
SEED_CLERK_USER_ID=usr_123 \
SEED_USER_EMAIL=you@example.com \
SEED_USER_NAME="You" \
SEED_ORG_NAME="Local Club" \
SEED_ORG_SLUG=localclub \
SEED_LOCATION_NAME="Main Clubhouse" \
SEED_LOCATION_CODE=MAIN \
npm run db:seed
```

Environment variables:

- `SEED_CLERK_USER_ID` (**required**) – the Clerk `sub` for your staff user.
- `SEED_USER_EMAIL`, `SEED_USER_NAME` – optional overrides.
- `SEED_ORG_NAME`, `SEED_ORG_SLUG` – org record; use the same slug in `VITE_ORGANIZATION_SLUG`.
- `SEED_LOCATION_NAME`, `SEED_LOCATION_CODE` – initial active location code.
- `SEED_ORG_ROLE` – defaults to `ORG_ADMIN`; set to `ORG_STAFF` if needed.

The script is idempotent and safe to rerun. Once it completes, you can log in through the frontend and the guards will authorize requests for that organization.

## Scripts

- `npm run start:dev` – start Nest in watch mode.
- `npm run prisma:migrate dev` – run migrations.
- `npm run db:seed` – execute the seeding routine described above.
- `npm run test` / `npm run test:e2e` – Jest unit and e2e tests.
