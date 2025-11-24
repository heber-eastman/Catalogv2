import { MembershipStatus } from '@prisma/client';
import { MembershipsService } from './memberships.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MembershipsService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let service: MembershipsService;

  beforeEach(() => {
    prisma = {
      membership: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    service = new MembershipsService(prisma);
  });

  it('assigns a membership plan to the head of household', async () => {
    prisma.membership.create.mockResolvedValue({
      id: 'mem_1',
      organizationId: 'org_1',
      headCustomerProfileId: 'cust_head',
      membershipPlanId: 'plan_basic',
    } as any);

    await service.assignMembership('org_1', 'cust_head', {
      membershipPlanId: 'plan_basic',
      startDate: new Date('2024-01-01'),
      status: MembershipStatus.ACTIVE,
    });

    expect(prisma.membership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org_1',
          headCustomerProfileId: 'cust_head',
          membershipPlanId: 'plan_basic',
          status: MembershipStatus.ACTIVE,
        }),
      }),
    );
  });

  it('updates membership status, reasons, and dates', async () => {
    prisma.membership.findFirst.mockResolvedValue({
      id: 'mem_1',
      organizationId: 'org_1',
      headCustomerProfileId: 'cust_head',
    } as any);

    await service.updateMembership('org_1', 'cust_head', 'mem_1', {
      status: MembershipStatus.CANCELLED,
      cancelReasonId: 'reason_cancel',
      endDate: new Date('2024-02-01'),
      freezeStartDate: new Date('2024-01-15'),
      freezeEndDate: new Date('2024-01-31'),
    });

    expect(prisma.membership.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'mem_1' },
        data: expect.objectContaining({
          status: MembershipStatus.CANCELLED,
          cancelReasonId: 'reason_cancel',
          endDate: new Date('2024-02-01'),
          freezeStartDate: new Date('2024-01-15'),
          freezeEndDate: new Date('2024-01-31'),
        }),
      }),
    );
  });

  it('throws when updating a membership that does not belong to the head', async () => {
    prisma.membership.findFirst.mockResolvedValue(null);

    await expect(
      service.updateMembership('org_1', 'cust_head', 'mem_404', {
        status: MembershipStatus.CANCELLED,
      }),
    ).rejects.toThrow('Membership not found');
  });
});
