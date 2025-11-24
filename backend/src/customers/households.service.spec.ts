import { ConflictException, NotFoundException } from '@nestjs/common';
import { HouseholdsService } from './households.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HouseholdsService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let service: HouseholdsService;

  beforeEach(() => {
    prisma = {
      household: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      householdMember: {
        create: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    service = new HouseholdsService(prisma);
  });

  it('returns the household when the customer is head or member', async () => {
    const householdRecord = { id: 'house_1' } as any;
    prisma.household.findFirst.mockResolvedValue(householdRecord);

    const result = await service.getHouseholdForCustomer(
      'org_1',
      'cust_member',
    );

    expect(prisma.household.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 'org_1',
          OR: [
            { headCustomerProfileId: 'cust_member' },
            { members: { some: { customerProfileId: 'cust_member' } } },
          ],
        },
        include: expect.any(Object),
      }),
    );
    expect(result).toBe(householdRecord);
  });

  it('creates a household scoped to an organization', async () => {
    prisma.household.findFirst.mockResolvedValue(null);
    prisma.household.create.mockResolvedValue({
      id: 'house_1',
      organizationId: 'org_1',
      headCustomerProfileId: 'cust_head',
    } as any);

    await service.createHousehold('org_1', 'cust_head');

    expect(prisma.household.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org_1',
          headCustomerProfileId: 'cust_head',
        }),
      }),
    );
  });

  it('adds and removes members from an existing household', async () => {
    prisma.household.findFirst.mockResolvedValue({
      id: 'house_1',
      organizationId: 'org_1',
      headCustomerProfileId: 'cust_head',
    } as any);
    prisma.householdMember.findFirst.mockResolvedValue({
      id: 'member_1',
      householdId: 'house_1',
      organizationId: 'org_1',
    } as any);

    await service.addMember('org_1', 'cust_head', {
      customerProfileId: 'cust_child',
      relationship: 'Child',
    });

    expect(prisma.householdMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          householdId: 'house_1',
          customerProfileId: 'cust_child',
          relationship: 'Child',
        }),
      }),
    );

    await service.removeMember('org_1', 'cust_head', 'member_1');

    expect(prisma.householdMember.delete).toHaveBeenCalledWith({
      where: { id: 'member_1' },
    });
  });

  it('prevents multiple households for the same head customer', async () => {
    prisma.household.findFirst.mockResolvedValue({
      id: 'existing',
      organizationId: 'org_1',
      headCustomerProfileId: 'cust_head',
    } as any);

    await expect(
      service.createHousehold('org_1', 'cust_head'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws when removing a member that does not exist for the head', async () => {
    prisma.household.findFirst.mockResolvedValue({
      id: 'house_1',
      organizationId: 'org_1',
      headCustomerProfileId: 'cust_head',
    } as any);
    prisma.householdMember.findFirst.mockResolvedValue(null);

    await expect(
      service.removeMember('org_1', 'cust_head', 'member_unknown'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
