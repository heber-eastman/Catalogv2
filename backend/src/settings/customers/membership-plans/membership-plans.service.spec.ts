import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MembershipPlansService } from './membership-plans.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('MembershipPlansService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let service: MembershipPlansService;

  beforeEach(() => {
    const transactionMock = jest.fn<
      ReturnType<PrismaService['$transaction']>,
      Parameters<PrismaService['$transaction']>
    >();

    prisma = {
      membershipPlan: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
      membershipPlanLocation: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      $transaction: transactionMock,
    } as unknown as jest.Mocked<PrismaService>;

    transactionMock.mockImplementation(async (fn) => fn(prisma));

    service = new MembershipPlansService(prisma);
  });

  it('lists plans scoped by organization', async () => {
    prisma.membershipPlan.findMany.mockResolvedValue([]);
    await service.listPlans('org_1');
    expect(prisma.membershipPlan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: 'org_1' },
      }),
    );
  });

  it('creates a plan with cents pricing and defaults', async () => {
    prisma.membershipPlan.create.mockResolvedValue({
      id: 'plan_1',
    } as any);

    await service.createPlan('org_1', {
      name: 'Premium',
      cadence: 'MONTHLY',
      priceCents: 25000,
      termType: 'EVERGREEN',
    });

    expect(prisma.membershipPlan.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org_1',
          priceCents: 25000,
          currency: 'USD',
        }),
      }),
    );
  });

  it('throws when validation fails', async () => {
    await expect(
      service.createPlan('org_1', {
        name: '',
        cadence: 'MONTHLY',
        priceCents: -10,
        termType: 'EVERGREEN',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('requires plan to belong to org when updating', async () => {
    prisma.membershipPlan.findFirst.mockResolvedValue({
      id: 'plan_1',
      name: 'Premium',
      priceCents: 1000,
      cadence: 'MONTHLY',
      termType: 'EVERGREEN',
      scopeType: 'ORG_WIDE',
    } as any);
    prisma.membershipPlan.update.mockResolvedValue({} as any);
    prisma.membershipPlan.findUnique.mockResolvedValue({} as any);

    await service.updatePlan('org_1', 'plan_1', {
      name: 'Updated',
      priceCents: 2000,
    });

    expect(prisma.membershipPlan.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'plan_1', organizationId: 'org_1' },
      }),
    );
    expect(prisma.membershipPlan.update).toHaveBeenCalled();
  });

  it('throws when updating plan outside organization', async () => {
    prisma.membershipPlan.findFirst.mockResolvedValue(null);

    await expect(
      service.updatePlan('org_1', 'plan_2', { name: 'New Name' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
