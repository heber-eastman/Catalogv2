import { CustomerStatus } from '@prisma/client';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      customerProfile: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    service = new CustomersService(prisma);
  });

  it('creates a customer scoped to an organization', async () => {
    const dto = {
      firstName: 'Anna',
      lastName: 'Smith',
      status: CustomerStatus.ACTIVE,
      primaryEmail: 'anna@example.com',
    };

    prisma.customerProfile.create.mockResolvedValue({
      id: 'cust_1',
      organizationId: 'org_1',
      ...dto,
    } as any);

    await service.createCustomer('org_1', dto);

    expect(prisma.customerProfile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org_1',
          firstName: 'Anna',
          status: CustomerStatus.ACTIVE,
        }),
      }),
    );
  });

  it('builds OR filters when searching by name/email/phone', async () => {
    prisma.customerProfile.findMany.mockResolvedValue([]);
    await service.listCustomers('org_1', { search: 'anna' });

    expect(prisma.customerProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: 'org_1',
          OR: expect.arrayContaining([
            expect.objectContaining({
              firstName: expect.objectContaining({ contains: 'anna' }),
            }),
            expect.objectContaining({
              primaryEmail: expect.objectContaining({ contains: 'anna' }),
            }),
          ]),
        }),
      }),
    );
  });

  it('filters by status, location, and membership presence', async () => {
    prisma.customerProfile.findMany.mockResolvedValue([]);

    await service.listCustomers('org_1', {
      statuses: [CustomerStatus.ACTIVE],
      locationId: 'loc_1',
      hasMembership: true,
    });

    expect(prisma.customerProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: [CustomerStatus.ACTIVE] },
          primaryLocationId: 'loc_1',
          memberships: { some: {} },
        }),
      }),
    );
  });

  it('supports filtering by multiple locations and membership plans', async () => {
    prisma.customerProfile.findMany.mockResolvedValue([]);

    await service.listCustomers('org_1', {
      locationIds: ['loc_1', 'loc_2'],
      membershipPlanIds: ['plan_1', 'plan_2'],
    });

    expect(prisma.customerProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          primaryLocationId: { in: ['loc_1', 'loc_2'] },
          memberships: {
            some: {
              membershipPlanId: { in: ['plan_1', 'plan_2'] },
            },
          },
        }),
      }),
    );
  });

  it('filters by tags array using hasSome', async () => {
    prisma.customerProfile.findMany.mockResolvedValue([]);

    await service.listCustomers('org_1', {
      tags: ['vip', 'golf'],
    });

    expect(prisma.customerProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tags: { hasSome: ['vip', 'golf'] },
        }),
      }),
    );
  });
});
