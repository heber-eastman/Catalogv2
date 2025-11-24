import {
  OrganizationRole,
  PrismaClient,
  UserType,
} from '@prisma/client';

const prisma = new PrismaClient();

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const clerkUserId = requireEnv('SEED_CLERK_USER_ID');
  const userEmail = process.env.SEED_USER_EMAIL ?? 'staff@example.com';
  const userName = process.env.SEED_USER_NAME ?? 'Local Staff';
  const orgName = process.env.SEED_ORG_NAME ?? 'Local Club';
  const orgSlug = process.env.SEED_ORG_SLUG ?? 'localclub';
  const organizationRole =
    (process.env.SEED_ORG_ROLE as OrganizationRole) ?? OrganizationRole.ORG_ADMIN;
  const locationName = process.env.SEED_LOCATION_NAME ?? 'Main Clubhouse';
  const locationCode = process.env.SEED_LOCATION_CODE ?? 'MAIN';

  console.log('Seeding user + organization context...');

  const user = await prisma.user.upsert({
    where: { clerkUserId },
    update: { email: userEmail, name: userName },
    create: {
      clerkUserId,
      email: userEmail,
      name: userName,
      userType: UserType.STAFF,
    },
  });

  const organization = await prisma.organization.upsert({
    where: { slug: orgSlug },
    update: { name: orgName },
    create: {
      name: orgName,
      slug: orgSlug,
    },
  });

  await prisma.organizationUser.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id,
      },
    },
    update: { role: organizationRole },
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: organizationRole,
    },
  });

  await prisma.location.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: locationCode,
      },
    },
    update: {
      name: locationName,
      isActive: true,
    },
    create: {
      organizationId: organization.id,
      name: locationName,
      code: locationCode,
      isActive: true,
    },
  });

  console.log(
    `Seed complete. Organization "${orgName}" (${orgSlug}) linked to ${userEmail}.`,
  );
  console.log('Use this slug for VITE_ORGANIZATION_SLUG and X-Catalog-Organization.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

