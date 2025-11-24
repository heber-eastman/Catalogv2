import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StatusReasonsService } from './status-reasons.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('StatusReasonsService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let service: StatusReasonsService;

  beforeEach(() => {
    prisma = {
      statusReason: {
        findMany: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    service = new StatusReasonsService(prisma);
  });

  it('lists reasons scoped by organization and type', async () => {
    prisma.statusReason.findMany.mockResolvedValue([]);
    await service.listReasons('org_1', 'CANCELLATION');
    expect(prisma.statusReason.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: 'org_1', type: 'CANCELLATION' },
      }),
    );
  });

  it('creates reason with incremented sort order', async () => {
    prisma.statusReason.count.mockResolvedValue(2);
    prisma.statusReason.create.mockResolvedValue({ id: 'reason_1' } as any);

    await service.createReason('org_1', {
      type: 'CANCELLATION',
      label: 'Moving',
    });

    expect(prisma.statusReason.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sortOrder: 3,
          label: 'Moving',
        }),
      }),
    );
  });

  it('throws when label missing', async () => {
    await expect(
      service.createReason('org_1', {
        type: 'CANCELLATION',
        label: '',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('requires ownership when updating', async () => {
    prisma.statusReason.findFirst.mockResolvedValue({
      id: 'reason_1',
      organizationId: 'org_1',
      label: 'Moving',
      type: 'CANCELLATION',
      sortOrder: 1,
    } as any);
    prisma.statusReason.update.mockResolvedValue({} as any);

    await service.updateReason('org_1', 'reason_1', {
      label: 'Updated',
      sortOrder: 2,
    });

    expect(prisma.statusReason.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'reason_1', organizationId: 'org_1' },
      }),
    );
    expect(prisma.statusReason.update).toHaveBeenCalled();
  });

  it('throws when deleting a missing reason', async () => {
    prisma.statusReason.findFirst.mockResolvedValue(null);

    await expect(
      service.deleteReason('org_1', 'reason_1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
