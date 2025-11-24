import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { generateKeyPairSync } from 'node:crypto';
import * as jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let config: ConfigService;
  let privateKey: string;
  let publicKey: string;

  beforeAll(() => {
    const keyPair = generateKeyPairSync('rsa', { modulusLength: 2048 });
    privateKey = keyPair.privateKey.export({
      type: 'pkcs1',
      format: 'pem',
    }) as string;
    publicKey = keyPair.publicKey.export({
      type: 'pkcs1',
      format: 'pem',
    }) as string;
  });

  beforeEach(() => {
    prisma = {
      user: {
        upsert: jest.fn().mockResolvedValue({
          id: 'user_1',
          clerkUserId: 'user_1',
          email: 'user@example.com',
          name: 'Test User',
          userType: 'STAFF',
          isPlatformAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    } as unknown as PrismaService;

    config = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'CLERK_JWT_PUBLIC_KEY') {
          return publicKey;
        }
        return null;
      }),
    } as unknown as ConfigService;

    service = new AuthService(config, prisma);
  });

  it('extracts bearer tokens from header', () => {
    const token = service.extractTokenFromHeader('Bearer abc');
    expect(token).toBe('abc');
  });

  it('verifies JWT tokens using configured key', () => {
    const token = jwt.sign(
      { sub: 'user_1', email: 'user@example.com' },
      privateKey,
      { algorithm: 'RS256' },
    );

    const claims = service.verifyToken(token);
    expect(claims.sub).toBe('user_1');
  });

  it('upserts users from Clerk claims', async () => {
    const result = await service.getOrCreateUserFromClaims({
      sub: 'user_1',
      email: 'user@example.com',
      name: 'Test User',
    });

    expect(prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkUserId: 'user_1' },
        create: expect.objectContaining({
          email: 'user@example.com',
          name: 'Test User',
        }),
      }),
    );
    expect(result.id).toBe('user_1');
  });
});
