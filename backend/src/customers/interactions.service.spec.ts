import { InteractionChannel, InteractionType } from '@prisma/client';
import { InteractionsService } from './interactions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InteractionsService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let service: InteractionsService;

  beforeEach(() => {
    prisma = {
      interaction: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    service = new InteractionsService(prisma);
  });

  it('logs a new interaction scoped to organization and customer', async () => {
    prisma.interaction.create.mockResolvedValue({
      id: 'int_1',
      organizationId: 'org_1',
      customerProfileId: 'cust_1',
    } as any);

    await service.logInteraction('org_1', 'cust_1', {
      createdByUserId: 'user_1',
      interactionType: InteractionType.NOTE,
      channel: InteractionChannel.OTHER,
      title: 'Manual note',
      body: 'Spoke to member about renewal.',
    });

    expect(prisma.interaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org_1',
          customerProfileId: 'cust_1',
          createdByUserId: 'user_1',
          interactionType: InteractionType.NOTE,
          channel: InteractionChannel.OTHER,
        }),
      }),
    );
  });

  it('lists interactions for a customer ordered by date', async () => {
    prisma.interaction.findMany.mockResolvedValue([]);

    await service.listInteractions('org_1', 'cust_1');

    expect(prisma.interaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 'org_1',
          customerProfileId: 'cust_1',
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: expect.objectContaining({
          createdByUser: true,
          relatedEmail: true,
          relatedSms: true,
        }),
      }),
    );
  });
});
