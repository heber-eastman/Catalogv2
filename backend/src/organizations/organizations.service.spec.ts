import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationsService } from './organizations.service';
import { OrganizationRole } from '@prisma/client';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      organization: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'org_1',
          slug: 'oakmont',
          name: 'Oakmont',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
      organizationUser: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'org_user_1',
          organizationId: 'org_1',
          userId: 'user_1',
          role: OrganizationRole.ORG_ADMIN,
          createdAt: new Date(),
        }),
      },
    } as unknown as PrismaService;

    const config = {
      get: jest.fn().mockReturnValue('catalog.app'),
    } as unknown as ConfigService;

    service = new OrganizationsService(config, prisma);
  });

  it('extracts subdomains from host headers', () => {
    const slug = service.extractSubdomain('oakmont.catalog.app');
    expect(slug).toBe('oakmont');
  });

  it('resolves organization and membership for authorized user', async () => {
    const result = await service.resolveOrganizationForUser(
      'oakmont',
      'user_1',
    );
    expect(result.organization.slug).toBe('oakmont');
    expect(result.membership.role).toBe(OrganizationRole.ORG_ADMIN);
  });

  it('falls back to explicit slug header when host missing', async () => {
    const context = await service.ensureRequestContext(
      undefined,
      'user_1',
      'oakmont',
    );
    expect(context.organization.slug).toBe('oakmont');
  });

  it('throws when slug cannot be derived', async () => {
    await expect(
      service.ensureRequestContext(undefined, 'user_1'),
    ).rejects.toThrow('Tenant host missing');
  });
});
