import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Organization,
  OrganizationRole,
  OrganizationUser,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const ALLOWED_ROLES = [OrganizationRole.ORG_ADMIN, OrganizationRole.ORG_STAFF];

@Injectable()
export class OrganizationsService {
  private readonly platformDomain: string | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.platformDomain =
      this.configService.get<string>('PLATFORM_DOMAIN') ?? null;
  }

  extractSubdomain(host?: string): string | null {
    if (!host) return null;

    const normalized = host.split(':')[0]?.toLowerCase();
    if (!normalized) {
      return null;
    }

    if (this.platformDomain && normalized.endsWith(this.platformDomain)) {
      const suffix = `.${this.platformDomain}`;
      if (!normalized.endsWith(suffix)) {
        return null;
      }
      const candidate = normalized.slice(0, normalized.length - suffix.length);
      return candidate || null;
    }

    const segments = normalized.split('.');
    if (segments.length < 2) {
      return null;
    }
    return segments[0];
  }

  async resolveOrganizationForUser(
    slug: string,
    userId: string,
  ): Promise<{
    organization: Organization;
    membership: OrganizationUser;
  }> {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const membership = await this.prisma.organizationUser.findFirst({
      where: {
        organizationId: organization.id,
        userId,
        role: { in: ALLOWED_ROLES },
      },
    });

    if (!membership) {
      throw new ForbiddenException('User is not authorized for organization');
    }

    return { organization, membership };
  }

  async ensureRequestContext(
    host: string | undefined,
    userId: string,
    explicitSlug?: string | null,
  ) {
    const slug = explicitSlug?.trim() || this.extractSubdomain(host);
    if (!slug) {
      throw new UnauthorizedException('Tenant host missing');
    }

    return this.resolveOrganizationForUser(slug, userId);
  }
}
