# Catalog V2

This repository now holds both the existing frontend prototype and the new multi-tenant backend. The UI bundle lives under `frontend/` and the NestJS API lives under `backend/`.

## Structure

- `frontend/` – Vite/React prototype generated from the Figma handoff. This now consumes the live backend APIs.
- `backend/` – NestJS modular monolith with Prisma, Clerk auth, Resend, and AWS S3 integrations.

## Frontend quick start

```bash
cd frontend
npm install
npm run dev
```

### Frontend scripts

```bash
npm run lint        # ESLint (flat config) with Vite globals + React hooks/a11y rules
npm run typecheck   # Strict TypeScript project check (tsc --noEmit)
npm run test        # Vitest (passes with no tests for now)
npm run build       # Vite production build
```

Key variables (see `frontend/README.md` for details):

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL` (default `http://localhost:3000/api`)
- `VITE_ORGANIZATION_SLUG` (tenant slug while developing locally)

## Backend quick start

```bash
cd backend
npm install

# configure Clerk, database, S3, Resend, etc.
cp env.example .env

npm run prisma:migrate dev
npm run start:dev
```

### Backend scripts

```bash
npm run lint   # ESLint + Prettier (auto-fixes formatting in place)
npm run test   # Jest unit + e2e suites
npm run build  # nest build
```

Important variables:

- `DATABASE_URL`
- `CLERK_JWT_PUBLIC_KEY`
- `RESEND_API_KEY`
- `S3_BUCKET_NAME` / `S3_REGION`
- `PLATFORM_DOMAIN` (e.g. `catalog.localhost`)

### Seed a local organization + staff user

1. Sign in once through the frontend so Clerk creates the corresponding user record.
2. Copy the Clerk User ID (`sub`) from the Clerk Dashboard (**Users → your account**).
3. Run the seed script with the required ID and any optional overrides:

```bash
cd backend
SEED_CLERK_USER_ID=usr_123 \
SEED_USER_EMAIL=you@example.com \
SEED_USER_NAME="You" \
SEED_ORG_NAME="Local Club" \
SEED_ORG_SLUG=localclub \
SEED_LOCATION_NAME="Main Clubhouse" \
SEED_LOCATION_CODE=MAIN \
npm run db:seed
```

The slug you choose here must match `VITE_ORGANIZATION_SLUG` (or the `X-Catalog-Organization` header) so the org guard can resolve the tenant. The script is idempotent, so you can re-run it whenever you change any of the seed values.
