import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

export interface ClerkTokenClaims extends jwt.JwtPayload {
  sub: string;
  email?: string;
  email_address?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly publicKey: string | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.publicKey =
      this.configService.get<string>('CLERK_JWT_PUBLIC_KEY') ?? null;
  }

  extractTokenFromHeader(authorizationHeader?: string): string {
    if (!authorizationHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    return token;
  }

  verifyToken(token: string): ClerkTokenClaims {
    if (!this.publicKey) {
      this.logger.error('CLERK_JWT_PUBLIC_KEY is not configured');
      throw new UnauthorizedException('Auth configuration missing');
    }

    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      }) as ClerkTokenClaims;
    } catch (error) {
      this.logger.warn('JWT verification failed', { error });
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getOrCreateUserFromClaims(claims: ClerkTokenClaims): Promise<User> {
    const clerkUserId = claims.sub;
    if (!clerkUserId) {
      throw new UnauthorizedException('Token missing subject');
    }

    this.logger.debug(`Authenticated Clerk user ${clerkUserId}`);

    const email =
      claims.email ?? claims.email_address ?? `${clerkUserId}@clerk.local`;
    const name =
      claims.name ??
      [claims.first_name, claims.last_name]
        .filter((part) => !!part)
        .join(' ')
        .trim() ??
      null;

    const data: Prisma.UserCreateInput = {
      clerkUserId,
      email,
      name,
      userType: 'STAFF',
    };

    return this.prisma.user.upsert({
      where: { clerkUserId },
      create: data,
      update: {
        email,
        name,
      },
    });
  }
}
