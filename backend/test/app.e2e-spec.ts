import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { generateKeyPairSync } from 'node:crypto';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../src/prisma/prisma.service';
import { OrganizationRole, UserType } from '@prisma/client';

type UserRecord = {
  id: string;
  clerkUserId: string;
  email: string;
  name: string | null;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
};

type OrganizationRecord = {
  id: string;
  slug: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type OrganizationUserRecord = {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  createdAt: Date;
};

const createInMemoryPrisma = () => {
  const users: UserRecord[] = [];
  const organizations: OrganizationRecord[] = [];
  const organizationUsers: OrganizationUserRecord[] = [];

  const id = (prefix: string) =>
    `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

  const userApi = {
    async deleteMany() {
      const count = users.length;
      users.length = 0;
      return { count };
    },
    async create({ data }) {
      const record: UserRecord = {
        id: id('user'),
        createdAt: new Date(),
        updatedAt: new Date(),
        name: data.name ?? null,
        ...data,
      };
      users.push(record);
      return record;
    },
    async upsert({ where, create, update }) {
      const existing = users.find((u) => u.clerkUserId === where.clerkUserId);
      if (existing) {
        Object.assign(existing, update, { updatedAt: new Date() });
        return existing;
      }
      return userApi.create({ data: create });
    },
  };

  const organizationApi = {
    async deleteMany() {
      const count = organizations.length;
      organizations.length = 0;
      return { count };
    },
    async create({ data }) {
      const record: OrganizationRecord = {
        id: id('org'),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      organizations.push(record);
      return record;
    },
    async findUnique({ where }) {
      return organizations.find((org) => org.slug === where.slug) ?? null;
    },
  };

  const organizationUserApi = {
    async deleteMany() {
      const count = organizationUsers.length;
      organizationUsers.length = 0;
      return { count };
    },
    async create({ data }) {
      const record: OrganizationUserRecord = {
        id: id('orguser'),
        createdAt: new Date(),
        ...data,
      };
      organizationUsers.push(record);
      return record;
    },
    async findFirst({ where }) {
      return (
        organizationUsers.find(
          (membership) =>
            membership.organizationId === where.organizationId &&
            membership.userId === where.userId &&
            (!where.role?.in || where.role.in.includes(membership.role)),
        ) ?? null
      );
    },
  };

  return {
    user: userApi,
    organization: organizationApi,
    organizationUser: organizationUserApi,
  };
};

describe('Protected health endpoint (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;
  let hostHeader: string;

  beforeAll(async () => {
    const keyPair = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const privateKey = keyPair.privateKey.export({
      type: 'pkcs1',
      format: 'pem',
    }) as string;
    const publicKey = keyPair.publicKey.export({
      type: 'pkcs1',
      format: 'pem',
    }) as string;

    process.env.CLERK_JWT_PUBLIC_KEY = publicKey;
    process.env.PLATFORM_DOMAIN = 'catalog.app';

    const prismaMock = createInMemoryPrisma();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock as unknown as PrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = prismaMock as unknown as PrismaService;

    await prisma.organizationUser.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();

    const organization = await prisma.organization.create({
      data: {
        name: 'Oakmont Fitness',
        slug: 'oakmont',
      },
    });

    const user = await prisma.user.create({
      data: {
        clerkUserId: 'user_123',
        email: 'demo@catalog.dev',
        name: 'Demo User',
        userType: 'STAFF',
      },
    });

    await prisma.organizationUser.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: OrganizationRole.ORG_ADMIN,
      },
    });

    token = jwt.sign(
      {
        sub: 'user_123',
        email: 'demo@catalog.dev',
        name: 'Demo User',
      },
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: '5m',
      },
    );

    hostHeader = 'oakmont.catalog.app';
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects requests without auth header', async () => {
    await request(app.getHttpServer())
      .get('/api/health')
      .set('Host', hostHeader)
      .expect(401);
  });

  it('allows requests with valid auth + tenant', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .set('Host', hostHeader)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.status).toBe('ok');
  });
});
