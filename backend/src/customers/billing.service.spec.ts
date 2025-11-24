import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BillingService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let service: BillingService;

  beforeEach(() => {
    prisma = {
      billingEvent: {
        findMany: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    service = new BillingService(prisma);
  });

  it('lists billing events scoped by organization and customer', async () => {
    prisma.billingEvent.findMany.mockResolvedValue([]);

    await service.listBillingEvents('org_1', 'cust_1');

    expect(prisma.billingEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 'org_1',
          customerProfileId: 'cust_1',
        },
        orderBy: {
          date: 'desc',
        },
      }),
    );
  });
});
